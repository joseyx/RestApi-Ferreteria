import { Router } from "express";
import { createNewProduct, getAllProducts, deleteProduct, updateRootProduct, updateProductSku, deleteProductSku, getProductSku, getSingleProduct, getProducsOnCategory, searchProductWithTerm, getCloseExpProducts, getMainPageProducts } from "../controllers/product";
import multer from "../libs/multer";
import { checkRole } from "../middleware/role";
import { checkJwt } from "../middleware/session";

const router = Router();

/**
 * /products/
 */



router.get('/', getAllProducts);
router.post('/create_product', multer.fields([
    {
        name: 'thumbnail',
        maxCount: 1,
    },
    {
        name: 'photos',
        maxCount: 10
    }
]), createNewProduct);

router.route('/product/:id')
    .get(getSingleProduct)
    .delete(checkJwt, checkRole(['Admin', 'Manager']), deleteProduct)
    .patch(checkJwt, checkRole(['Admin', 'Manager']), updateRootProduct)

router.get('/exp', checkJwt, checkRole(['Admin', 'Manager']), getCloseExpProducts)

router.route('/sku/:id')
    .patch(checkJwt, checkRole(['Admin', 'Manager']), updateProductSku)
    .get(getProductSku)
    .delete(checkJwt, checkRole(['Admin', 'Manager']), deleteProductSku)

router.get('/category/:category', getProducsOnCategory)

router.get('/search/:term', searchProductWithTerm)

router.get('/featured', getMainPageProducts)

export { router }
