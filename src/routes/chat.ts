import express from "express";
import { retrieveRankedChunks } from "../services/chat";
import { chatSchema, validateBody } from "../types/schema";

const router = express.Router();

router.post("/chat", validateBody(chatSchema), async (req, res) => {
    const { message } = req.body;
    const data = await retrieveRankedChunks(message);

    res.json({
        message: "Query Results",
        data,
    });
});

// For use when you want to create a chatroom interface
// router.get("/chat", (req, res) => {
//     res.send("Chat endpoint is working");
// })

export default router;