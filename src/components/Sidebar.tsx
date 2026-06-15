import React from "react";
import { useChatStore, getSessionId } from "../store/useChatStore";
import { BACKENDS, GROQ_MODELS } from "../config/modelsConfig";

export const Sidebar = () => {
  const { sessions, selectedBackendId, selectedModelId, setSelectedBackend, setSelectedModel } = useChatStore();
  const activeSessionId = getSessionId(selectedBackendId, selectedModelId);

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20 shrink-0">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
        <div className="w-12 h-8 bg-blue-700 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm">
          PG&E
        </div>
        <h1 className="text-sm font-semibold text-slate-800 tracking-tight">Active Sessions</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {Object.values(sessions).map((session) => {
          const backend = BACKENDS.find(b => b.id === session.backendId);
          const model = GROQ_MODELS.find(m => m.id === session.modelId);
          const isActive = session.id === activeSessionId;

          return (
            <button
              key={session.id}
              onClick={() => {
                setSelectedBackend(session.backendId);
                setSelectedModel(session.modelId);
              }}
              className={`text-left p-3 rounded-lg border transition-all ${
                isActive
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${isActive ? "text-blue-700" : "text-slate-700"}`}>
                {backend?.name}
              </div>
              <div className={`text-xs ${isActive ? "text-blue-600" : "text-slate-500"}`}>
                {model?.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-medium">
                {session.messages.length} messages
              </div>
            </button>
          );
        })}
        {Object.keys(sessions).length === 0 && (
          <div className="text-xs text-slate-400 text-center mt-4">
            No active sessions yet.
          </div>
        )}
      </div>
    </div>
  );
};