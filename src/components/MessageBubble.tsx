import React from "react";
import type { Message } from "../store/useChatStore";
import { SourceLinks } from "./SourceLinks";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.text}
        </div>

        {message.images && message.images.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {message.images.map((base64Str, idx) => (
              <img
                key={idx}
                src={base64Str.startsWith("data:") ? base64Str : `data:image/png;base64,${base64Str}`}
                alt="Embedded response attachment"
                className="rounded-md border border-gray-200 max-h-80 object-contain bg-gray-50"
              />
            ))}
          </div>
        )}

        {!isUser && message.sources && (
          <SourceLinks sources={message.sources} />
        )}
      </div>
    </div>
  );
};