import { Router } from 'express';
import { showCategories, createCategory, createChild, deleteCategoryByName } from '../controllers/category';
import { checkRole } from '../middleware/role';
import { checkJwt } from '../middleware/session';

const router = Router();

/** 
 * http://localhost:3000/category/
 */

router.get('/', showCategories);
router.post('/create', checkJwt, checkRole(['Admin']), createCategory);
router.post('/create_child', checkJwt, checkRole(['Admin']), createChild);
router.delete('/delete', checkJwt, checkRole(['Admin']), deleteCategoryByName)

export { router }
