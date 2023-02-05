import { Router } from 'express'
import { getCreateOrder } from '../controllers/order'
import { checkJwt } from '../middleware/session'

const router = Router()

router.get('/', checkJwt, getCreateOrder)

export { router }
