import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { MessageBubble } from "./MessageBubble";

const EvaluationPanel = ({ chatId, currentScore, currentEvalNote }: { chatId: string, currentScore?: number, currentEvalNote?: string }) => {
  const updateEvaluation = useChatStore(state => state.updateEvaluation);
  const [isExpanded, setIsExpanded] = useState(false);
  const [evalNote, setEvalNote] = useState(currentEvalNote || "");

  useEffect(() => {
    setEvalNote(currentEvalNote || "");
    setIsExpanded(false);
  }, [chatId, currentEvalNote]);

  const scores = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleScoreSelect = (num: number) => {
    updateEvaluation(chatId, num, evalNote);
    setIsExpanded(false); 
  };

  const handleEvalNoteBlur = () => {
    updateEvaluation(chatId, currentScore, evalNote);
  };

  return (
    <div
      className={`absolute top-4 right-6 z-20 flex items-center bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-lg h-10 transition-all duration-300 ease-in-out ${
        isExpanded ? "left-6" : ""
      }`}
    >
      <div className={`flex-1 flex items-center h-full overflow-hidden transition-all duration-300 ${isExpanded ? "px-2 opacity-100 gap-4" : "w-0 opacity-0 px-0"}`}>
        <input
          type="text"
          value={evalNote}
          onChange={(e) => setEvalNote(e.target.value)}
          onBlur={handleEvalNoteBlur}
          placeholder="Testing notes or edge cases..."
          className="flex-1 min-w-[100px] h-6 px-2 text-[11px] border border-slate-200 rounded bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
        />
        <div className="flex gap-0.5 shrink-0 mr-4">
          {scores.map(num => (
            <button
              key={num}
              onClick={() => handleScoreSelect(num)}
              className={`w-6 h-6 rounded text-[11px] font-bold transition-all border ${
                currentScore === num
                  ? "bg-blue-600 text-white border-blue-600 shadow-inner"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-center h-full px-3 gap-2 hover:bg-slate-50 transition-colors shrink-0 rounded-r-lg ${isExpanded ? "border-l border-slate-200 bg-slate-50/50" : "rounded-l-lg"}`}
      >
        <span className="text-[11px] font-semibold text-slate-600">Score</span>
        {currentScore && (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            currentScore >= 8 ? "bg-green-100 text-green-700" :
            currentScore >= 5 ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          }`}>
            {currentScore}/10
          </span>
        )}
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export const ChatWindow = () => {
  const { offlineChats, onlineChats, activeOfflineChatId, activeOnlineChatId, isOnline } = useChatStore();
  
  const currentChats = isOnline ? onlineChats : offlineChats;
  const activeChatId = isOnline ? activeOnlineChatId : activeOfflineChatId;
  const activeChat = activeChatId ? currentChats[activeChatId] : null;
  const messages = activeChat ? activeChat.messages : [];
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 font-medium">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {messages.length > 0 && (
        <EvaluationPanel 
          chatId={activeChat.id} 
          currentScore={activeChat.score} 
          currentEvalNote={activeChat.evalNote} 
        />
      )}

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700">Test ChatBot</p>
              <p className="text-sm text-slate-500 mt-1">Send a prompt to evaluate the selected backend and model.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>
    </div>
  );
};