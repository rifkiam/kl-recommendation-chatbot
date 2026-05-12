"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_1 = require("../services/chat");
const schema_1 = require("../types/schema");
const router = express_1.default.Router();
router.post("/chat", (0, schema_1.validateBody)(schema_1.chatSchema), async (req, res) => {
    const { message } = req.body;
    const data = await (0, chat_1.retrieveRankedChunks)(message);
    res.json({
        message: "Query Results",
        data,
    });
});
// For use when you want to create a chatroom interface
// router.get("/chat", (req, res) => {
//     res.send("Chat endpoint is working");
// })
exports.default = router;
