import { useChatStore } from "../store/useChatStore";
import { BACKENDS, GROQ_MODELS } from "../config/modelsConfig";
import { exportChatsToCSV } from "../utils/exportUtils";

export const Header = () => {
  const { offlineChats, onlineChats, activeOfflineChatId, activeOnlineChatId, isOnline, updateActiveConfig } = useChatStore();
  
  const currentChats = isOnline ? onlineChats : offlineChats;
  const activeChatId = isOnline ? activeOnlineChatId : activeOfflineChatId;
  const activeChat = activeChatId ? currentChats[activeChatId] : null;
  
  const currentBackendId = activeChat?.backendId || BACKENDS[0].id;
  const currentModelId = activeChat?.modelId || GROQ_MODELS[0].id;

  const handleExport = () => {
    const mode = isOnline ? "Online" : "Offline";
    const date = new Date().toISOString().split("T")[0];
    exportChatsToCSV(currentChats, `Evaluations_${mode}_${date}.csv`);
  };

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

      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export to Excel
      </button>
    </header>
  );
};