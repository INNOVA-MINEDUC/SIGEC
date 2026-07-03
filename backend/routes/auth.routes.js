import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  AuthLogin,
  AuthLogout,
  isAuthenticated
} from '../controllers/AuthController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

router.post('/login', AuthLogin);
router.post('/logout', verifyToken, AuthLogout);
router.get('/validate-token', authLimiter, isAuthenticated);


export default router;
