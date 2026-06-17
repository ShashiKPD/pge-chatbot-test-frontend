// src/components/Header.tsx
import React from "react";
import { useChatStore } from "../store/useChatStore";
import { BACKENDS, GROQ_MODELS } from "../config/modelsConfig";

export const Header = () => {
  const { sessions, activeSessionId, updateActiveConfig } = useChatStore();
  
  const activeSession = activeSessionId ? sessions[activeSessionId] : null;
  const currentBackendId = activeSession?.backendId || BACKENDS[0].id;
  const currentModelId = activeSession?.modelId || GROQ_MODELS[0].id;

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <label className="text-sm font-medium text-slate-600 ml-1">API:</label>
          <select
            value={currentBackendId}
            onChange={(e) => updateActiveConfig(e.target.value, currentModelId)}
            className="p-1.5 text-sm border-none bg-transparent font-medium text-slate-800 focus:ring-0 cursor-pointer outline-none"
          >
            {BACKENDS.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <label className="text-sm font-medium text-slate-600 ml-1">Model:</label>
          <select
            value={currentModelId}
            onChange={(e) => updateActiveConfig(currentBackendId, e.target.value)}
            className="p-1.5 text-sm border-none bg-transparent font-medium text-slate-800 focus:ring-0 cursor-pointer outline-none"
          >
            {GROQ_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};