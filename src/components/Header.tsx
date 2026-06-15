import { useChatStore } from "../store/useChatStore";
import { BACKENDS, GROQ_MODELS } from "../config/modelsConfig";

export const Header = () => {
  const {
    selectedBackendId,
    selectedModelId,
    setSelectedBackend,
    setSelectedModel,
    clearCurrentChat
  } = useChatStore();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <label className="text-sm font-medium text-slate-600 ml-1">API:</label>
          <select
            value={selectedBackendId}
            onChange={(e) => setSelectedBackend(e.target.value)}
            className="p-1.5 text-sm border-none bg-transparent font-medium text-slate-800 focus:ring-0 cursor-pointer outline-none"
          >
            {BACKENDS.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <label className="text-sm font-medium text-slate-600 ml-1">Model:</label>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="p-1.5 text-sm border-none bg-transparent font-medium text-slate-800 focus:ring-0 cursor-pointer outline-none"
          >
            {GROQ_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={clearCurrentChat}
        className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        Clear Session
      </button>
    </header>
  );
};