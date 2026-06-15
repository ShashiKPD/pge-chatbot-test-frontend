import { useEffect, useRef } from "react";
import { useChatStore, getSessionId } from "../store/useChatStore";
import { MessageBubble } from "./MessageBubble";

export const ChatWindow = () => {
  const { selectedBackendId, selectedModelId, sessions } = useChatStore();
  const sId = getSessionId(selectedBackendId, selectedModelId);
  const activeSession = sessions[sId];
  const messages = activeSession ? activeSession.messages : [];
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-700">PG&E Assistant</p>
            <p className="text-sm text-slate-500 mt-1">Send a message to start a session with this configuration.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={endOfMessagesRef} />
        </div>
      )}
    </div>
  );
};