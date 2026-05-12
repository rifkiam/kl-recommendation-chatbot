import type { IEmbeddingFunction } from "chromadb";
import { pipeline } from "chromadb-default-embed";

/**
 * Default: multilingual MiniLM from the Sentence-Transformers / SBERT family
 * (Indonesian-friendly; see https://www.sbert.net/docs/sentence_transformer/pretrained_models.html).
 * Override with EMBEDDING_MODEL, e.g. Xenova/paraphrase-multilingual-mpnet-base-v2 (768-dim, heavier).
 */
const LOCAL_MODEL =
  process.env.EMBEDDING_MODEL?.trim() ||
  "Xenova/paraphrase-multilingual-MiniLM-L12-v2";

const OLLAMA_URL = (process.env.OLLAMA_URL ?? "http://localhost:11434").replace(
  /\/$/,
  ""
);
const OLLAMA_EMBED_MODEL =
  process.env.OLLAMA_EMBED_MODEL?.trim() || "nomic-embed-text";

let localExtractorPromise: Promise<
  (text: string, options: { pooling: "mean"; normalize: boolean }) => Promise<unknown>
> | null = null;

async function getLocalExtractor() {
  if (!localExtractorPromise) {
    localExtractorPromise = pipeline("feature-extraction", LOCAL_MODEL);
  }
  return localExtractorPromise;
}

function vecFromModelOutput(raw: unknown): number[] {
  if (raw instanceof Float32Array) {
    return Array.from(raw);
  }
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    (raw as { data: unknown }).data instanceof Float32Array
  ) {
    return Array.from((raw as { data: Float32Array }).data);
  }
  throw new Error("Unexpected embedding tensor output from local model");
}

async function embedWithLocalModel(texts: string[]): Promise<number[][]> {
  const extractor = await getLocalExtractor();
  const out: number[][] = [];
  for (const text of texts) {
    const raw = await extractor(text, { pooling: "mean", normalize: true });
    out.push(vecFromModelOutput(raw));
  }
  return out;
}

class OllamaEmbeddingFunction implements IEmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    for (const prompt of texts) {
      const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, prompt }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(
          `Ollama embeddings failed (${res.status}): ${body.slice(0, 500)}`
        );
      }
      const json = (await res.json()) as { embedding?: number[] };
      if (!json.embedding?.length) {
        throw new Error("Ollama response missing embedding array");
      }
      vectors.push(json.embedding);
    }
    return vectors;
  }
}

class LocalMultilingualEmbeddingFunction implements IEmbeddingFunction {
  generate(texts: string[]): Promise<number[][]> {
    return embedWithLocalModel(texts);
  }
}

function createEmbeddingFunction(): IEmbeddingFunction {
  const backend = (process.env.EMBEDDING_BACKEND ?? "local").toLowerCase();
  if (backend === "ollama") {
    return new OllamaEmbeddingFunction();
  }
  return new LocalMultilingualEmbeddingFunction();
}

export const kbEmbeddingFunction = createEmbeddingFunction();
