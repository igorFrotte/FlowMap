import { Router } from "express";
import courseController from "../controllers/courseController.js";
import { authADMMiddleware, authMiddleware } from "../middlewares/autoMiddleware.js";

const courseRouter = Router();

courseRouter.get("/universidade", courseController.listarUniversidades);
courseRouter.get("/curso/universidade/:idUniversidade", courseController.cursosDaUniversidade);
courseRouter.get("/curso/adm", authMiddleware, authADMMiddleware, courseController.cursosDoADM);
courseRouter.post("/universidade",authMiddleware, authADMMiddleware,  courseController.criarUniversidade);
courseRouter.get("/curso/:idCurso", authMiddleware, authADMMiddleware, courseController.buscarCursoPeloId );

export default courseRouter;
