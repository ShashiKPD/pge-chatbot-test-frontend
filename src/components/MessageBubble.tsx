import type { Message } from "../store/useChatStore";

export const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  let metadataString = "";
  if (!isUser && message.metadata) {
    const model = message.metadata.modelused || message.metadata.model_used;
    
    let timeMs = "";
    if (message.metadata.totaltimems) {
      timeMs = `${message.metadata.totaltimems}ms`;
    } else if (message.metadata.total_time) {
      timeMs = `${Math.round(Number(message.metadata.total_time) * 1000)}ms`;
    } else if (message.metadata.generation_time_ms) {
      timeMs = `${message.metadata.generation_time_ms}ms`;
    } else if (message.metadata.generationtimems) {
      timeMs = `${message.metadata.generationtimems}ms`;
    }

    const tokens = message.metadata.totaltokens || message.metadata.total_token;
    const tokensStr = tokens ? `${tokens}tokens` : "";

    const parts = [model, timeMs, tokensStr].filter(Boolean);
    metadataString = parts.join(" • ");
  }

  const messageText = message.text || (message as any).answer || "";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex max-w-[85%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-baseline gap-2 mx-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isUser ? "You" : "Assistant"}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div
            className={`px-5 py-3.5 text-sm leading-relaxed shadow-sm flex flex-col gap-4 ${
              isUser
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm"
            }`}
          >
            <div className="whitespace-pre-wrap break-words">{messageText}</div>

            {message.images && message.images.length > 0 && (
              <div className="flex flex-col gap-2">
                {message.images.map((img: any, idx) => {
                  const imgBase64 = typeof img === "string" ? img : img.image_base64;
                  if (!imgBase64) return null;
                  
                  return (
                    <img
                      key={idx}
                      src={imgBase64.startsWith("data:") ? imgBase64 : `data:image/png;base64,${imgBase64}`}
                      alt="Generated visual"
                      className="max-w-full rounded-xl border border-slate-200 shadow-sm"
                    />
                  );
                })}
              </div>
            )}
             {metadataString && (
                <div className="text-[11px] text-slate-400 font-medium">
                  {metadataString}
                </div>
              )}
          </div>

          {!isUser && (
            <div className="flex flex-col gap-2 mt-1 mx-1">
              {message.sources && message.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold text-slate-500">Sources:</span>
                  {message.sources.map((sourceItem: any, idx) => {
                    try {
                      let url = typeof sourceItem === "string" ? sourceItem : sourceItem.url;
                      let displayTitle = "Source Document";
                      
                      const hashIndex = url.indexOf("#");
                      const hashStr = hashIndex !== -1 ? url.substring(hashIndex) : "";
                      
                      if (url.includes("greenbook-manual-full.pdf")) {
                        url = `https://www.pge.com/assets/pge/docs/account/service-requests/greenbook-manual-full.pdf${hashStr}`;
                        
                        if (typeof sourceItem !== "string" && sourceItem.pageno) {
                          displayTitle = `Greenbook Manual (Page ${sourceItem.pageno})`;
                        } else {
                          displayTitle = `Greenbook Manual ${hashStr.replace('#', '')}`.trim();
                        }
                      } else {
                        if (typeof sourceItem !== "string" && sourceItem.title) {
                          displayTitle = sourceItem.title;
                          if (sourceItem.pageno) displayTitle += ` (Page ${sourceItem.pageno})`;
                        } else {
                          const urlObj = new URL(url.startsWith('http') ? url : `http://dummy.com${url}`);
                          const pathParts = urlObj.pathname.split('/');
                          displayTitle = pathParts[pathParts.length - 1] || "Source Document";
                          if (urlObj.hash) {
                            displayTitle += ` (${urlObj.hash.replace('#', '')})`;
                          }
                        }
                      }
                      
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-md transition-colors border border-slate-200 break-words shadow-sm"
                          title={url}
                        >
                          <svg className="w-3 h-3 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>{displayTitle}</span>
                        </a>
                      );
                    } catch {
                      const fallbackUrl = typeof sourceItem === "string" ? sourceItem : sourceItem.url;
                      return (
                        <a
                          key={idx}
                          href={fallbackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2.5 py-1 bg-white text-slate-600 text-xs font-medium rounded-md border border-slate-200 break-words shadow-sm"
                        >
                          Source {idx + 1}
                        </a>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};