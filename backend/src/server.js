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

server.listen(process.env.PORT, '0.0.0.0', () => console.log(`Listening to PORT ${process.env.PORT}`));