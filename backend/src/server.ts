import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const server = express();
server.use(express.json());
server.use(cors());

server.get("/status", (req, res) => {
  res.sendStatus(200);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;

server.listen(port, '0.0.0.0', () => console.log(`Listening to PORT ${port}`));