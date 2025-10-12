import { Router } from 'express';
import disciplinaController from '../controllers/disciplinaController.js';

const router = Router();

router.get('/disciplinas', disciplinaController.disciplinasDoAluno);
router.patch('/disciplinas/aprovadas', disciplinaController.updateAprovadas);
router.patch('/disciplinas/periodoplan', disciplinaController.updatePeriodoPlan);

export default router;
