import { create } from "zustand";
import { BACKENDS, GROQ_MODELS } from "../config/modelsConfig";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
  images?: string[];
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  backendId: string;
  modelId: string;
  messages: Message[];
}

interface ChatState {
  selectedBackendId: string;
  selectedModelId: string;
  sessions: Record<string, ChatSession>;
  isLoading: boolean;
  setSelectedBackend: (id: string) => void;
  setSelectedModel: (id: string) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  clearCurrentChat: () => void;
}

export const getSessionId = (bId: string, mId: string) => `${bId}::${mId}`;

export const useChatStore = create<ChatState>((set, _get) => ({
  selectedBackendId: BACKENDS[0].id,
  selectedModelId: GROQ_MODELS[0].id,
  sessions: {},
  isLoading: false,

  setSelectedBackend: (id) => set({ selectedBackendId: id }),
  setSelectedModel: (id) => set({ selectedModelId: id }),

  addMessage: (message) =>
    set((state) => {
      const sId = getSessionId(state.selectedBackendId, state.selectedModelId);
      const currentSession = state.sessions[sId] || {
        id: sId,
        backendId: state.selectedBackendId,
        modelId: state.selectedModelId,
        messages: [],
      };

      return {
        sessions: {
          ...state.sessions,
          [sId]: {
            ...currentSession,
            messages: [
              ...currentSession.messages,
              { ...message, id: crypto.randomUUID(), timestamp: new Date() },
            ],
          },
        },
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearCurrentChat: () =>
    set((state) => {
      const sId = getSessionId(state.selectedBackendId, state.selectedModelId);
      const newSessions = { ...state.sessions };
      delete newSessions[sId];
      return { sessions: newSessions };
    }),
}));
