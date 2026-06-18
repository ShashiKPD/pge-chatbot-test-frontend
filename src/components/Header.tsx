import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { BACKENDS, GROQ_MODELS } from "../config/modelsConfig";
import { exportChatsToCSV } from "../utils/exportUtils";

const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
  widthClass = "w-40",
}: {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (val: string) => void;
  widthClass?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.id === value);

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between ${widthClass} px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-white focus:outline-none transition-colors shadow-sm`}
      >
        <span className="truncate">{selectedOption?.name || "Select..."}</span>
        <svg className="w-4 h-4 text-slate-400 shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-[40px] right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                value === opt.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Header = () => {
  const {
    offlineChats,
    onlineChats,
    activeOfflineChatId,
    activeOnlineChatId,
    isOnline,
    updateActiveConfig,
    updateEvaluation,
  } = useChatStore();

  const currentChats = isOnline ? onlineChats : offlineChats;
  const activeChatId = isOnline ? activeOnlineChatId : activeOfflineChatId;
  const activeChat = activeChatId ? currentChats[activeChatId] : null;

  const currentBackendId = activeChat?.backendId || BACKENDS[0].id;
  const currentModelId = activeChat?.modelId || GROQ_MODELS[0].id;

  const [evalNote, setEvalNote] = useState(activeChat?.evalNote || "");
  const [isEvalExpanded, setIsEvalExpanded] = useState(false);

  useEffect(() => {
    setEvalNote(activeChat?.evalNote || "");
    setIsEvalExpanded(false);
  }, [activeChat?.id, activeChat?.evalNote]);

  const handleExport = () => {
    const mode = isOnline ? "Online" : "Offline";
    const date = new Date().toISOString().split("T")[0];
    exportChatsToCSV(currentChats, `Evaluations_${mode}_${date}.csv`);
  };

  const handleScoreSelect = (num: number) => {
    if (activeChat) updateEvaluation(activeChat.id, num, evalNote);
  };

  const handleEvalNoteBlur = () => {
    if (activeChat) updateEvaluation(activeChat.id, activeChat.score, evalNote);
  };

  const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getCollapsedScoreStyles = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
    if (score >= 5) return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
    return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
  };

  const getExpandedScoreBtnStyles = (score: number) => {
    if (score >= 8) return "bg-green-500 text-white border-green-500 shadow-inner";
    if (score >= 5) return "bg-yellow-500 text-white border-yellow-500 shadow-inner";
    return "bg-red-500 text-white border-red-500 shadow-inner";
  };

  return (
    <header className="bg-white border-b border-slate-200 px-5 py-3 flex justify-between items-center z-20 shrink-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4">
        <CustomDropdown
          label="API"
          value={currentBackendId}
          options={BACKENDS}
          widthClass="w-36"
          onChange={(val) => updateActiveConfig(val, currentModelId)}
        />
        <CustomDropdown
          label="Model"
          value={currentModelId}
          options={GROQ_MODELS}
          widthClass="w-48"
          onChange={(val) => updateActiveConfig(currentBackendId, val)}
        />
      </div>

      <div className="flex items-center gap-3">
        {activeChat && activeChat.messages.length > 0 && (
          <div className="flex items-center transition-all duration-200">
            {!isEvalExpanded ? (
              <button
                onClick={() => setIsEvalExpanded(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-md border transition-colors shadow-sm ${
                  activeChat.score
                    ? getCollapsedScoreStyles(activeChat.score)
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {activeChat.score ? `Score: ${activeChat.score}/10` : "Evaluate"}
              </button>
            ) : (
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md h-9 pl-2 pr-1 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-1.5 border-r border-slate-200 pr-2 mr-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</span>
                  <div className="flex gap-0.5">
                    {scores.map((num) => (
                      <button
                        key={num}
                        onClick={() => handleScoreSelect(num)}
                        className={`w-6 h-6 rounded text-xs font-bold transition-all border ${
                          activeChat.score === num
                            ? getExpandedScoreBtnStyles(num)
                            : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={evalNote}
                  onChange={(e) => setEvalNote(e.target.value)}
                  onBlur={handleEvalNoteBlur}
                  placeholder="Testing notes..."
                  className="w-32 text-sm bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400 outline-none"
                />
                <button
                  onClick={() => setIsEvalExpanded(false)}
                  className="ml-1 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                  title="Collapse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-white text-slate-600 text-sm font-bold rounded-md border border-slate-200 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
    </header>
  );
};