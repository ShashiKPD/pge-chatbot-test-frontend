import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { BACKENDS, GROQ_MODELS } from "../config/modelsConfig";

export const Sidebar = () => {
  const { 
    offlineChats, onlineChats, activeOfflineChatId, activeOnlineChatId, 
    setActiveChat, deleteChat, createChat, isOnline, setOnlineMode 
  } = useChatStore();
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const currentChats = isOnline ? onlineChats : offlineChats;
  const activeChatId = isOnline ? activeOnlineChatId : activeOfflineChatId;

  // We only keep the auto-expand logic. 
  // The store now safely handles auto-creating and selecting chats.
  useEffect(() => {
    if (activeChatId && currentChats[activeChatId]) {
      const activeChat = currentChats[activeChatId];
      const backendKey = activeChat.backendId;
      const modelKey = `${activeChat.backendId}-${activeChat.modelId}`;

      setExpanded(prev => {
        if (!prev[backendKey] || !prev[modelKey]) {
          return {
            ...prev,
            [backendKey]: true,
            [modelKey]: true
          };
        }
        return prev;
      });
    }
  }, [activeChatId, currentChats]);

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tree = BACKENDS.map(backend => {
    const backendChats = Object.values(currentChats).filter(c => c.backendId === backend.id);
    const models = GROQ_MODELS.map(model => ({
      ...model,
      chats: backendChats.filter(c => c.modelId === model.id).sort((a, b) => b.createdAt - a.createdAt)
    }));

    return { ...backend, models };
  });

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20 shrink-0 select-none">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col gap-4 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 bg-blue-700 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm">
            PG&E
          </div>
          <h1 className="text-sm font-semibold text-slate-800 tracking-tight">Evaluations</h1>
        </div>
        
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {isOnline ? "Online Mode" : "Offline Mode"}
          </span>
          <button
            onClick={() => setOnlineMode(!isOnline)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              isOnline ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isOnline ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {tree.map(backend => {
          const isBackendExpanded = expanded[backend.id] !== false;
          
          return (
            <div key={backend.id} className="flex flex-col">
              <button
                onClick={() => toggle(backend.id)}
                className="flex items-center gap-2 p-2 w-full text-left rounded-md hover:bg-slate-50 transition-colors"
              >
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isBackendExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 truncate">
                  {backend.name}
                </span>
              </button>

              {isBackendExpanded && backend.models.map(model => {
                const modelKey = `${backend.id}-${model.id}`;
                const isModelExpanded = expanded[modelKey] !== false;

                return (
                  <div key={modelKey} className="flex flex-col ml-4 border-l border-slate-100">
                    <div className="group flex items-center justify-between hover:bg-slate-50 transition-colors rounded-md pr-2">
                      <button
                        onClick={() => toggle(modelKey)}
                        className="flex items-center gap-2 p-2 flex-1 text-left"
                      >
                        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isModelExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="text-xs font-medium text-blue-600 truncate">
                          {model.name}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          createChat(backend.id, model.id);
                          setExpanded(prev => ({ ...prev, [modelKey]: true }));
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="New Chat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {isModelExpanded && model.chats.length === 0 && (
                      <div className="pl-8 py-1.5 text-[10px] text-slate-400 italic">
                        No active chats
                      </div>
                    )}

                    {isModelExpanded && model.chats.map(chat => {
                      const isActive = chat.id === activeChatId;
                      
                      return (
                        <div
                          key={chat.id}
                          onClick={() => setActiveChat(chat.id)}
                          className={`group relative flex items-center justify-between ml-6 p-2 mb-1 rounded-md cursor-pointer transition-all border ${
                            isActive
                              ? "bg-blue-50 border-blue-200 shadow-sm"
                              : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-col overflow-hidden pr-6 w-full">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm truncate ${isActive ? "text-blue-800 font-medium" : "text-slate-700"}`}>
                                {chat.title}
                              </span>
                              {chat.score && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                  chat.score >= 8 ? "bg-green-100 text-green-700" : 
                                  chat.score >= 5 ? "bg-yellow-100 text-yellow-700" : 
                                  "bg-red-100 text-red-700"
                                }`}>
                                  {chat.score}/10
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                            className={`absolute right-1 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ${
                              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};