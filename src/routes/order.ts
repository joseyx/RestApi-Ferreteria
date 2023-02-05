import { Router } from 'express'
import { getCreateOrder } from '../controllers/order'
import { checkJwt } from '../middleware/session'

const router = Router()

/*
    /order/
*/
router.get('/', checkJwt, getCreateOrder)

export { router }
