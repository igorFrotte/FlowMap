import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { STATUS_CODE } from "../enums/statusCode.js";

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  userId: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) 
    return res.sendStatus(STATUS_CODE.UNAUTHORIZED);

  try {
    const key = process.env.TOKEN_SECRET || "chaveSecreta";
    const decoded = jwt.verify(token, key) as CustomJwtPayload;

    if (decoded && decoded.userId) {
      res.locals.userId = decoded.userId;
      next();
    } else {
      return res.status(STATUS_CODE.UNAUTHORIZED).json({ error: "Token inválido" });
    }
  } catch {
    return res.sendStatus(STATUS_CODE.UNAUTHORIZED);
  }
}
