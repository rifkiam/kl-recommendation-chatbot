"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chroma = void 0;
const chromadb_1 = require("chromadb");
exports.chroma = new chromadb_1.ChromaClient({
    path: process.env.CHROMA_URL
});
