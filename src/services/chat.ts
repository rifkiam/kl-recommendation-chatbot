import { getKnowledgeCollection } from "../chroma/collection";
import {
  RETRIEVAL_POOL_SIZE,
  RESPONSE_TOP_N,
  rankQueryHits,
  type RankedHit,
} from "../chroma/queryRank";

export type { RankedHit };

export type ChatRetrievalOptions = {
  /** Chroma vector query pool size (before intent sort / slice). */
  poolSize?: number;
  /** Number of hits to return after ranking. */
  topN?: number;
};

/**
 * Core RAG retrieval used by POST /api/chat: Chroma semantic search + intent-aware ranking.
 */
export async function retrieveRankedChunks(
  message: string,
  options?: ChatRetrievalOptions
): Promise<RankedHit[]> {
  const poolSize = options?.poolSize ?? RETRIEVAL_POOL_SIZE;
  const topN = options?.topN ?? RESPONSE_TOP_N;

  const collection = await getKnowledgeCollection();
  const results = await collection.query({
    queryTexts: [message],
    nResults: poolSize,
  });

  return rankQueryHits(results, message, topN);
}
