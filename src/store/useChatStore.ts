import { create } from "zustand";
import { BACKENDS, GROQ_MODELS } from "../config/modelsConfig";
import { db } from "../services/db";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
  images?: string[];
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  backendId: string;
  modelId: string;
  messages: Message[];
  createdAt: number;
  score?: number;
  evalNote?: string;
}

interface ChatState {
  offlineChats: Record<string, Chat>;
  onlineChats: Record<string, Chat>;
  activeOfflineChatId: string | null;
  activeOnlineChatId: string | null;
  isLoading: boolean;
  isOnline: boolean;
  initializeStore: () => Promise<void>;
  setOnlineMode: (online: boolean) => Promise<void>;
  createChat: (backendId?: string, modelId?: string) => void;
  setActiveChat: (id: string) => void;
  deleteChat: (id: string) => void;
  updateActiveConfig: (backendId: string, modelId: string) => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  updateEvaluation: (id: string, score?: number, evalNote?: string) => void;
}

const generateTitle = (text: string) => {
  return text.length > 30 ? text.substring(0, 30) + "..." : text;
};

export const useChatStore = create<ChatState>((set, get) => ({
  offlineChats: {},
  onlineChats: {},
  activeOfflineChatId: null,
  activeOnlineChatId: null,
  isLoading: false,
  isOnline: false,

  initializeStore: async () => {
    const savedMode = localStorage.getItem("isOnlineMode") === "true";
    if (savedMode) {
      await get().setOnlineMode(true);
    } else {
      // Bootstrapping the offline mode if user starts offline
      const state = get();
      const offlineIds = Object.keys(state.offlineChats).sort(
        (a, b) =>
          state.offlineChats[b].createdAt - state.offlineChats[a].createdAt,
      );
      if (offlineIds.length > 0) {
        set({ activeOfflineChatId: offlineIds[0] });
      } else {
        get().createChat();
      }
    }
  },

  setOnlineMode: async (online) => {
    set({ isOnline: online, isLoading: true });
    localStorage.setItem("isOnlineMode", String(online));

    if (online) {
      try {
        const remoteChats = await db.fetchChats();
        // Auto-select the most recent chat from the DB
        const chatIds = Object.keys(remoteChats).sort(
          (a, b) => remoteChats[b].createdAt - remoteChats[a].createdAt,
        );
        const activeId = chatIds.length > 0 ? chatIds[0] : null;

        set({
          onlineChats: remoteChats,
          activeOnlineChatId: activeId,
          isLoading: false,
        });

        // Only create a new chat if the DB was completely empty
        if (!activeId) {
          get().createChat();
        }
      } catch (error) {
        set({ isOnline: false, isLoading: false });
        localStorage.setItem("isOnlineMode", "false");
      }
    } else {
      set({ isLoading: false });
      // When toggling to offline, ensure we select or create a chat
      const offlineIds = Object.keys(get().offlineChats).sort(
        (a, b) =>
          get().offlineChats[b].createdAt - get().offlineChats[a].createdAt,
      );
      if (offlineIds.length > 0) {
        set({ activeOfflineChatId: offlineIds[0] });
      } else {
        get().createChat();
      }
    }
  },

  createChat: (bId, mId) => {
    const state = get();
    const backendId = bId || BACKENDS[0].id;
    const modelId = mId || GROQ_MODELS[0].id;
    const newId = crypto.randomUUID();

    const newChat: Chat = {
      id: newId,
      title: "New Chat",
      backendId,
      modelId,
      messages: [],
      createdAt: Date.now(),
    };

    if (state.isOnline) {
      set({
        onlineChats: { ...state.onlineChats, [newId]: newChat },
        activeOnlineChatId: newId,
      });
      // REMOVED: db.saveChat(newChat).
      // We do not save to DB until the user actually adds a message or evaluation.
    } else {
      set({
        offlineChats: { ...state.offlineChats, [newId]: newChat },
        activeOfflineChatId: newId,
      });
    }
  },

  setActiveChat: (id) => {
    if (get().isOnline) {
      set({ activeOnlineChatId: id });
    } else {
      set({ activeOfflineChatId: id });
    }
  },

  deleteChat: (id) => {
    const state = get();
    const isOnline = state.isOnline;
    const currentChats = isOnline ? state.onlineChats : state.offlineChats;
    const currentActiveId = isOnline
      ? state.activeOnlineChatId
      : state.activeOfflineChatId;

    const chatToDelete = currentChats[id];
    if (!chatToDelete) return;

    const newChats = { ...currentChats };
    delete newChats[id];

    let newActiveId = currentActiveId;
    if (currentActiveId === id) {
      const remainingIds = Object.keys(newChats).sort(
        (a, b) => newChats[b].createdAt - newChats[a].createdAt,
      );
      newActiveId = remainingIds.length > 0 ? remainingIds[0] : null;
    }

    if (isOnline) {
      set({ onlineChats: newChats, activeOnlineChatId: newActiveId });
      const wasSaved =
        chatToDelete.messages.length > 0 ||
        chatToDelete.score !== undefined ||
        chatToDelete.evalNote !== undefined;
      if (wasSaved) db.deleteChat(id);
    } else {
      set({ offlineChats: newChats, activeOfflineChatId: newActiveId });
    }

    // If the user deleted the absolute last chat, spawn a fresh empty one
    if (!newActiveId) {
      get().createChat();
    }
  },

  updateActiveConfig: (backendId, modelId) => {
    const state = get();
    const isOnline = state.isOnline;
    const currentChats = isOnline ? state.onlineChats : state.offlineChats;
    const activeChatId = isOnline
      ? state.activeOnlineChatId
      : state.activeOfflineChatId;

    if (!activeChatId) return;

    const activeChat = currentChats[activeChatId];

    // Check if the chat is completely untouched
    const isUntouched =
      activeChat.messages.length === 0 &&
      activeChat.score === undefined &&
      activeChat.evalNote === undefined;

    if (isUntouched) {
      const updatedChat = { ...activeChat, backendId, modelId };
      if (isOnline) {
        set({ onlineChats: { ...currentChats, [activeChatId]: updatedChat } });
        // REMOVED: db.saveChat. Still empty, so keep it purely local.
      } else {
        set({ offlineChats: { ...currentChats, [activeChatId]: updatedChat } });
      }
      return;
    }

    // If it has content, create a fresh empty chat to preserve the old chat's history
    const newId = crypto.randomUUID();
    const newChat: Chat = {
      id: newId,
      title: "New Chat",
      backendId,
      modelId,
      messages: [],
      createdAt: Date.now(),
    };

    if (isOnline) {
      set({
        onlineChats: { ...currentChats, [newId]: newChat },
        activeOnlineChatId: newId,
      });
      // REMOVED: db.saveChat. New branch is empty, keep it local.
    } else {
      set({
        offlineChats: { ...currentChats, [newId]: newChat },
        activeOfflineChatId: newId,
      });
    }
  },

  addMessage: (message) => {
    const state = get();
    const isOnline = state.isOnline;
    const currentChats = isOnline ? state.onlineChats : state.offlineChats;
    const activeChatId = isOnline
      ? state.activeOnlineChatId
      : state.activeOfflineChatId;

    if (!activeChatId) return;

    const chat = currentChats[activeChatId];
    const isFirstUserMessage =
      chat.messages.length === 0 && message.role === "user";
    const newTitle = isFirstUserMessage
      ? generateTitle(message.text)
      : chat.title;

    const updatedChat = {
      ...chat,
      title: newTitle,
      messages: [
        ...chat.messages,
        { ...message, id: crypto.randomUUID(), timestamp: Date.now() },
      ],
    };

    if (isOnline) {
      set({ onlineChats: { ...currentChats, [activeChatId]: updatedChat } });
      db.saveChat(updatedChat); // Chat now has content, sync to DB
    } else {
      set({ offlineChats: { ...currentChats, [activeChatId]: updatedChat } });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  updateEvaluation: (id, score, evalNote) => {
    const state = get();
    const isOnline = state.isOnline;
    const currentChats = isOnline ? state.onlineChats : state.offlineChats;

    if (!currentChats[id]) return;

    const updatedChat = {
      ...currentChats[id],
      ...(score !== undefined && { score }),
      ...(evalNote !== undefined && { evalNote }),
    };

    if (isOnline) {
      set({ onlineChats: { ...currentChats, [id]: updatedChat } });
      db.saveChat(updatedChat); // Chat now has evaluation data, sync to DB
    } else {
      set({ offlineChats: { ...currentChats, [id]: updatedChat } });
    }
  },
}));
