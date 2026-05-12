"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("../chroma/client");
const collection_1 = require("../chroma/collection");
const embeddings_1 = require("../chroma/embeddings");
dotenv_1.default.config();
async function seed() {
    try {
        await client_1.chroma.deleteCollection({ name: collection_1.KB_COLLECTION_NAME });
    }
    catch {
        // Collection may not exist yet
    }
    const collection = await client_1.chroma.getOrCreateCollection({
        name: collection_1.KB_COLLECTION_NAME,
        embeddingFunction: embeddings_1.kbEmbeddingFunction,
    });
    const metadatas = [
        {
            name: "Label Paper White",
            pros: "Tampilan kesan natural; Untuk menonjolkan kesan crafted; Permukaan bisa ditulis",
            for: "Produk yang butuh dirobek; Produk yang bisa ditulis atau dicoret-coret"
        },
    ];
    await collection.add({
        ids: [
            "1", "2", "3", "4", "5",
            "6", "7", "8", "9", "10",
            "11", "12", "13", "14", "15",
            "16", "17", "18", "19", "20",
            "21", "22", "23", "24"
        ],
        metadatas: metadatas,
        documents: [
            "Perusahaan mempunyai visi untuk menjadi pemimpin pasar dan misi untuk memberikan layanan terbaik kepada pelanggan",
        ]
    });
    console.log("Seeding complete");
}
seed().catch(err => {
    console.error(err);
    process.exit(1);
});
