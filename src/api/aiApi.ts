import axios from "axios";

export interface AssistantRequest {
  message: string;
  conversation_id: string | null;
  farmer_name: string | null;
  crop: string | null;
  disease: string | null;
  location: string | null;
  language?: string;
}

export interface AssistantResponse {
  request_id: string;
  conversation_id: string | null;
  answer: string;
  provider: string;
  model: string | null;
  generated_at: string;
  safety_notice: string;
}

export interface ApiChatMessage {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSessionResponse {
  conversation_id: string;
  messages: ApiChatMessage[];
}

const API_URL = process.env.EXPO_PUBLIC_AI_API_URL?.trim().replace(/\/+$/, "");
const AI_API_TIMEOUT_MS = 60000; // Render free tier can have cold-start delays up to 50s

const getRequestError = (error: unknown): Error => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error(String(error));
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return new Error(
      "The AI server took too long to respond. Please try again.",
    );
  }

  if (!error.response) {
    return new Error(
      `Could not connect to the AI server at ${API_URL}. Check that this Render service URL is correct, deployed, and reachable.`,
    );
  }

  const body = error.response.data;
  const detail =
    body && typeof body === "object" && "error" in body
      ? String((body as { error: unknown }).error)
      : typeof body === "string"
        ? body
        : error.message;
  return new Error(`AI server error (${error.response.status}): ${detail}`);
};

export const askAssistant = async (
  payload: AssistantRequest,
): Promise<AssistantResponse> => {
  if (!API_URL) {
    throw new Error(
      "AI API URL is not configured. Set EXPO_PUBLIC_AI_API_URL and rebuild the app.",
    );
  }

  const endpoint = `${API_URL}/api/v1/assistant/ask`;

  try {
    const { data } = await axios.post<AssistantResponse>(
      endpoint,
      {
        ...payload,
        language: payload.language || "en",
      },
      {
        timeout: AI_API_TIMEOUT_MS,
        headers: { Accept: "application/json" },
      },
    );
    return data;
  } catch (error) {
    const requestError = getRequestError(error);
    console.error("[aiApi] askAssistant error:", requestError);
    throw requestError;
  }
};

export const getChatHistory = async (
  conversationId: string,
): Promise<ChatSessionResponse> => {
  if (!API_URL) {
    throw new Error(
      "AI API URL is not configured. Set EXPO_PUBLIC_AI_API_URL and rebuild the app.",
    );
  }

  const endpoint = `${API_URL}/api/v1/assistant/chats/${conversationId}`;

  try {
    const { data } = await axios.get<ChatSessionResponse>(endpoint, {
      timeout: AI_API_TIMEOUT_MS,
      headers: { Accept: "application/json" },
    });
    return data;
  } catch (error) {
    const requestError = getRequestError(error);
    console.error("[aiApi] getChatHistory error:", requestError);
    throw requestError;
  }
};

export interface VoiceChatRequest {
  audioUri: string;
  conversationId: string | null;
  languageCode: string; // "hi-IN", or "unknown" to let the server detect it
}

export interface VoiceChatResponse {
  transcript: string;
  detected_language: string;
  answer_text: string;
  audios: string[]; // base64-encoded WAV clips, in playback order
  conversation_id: string | null;
}

// Transcription, the answer and speech synthesis all happen in one request
const VOICE_API_TIMEOUT_MS = 120000;

export const sendVoiceQuestion = async ({
  audioUri,
  conversationId,
  languageCode,
}: VoiceChatRequest): Promise<VoiceChatResponse> => {
  if (!API_URL) {
    throw new Error(
      "AI API URL is not configured. Set EXPO_PUBLIC_AI_API_URL and rebuild the app.",
    );
  }

  const endpoint = `${API_URL}/api/v1/assistant/voice/chat`;
  const formData = new FormData();
  // React Native's FormData accepts { uri, name, type } for a file
  formData.append("audio", {
    uri: audioUri,
    name: "voice.m4a",
    type: "audio/m4a",
  } as unknown as Blob);
  if (conversationId) {
    formData.append("conversation_id", conversationId);
  }
  formData.append("language_code", languageCode);

  try {
    const { data } = await axios.post<VoiceChatResponse>(endpoint, formData, {
      timeout: VOICE_API_TIMEOUT_MS,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    const requestError = getRequestError(error);
    console.error("[aiApi] sendVoiceQuestion error:", requestError);
    throw requestError;
  }
};
