import { createClient } from "@supabase/supabase-js";
import type { Chat } from "../store/useChatStore";
import type { DatabaseAdapter } from "./dbInterface";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseAdapter: DatabaseAdapter = {
  fetchChats: async () => {
    const { data, error } = await supabase.from("chats").select("*");
    if (error) throw error;

    return (data as Chat[]).reduce(
      (acc, chat) => {
        acc[chat.id] = chat;
        return acc;
      },
      {} as Record<string, Chat>,
    );
  },
  saveChat: async (chat: Chat) => {
    const { error } = await supabase.from("chats").upsert(chat);
    if (error) throw error;
  },
  deleteChat: async (id: string) => {
    const { error } = await supabase.from("chats").delete().eq("id", id);
    if (error) throw error;
  },
};
