import { ChromaClient } from "chromadb";

export const chroma = new ChromaClient({
  path: process.env.CHROMA_URL
});
