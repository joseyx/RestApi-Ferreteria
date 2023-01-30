import { Router } from 'express';
import { registerCtrl, loginCtrl } from '../controllers/auth';

const router = Router();

/** 
 * /auth/
 */

router.post('/register', registerCtrl);
router.post('/login', loginCtrl);

export { router }
