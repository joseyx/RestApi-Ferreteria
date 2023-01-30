import { Response } from "express";
import { RequestExt } from "../interfaces/request.interface";
import { JwtPayLoad } from "../interfaces/token.interfaces";
import { changeCartProductQuantity, createCart, newProductToCart } from "../services/cart.services";
import { handleHttp } from "../utils/error.handle";

const addProduct = async ({ body, user }: RequestExt, res: Response) => {
    try {
        const productToCart = await newProductToCart(body, user as JwtPayLoad);
        res.send(productToCart)
    } catch (err) {
        handleHttp(res, 'Error adding product to cart', err);
    }
}

const createUserCart = async ({ user }: RequestExt, res: Response) => {
    try {
        const userCart = await createCart(user as JwtPayLoad);
        res.send(userCart);
    } catch (error) {
        handleHttp(res, 'Error creating user cart', error);
    }
}

const changeQuantity = async ({ body, user }: RequestExt, res: Response) => {
    try {
        const userCart = await changeCartProductQuantity(body, user as JwtPayLoad)
        res.send(userCart)
    } catch (error) {
        handleHttp(res, 'Error changing cart product quantity', error);
    }
}


export { addProduct, createUserCart, changeQuantity }
