import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import disciplinaRouter from "./routes/disciplinaRoute.js";
import authRouter from "./routes/authRoute.js"
import courseRouter from "./routes/courseRoute.js";
import { authMiddleware } from "./middlewares/autoMiddleware.js";

dotenv.config();

const server = express();
server.use(express.json());
server.use(cors());

server.use(authRouter);
server.use(courseRouter);

server.use(authMiddleware);

server.use(disciplinaRouter);

server.get("/status", (req, res) => {
  res.sendStatus(200);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;

server.listen(port, '0.0.0.0', () => console.log(`Listening to PORT ${port}`));