"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = exports.addDocumentSchema = exports.chatSchema = void 0;
const zod_1 = require("zod");
exports.chatSchema = zod_1.z.object({
    message: zod_1.z.string()
});
exports.addDocumentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    document: zod_1.z.string(),
    metadata: zod_1.z.string().optional(),
});
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    errors: error,
                });
            }
            next(error);
        }
    };
};
exports.validateBody = validateBody;
