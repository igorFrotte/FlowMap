import { Router } from 'express';
import { disciplinasDoAluno } from '../controllers/disciplinaController.js';

const router = Router();

router.get('/disciplinas', disciplinasDoAluno);

export default router;
