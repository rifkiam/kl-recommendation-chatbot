import express from "express";
import dotenv from "dotenv";
import healthRouter from "./routes/health";
import chatRouter from "./routes/chat";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api",
  healthRouter,
  chatRouter
);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
