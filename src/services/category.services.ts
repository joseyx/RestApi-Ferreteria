import { categoryInterface, categoryChildInterface } from '../interfaces/category.interface';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

const getCategories = async () => {
    return await prisma.category.findMany({
        where: {
            parentCategoryId: {
                equals: null
            }
        },
        select: {
            id: true,
            categoryName: true,
            parentCategoryId: true,
            childrenCategory: {
                select: {
                    id: true,
                    parentCategoryId: true,
                    categoryName: true,
                    product: {
                        select: {
                            productName: true,
                        }
                    }
                }
            },
            product: {
                select: {
                    productName: true
                }
            }
        }
    })
}

const createNewCategory = async ({ categoryName }: categoryInterface) => {
    const catergoryExists = await prisma.category.findUnique({
        where: { categoryName: categoryName }
    })
    if (catergoryExists) return "Category already exists"
    const addNewCategory = await prisma.category.create({
        data: {
            categoryName: categoryName,
        }, include: {
            childrenCategory: false,
        }
    })
    return addNewCategory
}

const createChildCategory = async ({ categoryName, parentCategory }: categoryChildInterface) => {

    const childCategory = await prisma.category.update({
        where: {
            categoryName: parentCategory
        }, include: {
            childrenCategory: true
        }, data: {
            childrenCategory: {
                create: {
                    categoryName: categoryName
                }
            }
        }
    })
    return childCategory
}

const deleteCategory = async ({ categoryName }: categoryInterface) => {
    const deleteCategory = await prisma.category.delete({
        where: {
            categoryName: categoryName,
        },
    })
    return deleteCategory
}

export { getCategories, createNewCategory, createChildCategory, deleteCategory }
