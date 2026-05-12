import type { Collection } from "chromadb";
import { chroma } from "./client";
import { kbEmbeddingFunction } from "./embeddings";

export const KB_COLLECTION_NAME =
  process.env.CHROMA_COLLECTION?.trim() || "example_collection";

export function getKnowledgeCollection(): Promise<Collection> {
  return chroma.getOrCreateCollection({
    name: KB_COLLECTION_NAME,
    embeddingFunction: kbEmbeddingFunction,
  });
}
