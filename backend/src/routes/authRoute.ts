import { Router } from 'express';
import authController from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/autoMiddleware.js';

const router = Router();

router.post('/sign-in', authController.signIn);
router.get("/token", authMiddleware, authController.auth);

export default router;
