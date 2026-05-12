import express from "express";
import { generateRagReply } from "../services/chat";
import { chatSchema, validateBody } from "../types/schema";

const router = express.Router();

router.post("/chat", validateBody(chatSchema), async (req, res) => {
  const { message } = req.body;
  try {
    const { reply, sources } = await generateRagReply(message);
    res.json({ reply, sources });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(503).json({
      error: "Chat generation failed",
      detail: msg,
    });
  }
});

// For use when you want to create a chatroom interface
// router.get("/chat", (req, res) => {
//     res.send("Chat endpoint is working");
// })

export default router;