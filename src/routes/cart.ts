import { Router } from 'express';
import { addProduct, changeQuantity, createUserCart } from '../controllers/cart';
import { checkJwt } from '../middleware/session';


const router = Router();

/** 
 * /cart/
 */

router.post('/add_product', checkJwt, addProduct);
router.post('/create_cart', checkJwt, createUserCart);
router.post('/update_order', checkJwt, changeQuantity);


export { router }
