export namespace main {
	
	export class AskOptions {
	    type: number;
	    openai_backend: string;
	    chat_context: string;
	    prompt: string;
	    image_url: string;
	    upload_file_path: string;
	    model: string;
	
	    static createFrom(source: any = {}) {
	        return new AskOptions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.openai_backend = source["openai_backend"];
	        this.chat_context = source["chat_context"];
	        this.prompt = source["prompt"];
	        this.image_url = source["image_url"];
	        this.upload_file_path = source["upload_file_path"];
	        this.model = source["model"];
	    }
	}
	export class ChatFinishResult {
	    success: boolean;
	    err_type: string;
	    err_msg: string;
	
	    static createFrom(source: any = {}) {
	        return new ChatFinishResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.err_type = source["err_type"];
	        this.err_msg = source["err_msg"];
	    }
	}
	export class CheckUpdateResult {
	    need_update: boolean;
	    current_version: string;
	    latest_version: string;
	    release_url: string;
	    release_note: string;
	
	    static createFrom(source: any = {}) {
	        return new CheckUpdateResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.need_update = source["need_update"];
	        this.current_version = source["current_version"];
	        this.latest_version = source["latest_version"];
	        this.release_url = source["release_url"];
	        this.release_note = source["release_note"];
	    }
	}
	export class ConciseAnswerReq {
	    prompt: string;
	    context: string;
	    backend: string;
	
	    static createFrom(source: any = {}) {
	        return new ConciseAnswerReq(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.prompt = source["prompt"];
	        this.context = source["context"];
	        this.backend = source["backend"];
	    }
	}
	export class Migration {
	    sydney_preset_20240304: boolean;
	    theme_color_20240304: boolean;
	    quick_20240326: boolean;
	    quick_20240405: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Migration(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sydney_preset_20240304 = source["sydney_preset_20240304"];
	        this.theme_color_20240304 = source["theme_color_20240304"];
	        this.quick_20240326 = source["quick_20240326"];
	        this.quick_20240405 = source["quick_20240405"];
	    }
	}
	export class OpenAIBackend {
	    name: string;
	    openai_key: string;
	    openai_endpoint: string;
	    openai_short_model: string;
	    openai_long_model: string;
	    openai_threshold: number;
	    openai_temperature: number;
	    frequency_penalty: number;
	    presence_penalty: number;
	    max_tokens: number;
	
	    static createFrom(source: any = {}) {
	        return new OpenAIBackend(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.openai_key = source["openai_key"];
	        this.openai_endpoint = source["openai_endpoint"];
	        this.openai_short_model = source["openai_short_model"];
	        this.openai_long_model = source["openai_long_model"];
	        this.openai_threshold = source["openai_threshold"];
	        this.openai_temperature = source["openai_temperature"];
	        this.frequency_penalty = source["frequency_penalty"];
	        this.presence_penalty = source["presence_penalty"];
	        this.max_tokens = source["max_tokens"];
	    }
	}
	export class DataReference {
	    uuid: string;
	    type: string;
	    data: any;
	
	    static createFrom(source: any = {}) {
	        return new DataReference(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.uuid = source["uuid"];
	        this.type = source["type"];
	        this.data = source["data"];
	    }
	}
	export class Workspace {
	    id: number;
	    title: string;
	    context: string;
	    input: string;
	    backend: string;
	    locale: string;
	    preset: string;
	    conversation_style: string;
	    no_search: boolean;
	    // Go type: time
	    created_at: any;
	    use_classic: boolean;
	    gpt_4_turbo: boolean;
	    persistent_input: boolean;
	    plugins: string[];
	    data_references: DataReference[];
	    model: string;
	
