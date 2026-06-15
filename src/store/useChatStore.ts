import { create } from "zustand";
import { AVAILABLE_MODELS } from "../config/modelsConfig";
import type { BackendModel } from "../config/modelsConfig";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
  images?: string[];
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  selectedModel: BackendModel;
  isLoading: boolean;
  setSelectedModel: (modelId: string) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  selectedModel: AVAILABLE_MODELS[0],
  isLoading: false,
  setSelectedModel: (modelId) =>
    set((state) => ({
      selectedModel:
        AVAILABLE_MODELS.find((m) => m.id === modelId) || state.selectedModel,
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearChat: () => set({ messages: [] }),
}));
