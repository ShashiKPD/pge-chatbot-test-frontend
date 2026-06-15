import { BACKENDS } from "../config/modelsConfig";

interface ChatPayload {
  prompt: string;
  model: string;
}

interface ApiResponse {
  response: string;
  sources: string[];
  images?: string[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sendChatMessage = async (
  backendId: string,
  modelId: string,
  prompt: string,
): Promise<ApiResponse> => {
  const backend = BACKENDS.find((b) => b.id === backendId);
  if (!backend) throw new Error("Invalid backend");

  const targetUrl = `${BASE_URL}${backend.endpoint}`;

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, model: modelId } as ChatPayload),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};
