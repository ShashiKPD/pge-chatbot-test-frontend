import { BACKENDS, GROQ_MODELS } from "../../config/modelsConfig";
import { useChatStore } from "../../store/useChatStore";
import type { Chat } from "../../store/useChatStore";

interface ListViewProps {
  chats: Record<string, Chat>;
  activeChatId: string | null;
  setActiveChat: (id: string) => void;
  deleteChat: (id: string) => void;
  createChat: (backendId: string, modelId: string) => void;
}

export const ListView = ({ chats, activeChatId, setActiveChat, deleteChat, createChat }: ListViewProps) => {
  const { defaultBackendId, defaultModelId } = useChatStore();
  const sortedChats = Object.values(chats).sort((a, b) => b.createdAt - a.createdAt);

  const getBackendName = (id: string) => BACKENDS.find((b) => b.id === id)?.name || id;
  const getModelName = (id: string) => GROQ_MODELS.find((m) => m.id === id)?.name || id;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const activeChat = activeChatId ? chats[activeChatId] : null;
  const newChatBackend = activeChat?.backendId || defaultBackendId;
  const newChatModel = activeChat?.modelId || defaultModelId;

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
      <button
        onClick={() => createChat(newChatBackend, newChatModel)}
        className="flex items-center justify-center gap-2 w-full py-2 mb-1 bg-white border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-xs font-bold rounded-lg transition-colors shadow-sm shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        New Chat
      </button>

      {sortedChats.length === 0 && (
        <div className="text-center text-xs text-slate-400 mt-4 italic">No active chats</div>
      )}
      {sortedChats.map((chat) => {
        const isActive = chat.id === activeChatId;

        return (
          <div
            key={chat.id}
            onClick={() => setActiveChat(chat.id)}
            className={`group relative flex flex-col p-2.5 rounded-lg cursor-pointer transition-all border ${
              isActive
                ? "bg-blue-50 border-blue-200 shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="flex justify-between items-start gap-2 mb-0.5">
              <span
                className={`text-sm font-medium truncate ${
                  isActive ? "text-blue-800" : "text-slate-700"
                }`}
              >
                {chat.title}
              </span>
              {chat.score && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                    chat.score >= 8
                      ? "bg-green-100 text-green-700"
                      : chat.score >= 5
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {chat.score}/10
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-400 pr-5">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className={`font-bold truncate shrink-0 ${isActive ? "text-blue-700" : "text-slate-600"}`}>
                  {getBackendName(chat.backendId)}
                </span>
                <span className="shrink-0 opacity-40">•</span>
                <span className="truncate">
                  {getModelName(chat.modelId)}
                </span>
              </div>
              <span className="shrink-0 ml-2">{formatDate(chat.createdAt)}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat.id);
              }}
              className={`absolute right-1.5 bottom-1.5 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};