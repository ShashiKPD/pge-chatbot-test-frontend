import { useChatStore } from "../../store/useChatStore";

export const OnlineToggle = () => {
  const { isOnline, setOnlineMode } = useChatStore();

  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {isOnline ? "Online Mode" : "Offline Mode"}
        </span>
        
        <div className="relative group flex items-center">
          <svg 
            className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-help" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          
          {/* Tooltip */}
          <div className="absolute top-full left-0 mt-2 w-52 p-2.5 bg-slate-800 text-slate-100 text-[11px] leading-relaxed rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 font-medium pointer-events-none">
            In offline mode, your conversations and evaluations are only stored locally in your browser and will not be saved to the database.
            
            {/* Little triangle pointer */}
            <div className="absolute -top-1 left-1.5 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
        </div>
      </div>

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
  );
};