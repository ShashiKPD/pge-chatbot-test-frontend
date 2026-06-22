import { BACKENDS, GROQ_MODELS } from "../../config/modelsConfig";
import type { Chat } from "../../store/useChatStore";

interface TreeViewProps {
  chats: Record<string, Chat>;
  activeChatId: string | null;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setActiveChat: (id: string) => void;
  deleteChat: (id: string) => void;
  createChat: (backendId: string, modelId: string) => void;
}

export const TreeView = ({
  chats,
  activeChatId,
  expanded,
  setExpanded,
  setActiveChat,
  deleteChat,
  createChat,
}: TreeViewProps) => {
  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const tree = BACKENDS.map((backend) => {
    const backendChats = Object.values(chats).filter(
      (c) => c.backendId === backend.id
    );
    const models = GROQ_MODELS.map((model) => ({
      ...model,
      chats: backendChats
        .filter((c) => c.modelId === model.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    }));

    return { ...backend, models };
  });

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
      {tree.map((backend) => {
        const isBackendExpanded = expanded[backend.id] !== false;

        return (
          <div key={backend.id} className="flex flex-col">
            <button
              onClick={() => toggle(backend.id)}
              className="flex items-center gap-2 p-2 w-full text-left rounded-md hover:bg-slate-50 transition-colors"
            >
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  isBackendExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 truncate">
                {backend.name}
              </span>
            </button>

            {isBackendExpanded &&
              backend.models.map((model) => {
                const modelKey = `${backend.id}-${model.id}`;
                const isModelExpanded = expanded[modelKey] !== false;

                return (
                  <div
                    key={modelKey}
                    className="flex flex-col ml-4 border-l border-slate-100"
                  >
                    <div className="group flex items-center justify-between hover:bg-slate-50 transition-colors rounded-md pr-2">
                      <button
                        onClick={() => toggle(modelKey)}
                        className="flex items-center gap-2 p-2 flex-1 text-left"
                      >
                        <svg
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                            isModelExpanded ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span className="text-xs font-medium text-blue-600 truncate">
                          {model.name}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          createChat(backend.id, model.id);
                          setExpanded((prev) => ({
                            ...prev,
                            [modelKey]: true,
                          }));
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="New Chat"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>

                    {isModelExpanded && model.chats.length === 0 && (
                      <div className="pl-8 py-1.5 text-[10px] text-slate-400 italic">
                        No active chats
                      </div>
                    )}

                    {isModelExpanded &&
                      model.chats.map((chat) => {
                        const isActive = chat.id === activeChatId;

                        return (
                          <div
                            key={chat.id}
                            onClick={() => setActiveChat(chat.id)}
                            className={`group relative flex items-center justify-between ml-6 p-2 mb-1 rounded-md cursor-pointer transition-all border ${
                              isActive
                                ? "bg-blue-50 border-blue-200 shadow-sm"
                                : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex flex-col overflow-hidden pr-6 w-full">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm truncate ${
                                    isActive
                                      ? "text-blue-800 font-medium"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {chat.title}
                                </span>
                                {chat.score && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                      chat.score >= 8
                                        ? "bg-green-100 text-green-700"
                                        : chat.score >= 5
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {chat.score}/10
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(chat.id);
                              }}
                              className={`absolute right-1 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ${
                                isActive
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
};