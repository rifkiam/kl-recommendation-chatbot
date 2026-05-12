"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KB_COLLECTION_NAME = void 0;
exports.getKnowledgeCollection = getKnowledgeCollection;
const client_1 = require("./client");
const embeddings_1 = require("./embeddings");
exports.KB_COLLECTION_NAME = process.env.CHROMA_COLLECTION?.trim() || "example_collection";
function getKnowledgeCollection() {
    return client_1.chroma.getOrCreateCollection({
        name: exports.KB_COLLECTION_NAME,
        embeddingFunction: embeddings_1.kbEmbeddingFunction,
    });
}
