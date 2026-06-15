export interface BackendService {
  id: string;
  name: string;
  endpoint: string;
  provider: string;
}

export const BACKENDS: BackendService[] = [
  {
    id: "pritam-pageindex-rag",
    name: "Pritam PageIndex (RAG)",
    endpoint: "/v1/chat/pritam",
    provider: "Pritam Prabhu",
  },
  {
    id: "tejaswari-graph-rag",
    name: "Tejaswari Graph (RAG)",
    endpoint: "/v2/chat/tejaswari",
    provider: "Madiya Tejaswari",
  },
  {
    id: "atisha-hybrid-rag",
    name: "Atisha Hybrid (RAG)",
    endpoint: "/v2/chat/atisha",
    provider: "Atisha Bhattachatyya",
  },
  {
    id: "suvam-vector-rag",
    name: "Suvam Vector (RAG)",
    endpoint: "/v2/chat/suvam",
    provider: "Suvam Sharma",
  },
];

export interface LlmModel {
  id: string;
  name: string;
}

export const GROQ_MODELS: LlmModel[] = [
  { id: "llama3-8b-8192", name: "Llama 3 (8B)" },
  { id: "llama3-70b-8192", name: "Llama 3 (70B)" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  { id: "gemma-7b-it", name: "Gemma 7B" },
];