	    static createFrom(source: any = {}) {
	        return new Workspace(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.context = source["context"];
	        this.input = source["input"];
	        this.backend = source["backend"];
	        this.locale = source["locale"];
	        this.preset = source["preset"];
	        this.conversation_style = source["conversation_style"];
	        this.no_search = source["no_search"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.use_classic = source["use_classic"];
	        this.gpt_4_turbo = source["gpt_4_turbo"];
	        this.persistent_input = source["persistent_input"];
	        this.plugins = source["plugins"];
	        this.data_references = this.convertValues(source["data_references"], DataReference);
	        this.model = source["model"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Preset {
	    name: string;
	    content: string;
	
	    static createFrom(source: any = {}) {
	        return new Preset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.content = source["content"];
	    }
	}
	export class Config {
	    debug: boolean;
	    presets: Preset[];
	    enter_mode: string;
	    proxy: string;
	    no_suggestion: boolean;
	    font_family: string;
	    font_size: number;
	    stretch_factor: number;
	    revoke_reply_text: string;
	    revoke_reply_count: number;
	    workspaces: Workspace[];
	    current_workspace_id: number;
	    quick: string[];
	    disable_direct_quick: boolean;
	    open_ai_backends: OpenAIBackend[];
	    wss_domain: string;
	    dark_mode: boolean;
	    no_image_removal_after_chat: boolean;
	    no_file_removal_after_chat: boolean;
	    create_conversation_url: string;
	    theme_color: string;
	    disable_no_search_loader: boolean;
	    bypass_server: string;
	    disable_summary_title_generation: boolean;
	    migration: Migration;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.debug = source["debug"];
	        this.presets = this.convertValues(source["presets"], Preset);
	        this.enter_mode = source["enter_mode"];
	        this.proxy = source["proxy"];
	        this.no_suggestion = source["no_suggestion"];
	        this.font_family = source["font_family"];
	        this.font_size = source["font_size"];
	        this.stretch_factor = source["stretch_factor"];
	        this.revoke_reply_text = source["revoke_reply_text"];
	        this.revoke_reply_count = source["revoke_reply_count"];
	        this.workspaces = this.convertValues(source["workspaces"], Workspace);
	        this.current_workspace_id = source["current_workspace_id"];
	        this.quick = source["quick"];
	        this.disable_direct_quick = source["disable_direct_quick"];
	        this.open_ai_backends = this.convertValues(source["open_ai_backends"], OpenAIBackend);
	        this.wss_domain = source["wss_domain"];
	        this.dark_mode = source["dark_mode"];
	        this.no_image_removal_after_chat = source["no_image_removal_after_chat"];
	        this.no_file_removal_after_chat = source["no_file_removal_after_chat"];
	        this.create_conversation_url = source["create_conversation_url"];
	        this.theme_color = source["theme_color"];
	        this.disable_no_search_loader = source["disable_no_search_loader"];
	        this.bypass_server = source["bypass_server"];
	        this.disable_summary_title_generation = source["disable_summary_title_generation"];
	        this.migration = this.convertValues(source["migration"], Migration);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	export class UploadSydneyDocumentResult {
	    canceled?: boolean;
	    text?: string;
	    ext?: string;
	
	    static createFrom(source: any = {}) {
	        return new UploadSydneyDocumentResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.canceled = source["canceled"];
	        this.text = source["text"];
	        this.ext = source["ext"];
	    }
	}
	export class UploadSydneyImageResult {
	    base64_url: string;
	    bing_url: string;
	    canceled: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UploadSydneyImageResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.base64_url = source["base64_url"];
	        this.bing_url = source["bing_url"];
	        this.canceled = source["canceled"];
	    }
	}
	
	export class YoutubeVideoDetails {
	    title: string;
	    length_seconds: string;
	    description: string;
	    keywords: string[];
	    pic_url: string;
	    author: string;
	
	    static createFrom(source: any = {}) {
	        return new YoutubeVideoDetails(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.length_seconds = source["length_seconds"];
	        this.description = source["description"];
	        this.keywords = source["keywords"];
	        this.pic_url = source["pic_url"];
	        this.author = source["author"];
	    }
	}
	export class YoutubeVideoResult {
	    details: YoutubeVideoDetails;
	    captions: util.YtCustomCaption[];
	
	    static createFrom(source: any = {}) {
	        return new YoutubeVideoResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.details = this.convertValues(source["details"], YoutubeVideoDetails);
	        this.captions = this.convertValues(source["captions"], util.YtCustomCaption);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace sydney {
	
	export class GenerateImageResult {
	    text: string;
	    url: string;
	    image_urls: string[];
	    duration: number;
	
	    static createFrom(source: any = {}) {
	        return new GenerateImageResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.text = source["text"];
	        this.url = source["url"];
	        this.image_urls = source["image_urls"];
	        this.duration = source["duration"];
	    }
	}
	export class GenerateMusicResult {
	    iframeid: string;
	    requestid: string;
	    text: string;
	    cover_img_url: string;
	    music_url: string;
	    video_url: string;
	    duration: number;
	    musical_style: string;
	    title: string;
	    lyrics: string;
	    time_elapsed: number;
	
	    static createFrom(source: any = {}) {
	        return new GenerateMusicResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.iframeid = source["iframeid"];
	        this.requestid = source["requestid"];
	        this.text = source["text"];
	        this.cover_img_url = source["cover_img_url"];
	        this.music_url = source["music_url"];
	        this.video_url = source["video_url"];
	        this.duration = source["duration"];
	        this.musical_style = source["musical_style"];
	        this.title = source["title"];
	        this.lyrics = source["lyrics"];
	        this.time_elapsed = source["time_elapsed"];
	    }
	}
	export class GenerativeImage {
	    text: string;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new GenerativeImage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.text = source["text"];
	        this.url = source["url"];
	    }
	}
	export class GenerativeMusic {
	    iframeid: string;
	    requestid: string;
	    text: string;
	
	    static createFrom(source: any = {}) {
	        return new GenerativeMusic(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.iframeid = source["iframeid"];
	        this.requestid = source["requestid"];
	        this.text = source["text"];
	    }
	}

}

export namespace util {
	
	export class YtCustomCaption {
	    name: string;
	    language_code: string;
	    url: string;
	    is_asr: boolean;
	    is_translated: boolean;
	
	    static createFrom(source: any = {}) {
	        return new YtCustomCaption(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.language_code = source["language_code"];
	        this.url = source["url"];
	        this.is_asr = source["is_asr"];
	        this.is_translated = source["is_translated"];
	    }
	}
	export class YtTranscriptText {
	    start: number;
	    dur: number;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new YtTranscriptText(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.start = source["start"];
	        this.dur = source["dur"];
	        this.value = source["value"];
	    }
	}

}

