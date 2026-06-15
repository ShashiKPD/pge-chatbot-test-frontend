import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { sendChatMessage } from "../services/api";

export const ChatInput = () => {
  const [input, setInput] = useState("");
  const { addMessage, selectedModel, isLoading, setLoading } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    addMessage({ role: "user", text: userText });
    setLoading(true);

    try {
      const response = await sendChatMessage(selectedModel, userText);
      addMessage({
        role: "assistant",
        text: response.response,
        sources: response.sources,
        images: response.images,
      });
    } catch (error) {
      addMessage({
        role: "assistant",
        text: "An error occurred while connecting to the backend API.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      <div className="max-w-4xl mx-auto flex gap-3 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask a question about Greenbook compliance or tariffs..."
          className="flex-1 p-4 pr-24 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white disabled:opacity-50 text-slate-900 shadow-sm transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
};