import type { BackendModel } from "../config/modelsConfig";

interface ChatPayload {
  prompt: string;
}

interface ApiResponse {
  response: string;
  sources: string[];
  images?: string[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sendChatMessage = async (
  model: BackendModel,
  prompt: string,
): Promise<ApiResponse> => {
  const targetUrl = `${BASE_URL}${model.endpoint}`;

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt } as ChatPayload),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};
