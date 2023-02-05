import { Response } from 'express'
import { handleHttp } from '../utils/error.handle'
import { createOrder } from '../services/order.services'
import { RequestExt } from '../interfaces/request.interface'
import { JwtPayLoad } from '../interfaces/token.interfaces'

const getCreateOrder = async (req: RequestExt, res: Response) => {
    try {
        const order = await createOrder(req.user as JwtPayLoad)
        res.send(order)
    } catch (error) {
        handleHttp(res, 'Error creating order', error)
    }
}

export { getCreateOrder }
