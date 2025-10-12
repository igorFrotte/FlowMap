import { Router } from "express";
import courseController from "../controllers/courseController.js";

const courseRouter = Router();

courseRouter.get("/universidades", courseController.listarUniversidades);
courseRouter.get("/cursos/:idUniversidade", courseController.cursosDaUniversidade);

export default courseRouter;
