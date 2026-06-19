export interface BackendService {
  id: string;
  name: string;
  endpoint: string;
  provider: string;
}

export const BACKENDS: BackendService[] = [
  {
    id: "pritam-graph-rag",
    name: "Pritam Graph",
    endpoint: "https://pge-spd-dev-neo4j-graph-db.hf.space/search",
    provider: "Pritam Prabhu",
  },
  {
    id: "tejaswari-graph-rag",
    name: "Tejaswari Graph",
    endpoint: "https://tejswari-grapgrag.hf.space/rag",
    provider: "Madiya Tejaswari",
  },
  {
    id: "atisha-hybrid-rag",
    name: "Atisha Hybrid",
    endpoint: "https://pge-spd-dev-hybridrag.hf.space/query",
    provider: "Atisha Bhattachatyya",
  },
  {
    id: "suvam-vector-rag",
    name: "Suvam Vector",
    endpoint: "https://pge-spd-dev-pge-vector-rag.hf.space/rag",
    provider: "Suvam Sharma",
  },
];

export interface LlmModel {
  id: string;
  name: string;
}

export const GROQ_MODELS: LlmModel[] = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile" },
  { id: "meta-llama/llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout" },
  { id: "qwen/qwen3-32b", name: "Qwen 3 32B" },
  // { id: "moonshotai/kimi-k2-instruct", name: "Kimi K2" },
  { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B" },
];
