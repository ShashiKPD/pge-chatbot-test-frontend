import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { OnlineToggle } from "./sidebar/OnlineToggle";
import { TreeView } from "./sidebar/TreeView";
import { ListView } from "./sidebar/ListView";

export const Sidebar = () => {
  const {
    offlineChats,
    onlineChats,
    activeOfflineChatId,
    activeOnlineChatId,
    setActiveChat,
    deleteChat,
    createChat,
    isOnline,
    viewMode,
    setViewMode,
  } = useChatStore();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const currentChats = isOnline ? onlineChats : offlineChats;
  const activeChatId = isOnline ? activeOnlineChatId : activeOfflineChatId;

  useEffect(() => {
    if (activeChatId && currentChats[activeChatId]) {
      const activeChat = currentChats[activeChatId];
      const backendKey = activeChat.backendId;
      const modelKey = `${activeChat.backendId}-${activeChat.modelId}`;

      setExpanded((prev) => {
        if (!prev[backendKey] || !prev[modelKey]) {
          return {
            ...prev,
            [backendKey]: true,
            [modelKey]: true,
          };
        }
        return prev;
      });
    }
  }, [activeChatId, currentChats]);

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20 shrink-0 select-none">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col gap-4 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-blue-700 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm">
              PG&E
            </div>
            <h1 className="text-sm font-semibold text-slate-800 tracking-tight">Evaluations</h1>
          </div>
          
          <div className="flex bg-slate-200/80 p-1 rounded-lg border border-slate-200/50 shadow-inner">
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center justify-center p-1.5 w-7 h-7 rounded-md transition-all ${
                viewMode === "tree" 
                  ? "bg-white shadow-sm text-blue-600 ring-1 ring-slate-200/50" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-300/50"
              }`}
              title="Grouped View (By Model)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center p-1.5 w-7 h-7 rounded-md transition-all ${
                viewMode === "list" 
                  ? "bg-white shadow-sm text-blue-600 ring-1 ring-slate-200/50" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-300/50"
              }`}
              title="Recent View (Chronological)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        <OnlineToggle />
      </div>

      {viewMode === "tree" ? (
        <TreeView
          chats={currentChats}
          activeChatId={activeChatId}
          expanded={expanded}
          setExpanded={setExpanded}
          setActiveChat={setActiveChat}
          deleteChat={deleteChat}
          createChat={createChat}
        />
      ) : (
        <ListView
          chats={currentChats}
          activeChatId={activeChatId}
          setActiveChat={setActiveChat}
          deleteChat={deleteChat}
          createChat={createChat}
        />
      )}
    </div>
  );
};