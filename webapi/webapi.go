package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"sydneyqt/sydney"
	"sydneyqt/util"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	// read envs
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	proxy := os.Getenv("HTTPS_PROXY")
	if proxy == "" {
		proxy = os.Getenv("HTTP_PROXY")
	}

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "*"
	}

	noLog := os.Getenv("NO_LOG") != ""

	defaultCookies := ParseCookies(os.Getenv("DEFAULT_COOKIES"))
	if len(defaultCookies) == 0 {
		slog.Info("DEFAULT_COOKIES not set, reading from cookies.json")
		defaultCookies, _ = util.ReadCookiesFile()
		if len(defaultCookies) == 0 {
			slog.Warn("cookies.json not found, using empty cookies")
		}
	} else {
		slog.Info("DEFAULT_COOKIES set, cookies.json will be ignored")
	}

	authToken := os.Getenv("AUTH_TOKEN")

	// create router
	r := chi.NewRouter()

	// set middleware
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)
	if !noLog {
		r.Use(middleware.Logger)
	}
	// handle CORS and preflight requests
	r.Use(func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
			w.Header().Set("Access-Control-Allow-Methods", "*")
			w.Header().Set("Access-Control-Allow-Headers", "*")
			w.Header().Set("Access-Control-Max-Age", "86400")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			h.ServeHTTP(w, r)
		})
	})
	// auth middleware
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if authToken == "" {
				next.ServeHTTP(w, r)
				return
			}
			if r.Header.Get("Authorization") != "Bearer "+authToken {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	// add handlers
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		// set headers
		w.Header().Set("Content-Type", "text/plain; charset=UTF-8")

		// write response
		fmt.Fprint(w, "OK")
	})

	r.Post("/image/upload", func(w http.ResponseWriter, r *http.Request) {
		// parse request
		r.ParseMultipartForm(16 << 20)

		cookiesStr := r.FormValue("cookies")
		cookies := util.Ternary(cookiesStr == "", defaultCookies, ParseCookies(cookiesStr))

		file, _, err := r.FormFile("file")
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		defer file.Close()

		bytes, err := io.ReadAll(file)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// upload image
		imgUrl, err := sydney.
			NewSydney(sydney.Options{
				Cookies: cookies,
				Proxy:   proxy,
			}).
			UploadImage(bytes)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// set headers
		w.Header().Set("Content-Type", "text/plain; charset=UTF-8")

		// write response
		fmt.Fprint(w, imgUrl)
	})

	r.Post("/image/create", func(w http.ResponseWriter, r *http.Request) {
		var request CreateImageRequest

		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		cookies := util.Ternary(request.Cookies == "", defaultCookies, ParseCookies(request.Cookies))

		// create image
		image, err := sydney.
			NewSydney(sydney.Options{
				Cookies:           cookies,
				Proxy:             proxy,
				ConversationStyle: "Creative",
			}).
			GenerateImage(request.Image)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// set headers
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		// write response
		json.NewEncoder(w).Encode(image)
	})

	r.Post("/chat/stream", func(w http.ResponseWriter, r *http.Request) {
		// parse request
		request := ChatStreamRequest{
			ConversationStyle: "Creative",
		}

		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		cookies := util.Ternary(request.Cookies == "", defaultCookies, ParseCookies(request.Cookies))

		sydneyAPI := sydney.NewSydney(sydney.Options{
			Cookies:           cookies,
			Proxy:             proxy,
			ConversationStyle: request.ConversationStyle,
			NoSearch:          request.NoSearch,
			GPT4Turbo:         request.UseGPT4Turbo,
			UseClassic:        request.UseClassic,
			Plugins:           request.Plugins,
		})

		// stream chat
		messageCh, err := sydneyAPI.AskStream(sydney.AskStreamOptions{
			StopCtx:        r.Context(),
			Prompt:         request.Prompt,
			WebpageContext: request.WebpageContext,
			ImageURL:       request.ImageURL,
		})
		if err != nil {
			http.Error(w, "error creating conversation: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// set headers
		w.Header().Set("Content-Type", "text/event-stream; charset=UTF-8")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		// write response
		for message := range messageCh {
			encoded, _ := json.Marshal(message.Text)
			fmt.Fprintf(w, "event: %s\ndata: %s\n\n", message.Type, encoded)
			if f, ok := w.(http.Flusher); ok {
				f.Flush()
			}
		}
	})

	r.Post("/v1/chat/completions", func(w http.ResponseWriter, r *http.Request) {
		// parse request
		var request OpenAIChatCompletionRequest

		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		parsedMessages, err := ParseOpenAIMessages(request.Messages)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		cookiesStr := r.Header.Get("Cookie")
		cookies := util.Ternary(cookiesStr == "", defaultCookies, ParseCookies(cookiesStr))

		conversationStyle := util.Ternary(
			strings.HasPrefix(request.Model, "gpt-3.5-turbo"), "Balanced", "Creative")

		sydneyAPI := sydney.NewSydney(sydney.Options{
			Cookies:           cookies,
			Proxy:             proxy,
			ConversationStyle: conversationStyle,
			Locale:            "id-ID",
			NoSearch:          false,
			GPT4Turbo:         true,
		})

		messageCh, err := sydneyAPI.AskStream(sydney.AskStreamOptions{
			StopCtx:        r.Context(),
			Prompt:         parsedMessages.Prompt,
			WebpageContext: parsedMessages.WebpageContext,
			ImageURL:       parsedMessages.ImageURL,
		})
		if err != nil {
			http.Error(w, "error creating conversation: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// handle non-stream
		if !request.Stream {
			// set headers
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")

			// write response
			var replyBuilder strings.Builder
			errored := false

			for message := range messageCh {
				switch message.Type {
				case sydney.MessageTypeMessageText:
					replyBuilder.WriteString(message.Text)
				case sydney.MessageTypeError:
					errored = true
					replyBuilder.WriteString("`Error: ")
					replyBuilder.WriteString(message.Text)
					replyBuilder.WriteString("`")
				}
			}

			json.NewEncoder(w).Encode(NewOpenAIChatCompletion(
				conversationStyle,
				replyBuilder.String(),
				util.Ternary(errored, FinishReasonLength, FinishReasonStop),
			))

			return
		}

		// set headers
		w.Header().Set("Content-Type", "text/event-stream; charset=UTF-8")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		// write response
		errored := false

		for message := range messageCh {
			var delta string

			switch message.Type {
			case sydney.MessageTypeMessageText:
				delta = message.Text
			case sydney.MessageTypeError:
				errored = true
				delta = fmt.Sprintf("`Error: %s`", message.Text)
			default:
				continue
			}

			chunk := NewOpenAIChatCompletionChunk(conversationStyle, delta, nil)
			encoded, err := json.Marshal(chunk)
			if err != nil {
				continue
			}

			fmt.Fprintf(w, "data: %s\n\n", encoded)
			if f, ok := w.(http.Flusher); ok {
				f.Flush()
			}
		}

		// write final chunk
		chunk := NewOpenAIChatCompletionChunk(conversationStyle, "", util.Ternary(errored, &FinishReasonLength, &FinishReasonStop))
		encoded, _ := json.Marshal(chunk)
		fmt.Fprintf(w, "data: %s\n\ndata: [DONE]\n", encoded)
	})

	r.Post("/v1/images/generations", func(w http.ResponseWriter, r *http.Request) {
		// parse request
		var request OpenAIImageGenerationRequest

		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		cookiesStr := r.Header.Get("Cookie")
		cookies := util.Ternary(cookiesStr == "", defaultCookies, ParseCookies(cookiesStr))

		sydneyAPI := sydney.NewSydney(sydney.Options{
			Cookies:           cookies,
			Proxy:             proxy,
			ConversationStyle: "Creative",
			Locale:            "en-US",
		})

		// ask stream
		newContext, cancel := context.WithCancel(r.Context())
		defer cancel()

		messageCh, err := sydneyAPI.AskStream(sydney.AskStreamOptions{
			StopCtx:        newContext,
			Prompt:         "Create image for the description: " + request.Prompt,
			WebpageContext: ImageGeneratorContext,
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var generativeImage sydney.GenerativeImage

		for message := range messageCh {
			if message.Type == sydney.MessageTypeGenerativeImage {
				err := json.Unmarshal([]byte(message.Text), &generativeImage)
				if err == nil {
					break
				}
			}
		}
		cancel()

		if generativeImage.URL == "" {
			http.Error(w, "empty generative image", http.StatusInternalServerError)
			return
		}

		// create image
		image, err := sydneyAPI.GenerateImage(generativeImage)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// set headers
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")

		// write response
		json.NewEncoder(w).Encode(ToOpenAIImageGeneration(image))
	})

	// serve the router
	log.Println("Listening on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
