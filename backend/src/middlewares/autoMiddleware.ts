import { STATUS_CODE } from "../enums/statusCode.js";
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();


export function authMiddleware(req : Request, res : Response, next: () => void) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.sendStatus(STATUS_CODE.UNAUTHORIZED);
    return;
  }

  try {
    const key = process.env.TOKEN_SECRET || "chaveSecreta";
    const verifyToken = jwt.verify(token, key);
    if (typeof verifyToken === 'object' && 'userId' in verifyToken) {
        res.locals.userId = verifyToken.userId;
        next();
    } else return res.status(STATUS_CODE.UNAUTHORIZED).json({ error: "Token inválido" });
  } catch (error) {
    res.sendStatus(STATUS_CODE.UNAUTHORIZED);
  }
}