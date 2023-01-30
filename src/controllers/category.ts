import { Request, Response } from "express";
import { createNewCategory, getCategories, createChildCategory, deleteCategory } from "../services/category.services";
import { handleHttp } from "../utils/error.handle";


const showCategories = async (req: Request, res: Response) => {
    try {
        const responseCategories = await getCategories()
        res.send(responseCategories)
    } catch (error) {
        handleHttp(res, 'Error getting categories', error)
    }
}

const createCategory = async ({ body }: Request, res: Response) => {
    try {
        const responseUser = await createNewCategory(body);
        res.send(responseUser)
    } catch (err) {
        handleHttp(res, 'Error creating new user', err);
    }
}

const createChild = async ({ body }: Request, res: Response) => {
    try {
        const responseUser = await createChildCategory(body);
        res.send(responseUser)
    } catch (err) {
        handleHttp(res, 'Error at login', err);
    }
}

const deleteCategoryByName = async ({ body }: Request, res: Response) => {
    try {
        const responseDeleteCategory = await deleteCategory(body);
        res.send(responseDeleteCategory)
    } catch (error) {
        handleHttp(res, 'Error deleting category', error);
    }
}

// export { createCategory, createChild }

export { showCategories, createCategory, createChild, deleteCategoryByName }
