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

const API_URL = process.env.EXPO_PUBLIC_AI_API_URL;
const AI_API_TIMEOUT_MS = 60000; // Render free tier can have cold-start delays up to 50s

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number,
) => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Timeout of ${timeoutMs}ms exceeded while reaching AI server.`,
            ),
          ),
        timeoutMs,
      ),
    ),
  ]);
};

export const askAssistant = async (
  payload: AssistantRequest,
): Promise<AssistantResponse> => {
  if (!API_URL) {
    throw new Error("AI API URL is not configured in .env");
  }

  const endpoint = `${API_URL}/api/v1/assistant/ask`;

  try {
    const response = await fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...payload,
          language: payload.language || "en",
        }),
      },
      AI_API_TIMEOUT_MS,
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: AssistantResponse = await response.json();
    return data;
  } catch (error) {
    console.error("[aiApi] askAssistant error:", error);
    throw error;
  }
};

export const getChatHistory = async (
  conversationId: string,
): Promise<ChatSessionResponse> => {
  if (!API_URL) {
    throw new Error("AI API URL is not configured in .env");
  }

  const endpoint = `${API_URL}/api/v1/assistant/chats/${conversationId}`;

  try {
    const response = await fetchWithTimeout(
      endpoint,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
      AI_API_TIMEOUT_MS,
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ChatSessionResponse = await response.json();
    return data;
  } catch (error) {
    console.error("[aiApi] getChatHistory error:", error);
    throw error;
  }
};
