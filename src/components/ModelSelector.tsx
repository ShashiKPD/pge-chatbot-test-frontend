import React from "react";
import { useChatStore } from "../store/useChatStore";
import { AVAILABLE_MODELS } from "../config/modelsConfig";

export const ModelSelector = () => {
  const { selectedModel, setSelectedModel } = useChatStore();

  return (
    <div className="flex items-center gap-2 px-2">
      <label htmlFor="model-select" className="text-sm font-medium text-slate-600">
        Backend:
      </label>
      <select
        id="model-select"
        value={selectedModel.id}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="p-1.5 text-sm border-none bg-transparent font-medium text-slate-800 focus:ring-0 cursor-pointer outline-none"
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
};