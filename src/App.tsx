import React from "react";
import { ModelSelector } from "./components/ModelSelector";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { useChatStore } from "./store/useChatStore";

function App() {
  const clearChat = useChatStore((state) => state.clearChat);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center z-10 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg tracking-wide shadow-sm">
            PG&E
          </div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Compliance & Tariff QA</h1>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <ModelSelector />
          <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
          <button
            onClick={clearChat}
            className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
        <ChatWindow />
      </main>

      <ChatInput />
    </div>
  );
}

export default App;