import { useChatStore } from "../../store/useChatStore";

export const OnlineToggle = () => {
  const { isOnline, setOnlineMode } = useChatStore();

  return (
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
  );
};