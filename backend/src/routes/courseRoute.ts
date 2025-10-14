import { Router } from "express";
import courseController from "../controllers/courseController.js";
import { authADMMiddleware, authMiddleware } from "../middlewares/autoMiddleware.js";

const courseRouter = Router();

courseRouter.get("/universidade", courseController.listarUniversidades);
courseRouter.get("/cursos/universidade/:idUniversidade", courseController.cursosDaUniversidade);
courseRouter.get("/cursos/adm", authMiddleware, authADMMiddleware, courseController.cursosDoADM);

export default courseRouter;
