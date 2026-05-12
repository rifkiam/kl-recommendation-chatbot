import express from "express";
import { getKnowledgeCollection } from "../chroma/collection";
import { addDocumentSchema, validateBody } from "../types/schema";

const router = express.Router();

router.get("/data", async (_req, res) => {
    const collection = await getKnowledgeCollection();
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

router.post("/data", validateBody(addDocumentSchema), async (req, res) => {
    const collection = await getKnowledgeCollection();
    
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
    const collection = await getKnowledgeCollection();
    
    if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
    }

    await collection.delete({ ids: [id] });
    res.json({ message: "Document deleted successfully" });
});

export default router;
