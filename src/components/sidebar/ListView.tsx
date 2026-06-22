import { useState, useRef, useEffect } from "react";
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
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedBackends, setSelectedBackends] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  const toggleBackend = (id: string) => {
    setSelectedBackends(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const toggleModel = (id: string) => {
    setSelectedModels(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

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

  const query = searchQuery.toLowerCase();
  const sortedChats = Object.values(chats).sort((a, b) => b.createdAt - a.createdAt);

  const filteredAndScoredChats = sortedChats.reduce((acc, chat) => {
    const matchesBackend = selectedBackends.length === 0 || selectedBackends.includes(chat.backendId);
    const matchesModel = selectedModels.length === 0 || selectedModels.includes(chat.modelId);
    
    if (!matchesBackend || !matchesModel) return acc;

    let exactTitleMatch = false;
    let promptMatch = false;

    if (query) {
      exactTitleMatch = chat.title.toLowerCase().includes(query);
      promptMatch = !exactTitleMatch && chat.messages.some(m => m.role === "user" && m.text.toLowerCase().includes(query));
      
      if (!exactTitleMatch && !promptMatch) return acc;
    }

    acc.push({ chat, exactTitleMatch });
    return acc;
  }, [] as { chat: Chat, exactTitleMatch: boolean }[]);

  if (query) {
    filteredAndScoredChats.sort((a, b) => {
      if (a.exactTitleMatch && !b.exactTitleMatch) return -1;
      if (!a.exactTitleMatch && b.exactTitleMatch) return 1;
      return b.chat.createdAt - a.chat.createdAt;
    });
  }

  const finalFilteredChats = filteredAndScoredChats.map(item => item.chat);

  const activeChat = activeChatId ? chats[activeChatId] : null;
  const newChatBackend = activeChat?.backendId || defaultBackendId;
  const newChatModel = activeChat?.modelId || defaultModelId;
  const activeFilterCount = selectedBackends.length + selectedModels.length;

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      
      <div className="p-3 pb-1 flex flex-col gap-2 shrink-0 z-10 border-b border-transparent">
        <div className="flex items-center gap-2 w-full">
          
          <div className="flex flex-1 items-center bg-white border border-slate-200 rounded-lg shadow-sm h-8 px-2 min-w-0 transition-colors focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 focus-within:ring-opacity-50">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats & prompts..."
              className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-xs px-2 outline-none text-slate-700 placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="relative shrink-0" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-center h-8 px-2.5 rounded-lg border shadow-sm transition-colors text-xs font-bold gap-1.5 ${
                activeFilterCount > 0 
                  ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-[220px] bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-3.5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">APIs</span>
                  <div className="flex flex-wrap gap-1.5">
                    {BACKENDS.map(b => (
                      <button 
                        key={b.id}
                        onClick={() => toggleBackend(b.id)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full border transition-colors ${
                          selectedBackends.includes(b.id) 
                            ? "bg-blue-500 border-blue-500 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Models</span>
                  <div className="flex flex-wrap gap-1.5">
                    {GROQ_MODELS.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => toggleModel(m.id)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full border transition-colors text-left ${
                          selectedModels.includes(m.id) 
                            ? "bg-blue-500 border-blue-500 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button 
                    onClick={() => {setSelectedBackends([]); setSelectedModels([]);}} 
                    className="text-xs text-red-500 hover:text-red-600 font-bold text-left pt-2 border-t border-slate-100"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => createChat(newChatBackend, newChatModel)}
          className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-xs font-bold rounded-lg transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2 min-w-0 relative">
        {finalFilteredChats.length === 0 && (
          <div className="text-center text-xs text-slate-400 mt-4 italic px-2">
            {sortedChats.length === 0 ? "No active chats" : "No chats match your search or filters"}
          </div>
        )}

        {finalFilteredChats.map((chat) => {
          const isActive = chat.id === activeChatId;

          return (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`group relative flex flex-col p-2.5 rounded-lg cursor-pointer transition-all border shrink-0 ${
                isActive
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-2 mb-0.5 w-full min-w-0">
                <span
                  className={`flex-1 min-w-0 text-sm font-medium truncate ${
                    isActive ? "text-blue-800" : "text-slate-700"
                  }`}
                  title={chat.title}
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
              
              <div className="flex justify-between items-center text-[10px] text-slate-400 pr-5 min-w-0 w-full">
                <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
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
    </div>
  );
};