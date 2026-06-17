// src/store/useChatStore.ts
import { create } from "zustand";
import { BACKENDS, GROQ_MODELS } from "../config/modelsConfig";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
  images?: string[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  backendId: string;
  modelId: string;
  messages: Message[];
  createdAt: number;
  score?: number; // NEW
  comment?: string; // NEW
}

interface ChatState {
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
  isLoading: boolean;
  createSession: (backendId?: string, modelId?: string) => void;
  setActiveSession: (id: string) => void;
  deleteSession: (id: string) => void;
  updateActiveConfig: (backendId: string, modelId: string) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  updateEvaluation: (id: string, score?: number, comment?: string) => void; // NEW
}

const generateTitle = (text: string) => {
  return text.length > 30 ? text.substring(0, 30) + "..." : text;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: {},
  activeSessionId: null,
  isLoading: false,

  createSession: (bId, mId) => {
    const backendId = bId || BACKENDS[0].id;
    const modelId = mId || GROQ_MODELS[0].id;
    const newId = crypto.randomUUID();

    set((state) => ({
      sessions: {
        ...state.sessions,
        [newId]: {
          id: newId,
          title: "New Session",
          backendId,
          modelId,
          messages: [],
          createdAt: Date.now(),
        },
      },
      activeSessionId: newId,
    }));
  },

  setActiveSession: (id) => set({ activeSessionId: id }),

  deleteSession: (id) =>
    set((state) => {
      const newSessions = { ...state.sessions };
      delete newSessions[id];

      let newActiveId = state.activeSessionId;
      if (state.activeSessionId === id) {
        const remainingIds = Object.keys(newSessions).sort(
          (a, b) => newSessions[b].createdAt - newSessions[a].createdAt,
        );
        newActiveId = remainingIds.length > 0 ? remainingIds[0] : null;
      }

      return {
        sessions: newSessions,
        activeSessionId: newActiveId,
      };
    }),

  updateActiveConfig: (backendId, modelId) =>
    set((state) => {
      const { activeSessionId, sessions } = state;
      if (!activeSessionId) return state;

      const activeSession = sessions[activeSessionId];

      if (activeSession.messages.length === 0) {
        return {
          sessions: {
            ...sessions,
            [activeSessionId]: { ...activeSession, backendId, modelId },
          },
        };
      }

      const newId = crypto.randomUUID();
      return {
        sessions: {
          ...sessions,
          [newId]: {
            id: newId,
            title: "New Session",
            backendId,
            modelId,
            messages: [],
            createdAt: Date.now(),
          },
        },
        activeSessionId: newId,
      };
    }),

  addMessage: (message) =>
    set((state) => {
      const { activeSessionId, sessions } = state;
      if (!activeSessionId) return state;

      const session = sessions[activeSessionId];
      const isFirstUserMessage =
        session.messages.length === 0 && message.role === "user";
      const newTitle = isFirstUserMessage
        ? generateTitle(message.text)
        : session.title;

      return {
        sessions: {
          ...sessions,
          [activeSessionId]: {
            ...session,
            title: newTitle,
            messages: [
              ...session.messages,
              { ...message, id: crypto.randomUUID(), timestamp: Date.now() },
            ],
          },
        },
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  // NEW ACTION
  updateEvaluation: (id, score, comment) =>
    set((state) => {
      if (!state.sessions[id]) return state;
      return {
        sessions: {
          ...state.sessions,
          [id]: {
            ...state.sessions[id],
            ...(score !== undefined && { score }),
            ...(comment !== undefined && { comment }),
          },
        },
      };
    }),
}));
