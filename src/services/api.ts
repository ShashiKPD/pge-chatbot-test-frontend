import { BACKENDS } from "../config/modelsConfig";

interface ChatPayload {
  sessionid: string;
  query: string;
  model: string;
  ragapproach: string;
}

interface ApiResponse {
  response: string;
  sources: string[];
  images?: string[];
  metadata?: Record<string, any>;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const sendChatMessage = async (
  backendId: string,
  modelId: string,
  prompt: string,
  sessionId: string,
): Promise<ApiResponse> => {
  const backend = BACKENDS.find((b) => b.id === backendId);
  if (!backend) throw new Error("Invalid backend");

  const targetUrl = backend.endpoint.startsWith("http")
    ? backend.endpoint
    : `${BASE_URL}${backend.endpoint}`;

  const payload: ChatPayload = {
    sessionid: sessionId,
    query: prompt,
    model: modelId,
    ragapproach: "vector_search",
  };

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const rawData = await response.json();
  const data = rawData.RAGResponse ? rawData.RAGResponse : rawData;
  const answer = data.answer || "No response generated.";

  const formattedSources: string[] = [];
  const formattedImages: string[] = [];

  if (data.images && Array.isArray(data.images)) {
    data.images.forEach((img: any) => {
      if (img.image_base64) {
        formattedImages.push(img.image_base64);
      } else if (typeof img === "string") {
        formattedImages.push(img);
      }
    });
  }

  if (data.sources && Array.isArray(data.sources)) {
    data.sources.forEach((src: any) => {
      if (src.url) {
        formattedSources.push(src.url.replace(/\n/g, "").trim());
      }

      if (src.images) {
        if (typeof src.images === "string") {
          formattedImages.push(src.images);
        } else if (Array.isArray(src.images)) {
          src.images.forEach((imgStr: any) => {
            if (typeof imgStr === "string") formattedImages.push(imgStr);
          });
        }
      }
    });
  }

  return {
    response: answer,
    sources: [...new Set(formattedSources)],
    images: [...new Set(formattedImages)],
    metadata: data.metadata || undefined,
  };
};
