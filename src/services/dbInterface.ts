import type { Chat } from "../store/useChatStore";

export interface DatabaseAdapter {
  fetchChats: () => Promise<Record<string, Chat>>;
  saveChat: (chat: Chat) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
}
