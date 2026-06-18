import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { MessageBubble } from "./MessageBubble";

export const ChatWindow = () => {
  const { offlineChats, onlineChats, activeOfflineChatId, activeOnlineChatId, isOnline, isLoading } = useChatStore();
  
  const currentChats = isOnline ? onlineChats : offlineChats;
  const activeChatId = isOnline ? activeOnlineChatId : activeOfflineChatId;
  const activeChat = activeChatId ? currentChats[activeChatId] : null;
  const messages = activeChat ? activeChat.messages : [];
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-slate-400 font-medium">Loading workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-16 h-16 bg-white text-slate-400 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-700">Test Chat Ready</p>
              <p className="text-sm text-slate-500 mt-1">Send a prompt to evaluate the selected backend and model.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex w-full justify-start mb-6">
                <div className="flex max-w-[85%] gap-4 flex-row">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-baseline gap-2 mx-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assistant</span>
                    </div>
                    <div className="px-5 py-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm">
                      <div className="flex space-x-1.5 items-center justify-center h-4">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>
    </div>
  );
};