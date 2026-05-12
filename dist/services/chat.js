"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveRankedChunks = retrieveRankedChunks;
const collection_1 = require("../chroma/collection");
const queryRank_1 = require("../chroma/queryRank");
/**
 * Core RAG retrieval used by POST /api/chat: Chroma semantic search + intent-aware ranking.
 */
async function retrieveRankedChunks(message, options) {
    const poolSize = options?.poolSize ?? queryRank_1.RETRIEVAL_POOL_SIZE;
    const topN = options?.topN ?? queryRank_1.RESPONSE_TOP_N;
    const collection = await (0, collection_1.getKnowledgeCollection)();
    const results = await collection.query({
        queryTexts: [message],
        nResults: poolSize,
    });
    return (0, queryRank_1.rankQueryHits)(results, message, topN);
}
