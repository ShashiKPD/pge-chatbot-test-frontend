import React from "react";

interface SourceLinksProps {
  sources: string[];
}

export const SourceLinks: React.FC<SourceLinksProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const hostedIp = window.location.origin; 

  return (
    <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
      <span className="font-semibold text-gray-600 dark:text-gray-400 block mb-1">
        Verified Sources:
      </span>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => {
          const absoluteUrl = `${hostedIp}/sources/${source}`;
          const displayLabel = source.split("/").pop() || source;

          return (
            <a
              key={index}
              href={absoluteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded transition-colors"
            >
              {displayLabel.replace("#page=", " (Page ") + ")"}
            </a>
          );
        })}
      </div>
    </div>
  );
};