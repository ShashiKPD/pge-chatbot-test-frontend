import { useEffect, useState, useRef } from "react";
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
  
  // Resizing and Collapsing Logic
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem("sidebarWidth") || "288", 10);
  });
  const isResizing = useRef(false);
  const sidebarWidthRef = useRef(sidebarWidth);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    
    let newWidth = e.clientX;
    // Snap completely shut if dragged too far left
    if (newWidth < 50) {
      newWidth = 0;
    } else if (newWidth > 600) {
      newWidth = 600; // Maximum width
    }
    
    sidebarWidthRef.current = newWidth;
    setSidebarWidth(newWidth);
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.body.style.cursor = "default";
    
    // If it was left semi-collapsed (between 50 and 240), snap it to minimum visible width or 0
    if (sidebarWidthRef.current > 0 && sidebarWidthRef.current < 200) {
       sidebarWidthRef.current = 0;
       setSidebarWidth(0);
    } else if (sidebarWidthRef.current >= 200 && sidebarWidthRef.current < 240) {
       sidebarWidthRef.current = 240;
       setSidebarWidth(240);
    }

    localStorage.setItem("sidebarWidth", sidebarWidthRef.current.toString());
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
  };

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
    <>
      <div 
        className={`relative bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20 shrink-0 select-none overflow-hidden transition-[width] duration-0 ${sidebarWidth === 0 ? 'border-r-0' : ''}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Inner container with min-width forces the "slide out of view" effect when width drops below 240px */}
        <div className="flex flex-col h-full min-w-[240px] w-full">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col gap-4 bg-slate-50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm">
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

        {/* Drag Handle */}
        {sidebarWidth > 0 && (
          <div
            onMouseDown={startResizing}
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize group flex items-center justify-center z-50 translate-x-1/2"
          >
            <div className="w-0.5 h-10 bg-slate-300 rounded-full group-hover:bg-blue-600 group-active:bg-blue-600 group-active:h-full transition-all duration-150" />
          </div>
        )}
      </div>

      {/* Expand Button (Appears only when completely collapsed) */}
      {sidebarWidth === 0 && (
        <button
          onClick={() => { setSidebarWidth(288); localStorage.setItem("sidebarWidth", "288"); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-1.5 bg-white border border-slate-200 border-l-0 rounded-r-lg shadow-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors group cursor-pointer"
          title="Expand Sidebar"
        >
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </>
  );
};