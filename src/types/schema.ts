import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

export const chatSchema = z.object({
  message: z.string()
});

export const addDocumentSchema = z.object({
  id: z.string(),
  document: z.string(),
  metadata: z.string().optional(),
});

export const validateBody = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          errors: error,
        });
      }
      next(error);
    }
  };
};
