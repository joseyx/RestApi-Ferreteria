import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { getProducts, createProduct, getProduct, wipeProduct, updateProduct, updateSku, deleteSku, getSku, getProducsByCategory, searchProductByTerm, closeExpProducts } from "../services/product.services";

const getAllProducts = async (req: Request, res: Response) => {
    try {
        const responseProducts = await getProducts();
        res.send(responseProducts)
    } catch (error) {
        handleHttp(res, 'Error getting products', error)
    }
}

const getSingleProduct = async (req: Request, res: Response) => {
    try {
        const responseProduct = await getProduct(req.params.id);
        res.send(responseProduct)
    } catch (error) {
        handleHttp(res, 'Error getting product', error)
    }
}

const createNewProduct = async (req: Request, res: Response) => {
    try {
        // console.log(req.body)
        // console.log(req.files)
        const files = req.files
        const responseProduct = await createProduct(req.body, files);
        res.send(responseProduct)
    } catch (error) {
        handleHttp(res, 'Error creating product', error)
    }
}

const deleteProduct = async (req: Request, res: Response) => {
    try {
        const productDeleted = await wipeProduct(req.params.id)
        res.send(productDeleted)
    } catch (error) {
        handleHttp(res, 'Error deleting product', error)
    }
}

const updateRootProduct = async (req: Request, res: Response) => {
    try {
        const productUpdated = await updateProduct(req.params.id, req.body)
        res.send(productUpdated)
    } catch (error) {
        handleHttp(res, 'Error updating product', error)
    }
}

const updateProductSku = async (req: Request, res: Response) => {
    try {
        const skuUpdated = await updateSku(req.params.id, req.body)
        res.send(skuUpdated)
    } catch (error) {
        handleHttp(res, 'Error updating sku', error)
    }
}

const deleteProductSku = async (req: Request, res: Response) => {
    try {
        const skuDeleted = await deleteSku(req.params.sku)
        res.send(skuDeleted)
    } catch (error) {
        handleHttp(res, 'Error deleting sku', error)
    }
}

const getProductSku = async (req: Request, res: Response) => {
    try {
        const sku = await getSku(req.params.id)
        res.send(sku)
    } catch (error) {
        handleHttp(res, 'Error deleting sku', error)
    }
}

const getProducsOnCategory = async (req: Request, res: Response) => {
    try {
        const products = await getProducsByCategory(req.params.category)
        res.send(products)
    } catch (error) {
        handleHttp(res, 'Error getting products', error)
    }
}

const searchProductWithTerm = async (req: Request, res: Response) => {
    try {
        console.log(req.params.term)
        const products = await searchProductByTerm(req.params.term)
        res.send(products)
    } catch (error) {
        handleHttp(res, 'Error getting products', error)
    }
}

const getCloseExpProducts = async (req: Request, res: Response) => {
    try {
        const products = await closeExpProducts()
        res.sendStatus(200).send(products)
    } catch (error) {
        handleHttp(res, 'Error getting products', error)
    }
}

export {
    getAllProducts,
    createNewProduct,
    getSingleProduct,
    deleteProduct,
    updateRootProduct,
    updateProductSku,
    deleteProductSku,
    getProductSku,
    getProducsOnCategory,
    searchProductWithTerm,
    getCloseExpProducts
}
