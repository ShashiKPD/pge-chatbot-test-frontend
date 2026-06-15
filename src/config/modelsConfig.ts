export interface BackendModel {
  id: string;
  name: string;
  endpoint: string;
  provider: string;
}

export const AVAILABLE_MODELS: BackendModel[] = [
  {
    id: "greenbook-v2-rag",
    name: "Greenbook V2 (RAG + Claude)",
    endpoint: "/v1/chat/greenbook-v2",
    provider: "Team Alpha",
  },
  {
    id: "tariff-expert-gpt4",
    name: "Tariff compliance (GPT-4o)",
    endpoint: "/v2/predict/tariffs",
    provider: "Team Beta",
  },
];
