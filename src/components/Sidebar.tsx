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
          
          <div className="flex bg-slate-200 rounded-md p-0.5">
            <button
              onClick={() => setViewMode("tree")}
              className={`p-1 rounded text-slate-500 transition-colors ${
                viewMode === "tree" ? "bg-white shadow-sm text-blue-600" : "hover:text-slate-700"
              }`}
              title="Grouped View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded text-slate-500 transition-colors ${
                viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "hover:text-slate-700"
              }`}
              title="Recent View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
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