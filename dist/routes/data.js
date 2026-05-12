"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const collection_1 = require("../chroma/collection");
const schema_1 = require("../types/schema");
const router = express_1.default.Router();
router.get("/data", async (_req, res) => {
    const collection = await (0, collection_1.getKnowledgeCollection)();
    const results = await collection.get();
    const newRes = results.ids.map((id, index) => ({
        id,
        document: results.documents[index],
        metadata: results.metadatas ? results.metadatas[index] : null,
    }));
    res.json({
        message: "Data retrieved successfully",
        data: newRes
    });
});
router.post("/data", (0, schema_1.validateBody)(schema_1.addDocumentSchema), async (req, res) => {
    const collection = await (0, collection_1.getKnowledgeCollection)();
    const { id, document, metadata } = req.body;
    await collection.add({
        ids: [id],
        documents: [document],
        metadatas: metadata ? [metadata] : undefined
    }).then(() => {
        res.status(201).json({
            message: "Document added successfully",
            data: { id, document, metadata }
        });
    }).catch((error) => {
        res.status(500).json({ message: "Error adding document", error });
    });
});
router.delete("/data/:id", async (req, res) => {
    const { id } = req.params;
    const collection = await (0, collection_1.getKnowledgeCollection)();
    if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
    }
    await collection.delete({ ids: [id] });
    res.json({ message: "Document deleted successfully" });
});
exports.default = router;
