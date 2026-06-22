import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  isUser: boolean;
}

export const MarkdownRenderer = ({ content, isUser }: MarkdownRendererProps) => {
  return (
    <div className="break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
          a: ({ ...props }) => (
            <a
              className="underline underline-offset-2 opacity-90 hover:opacity-100 font-medium"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3 last:mb-0 space-y-1" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3 last:mb-0 space-y-1" {...props} />,
          li: ({ ...props }) => <li className="" {...props} />,
          h1: ({ ...props }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />,
          h2: ({ ...props }) => <h2 className="text-base font-bold mb-2 mt-4 first:mt-0" {...props} />,
          h3: ({ ...props }) => <h3 className="text-sm font-bold mb-2 mt-3 first:mt-0" {...props} />,
          code: ({ inline, className, children, ...props }: any) => {
            if (!inline) {
              return (
                <div className="my-3 overflow-hidden rounded-lg">
                  <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    isUser ? "bg-blue-800 text-blue-200" : "bg-slate-200 text-slate-500"
                  }`}>
                    Code
                  </div>
                  <pre className={`p-4 overflow-x-auto text-xs font-mono leading-relaxed ${
                    isUser ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-50"
                  }`}>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            return (
              <code
                className={`px-1.5 py-0.5 rounded-md text-[13px] font-mono whitespace-nowrap ${
                  isUser ? "bg-blue-700/50 text-white" : "bg-slate-100 text-pink-600 border border-slate-200"
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-slate-200/50">
              <table className="min-w-full text-left text-sm border-collapse" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className={`p-2.5 border-b font-bold ${
                isUser ? "bg-blue-700/50 border-blue-500/50" : "bg-slate-50 border-slate-200"
              }`}
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className={`p-2.5 border-b ${
                isUser ? "border-blue-500/30" : "border-slate-100"
              }`}
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className={`pl-3 border-l-4 my-3 italic ${
                isUser ? "border-blue-400 text-blue-100" : "border-slate-300 text-slate-500"
              }`}
              {...props}
            />
          ),
          strong: ({ ...props }) => <strong className="font-bold" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};