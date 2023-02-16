import { PrismaClient, Product } from "@prisma/client";
import { files, productInterface, skuInterface } from "../interfaces/product.interface";
import fs from 'fs-extra'
import path from "path";



const prisma = new PrismaClient();

const getProducts = async () => {
    return await prisma.product.findMany({
        select: {
            id: true,
            productName: true,
            description: true,
            thumbnail: true,
            sku: {
                select: {
                    sku: true,
                    stock: true,
                    price: true,
                }
            }
        }
    })
}

const getProduct = async (id: string) => {
    const productID = parseInt(id)
    return await prisma.product.findUnique({
        where: {
            id: productID,
        },
        select: {
            productName: true,
            description: true,
            photos: true,
            thumbnail: true,
            categories: {
                where: {
                    parentCategoryId: {
                        equals: null
                    },

                },
                select: {
                    id: true,
                    categoryName: true,
                }
            },
            sku: {
                select: {
                    sku: true,
                    minStock: true,
                    stock: true,
                    price: true,
                    unit: true
                }
            }
        }
    })
}


const createProduct = async (body: productInterface, files: files | any) => {
    console.log('creating product')

    const isFiles = (object: any): object is files => {
        return 'thumbnail' in object
    }

    const checkIsProduct = await prisma.product.findUnique({
        where: {
            productName: body.productName
        }
    })
    if (checkIsProduct) return 'Product already exists'


    const categories: string[] = body.categories

    const checkIsCategory = await prisma.category.findMany({
        where: {
            categoryName: {
                in: categories
            }
        }
    })

    if (checkIsCategory.length == 0) return "Category doesn't exist"

    const productPrice = Number(body.sku.price)
    const productStock = Number(body.sku.stock)
    const productMinStock = Number(body.sku.minStock)

    let thumbnailPath = files.thumbnail[0].path;
    let photos

    if (isFiles(files)) {
        photos = files.photos.map(photo => photo.path)
    }



    const addNewProductOnly = await prisma.product.create({
        data: {
            productName: body.productName,
            description: body.description,
            thumbnail: thumbnailPath,
            categories: {
                connect: categories.map((category) => ({
                    categoryName: category
                }))
            },
            keywords: {
                connectOrCreate: body.keywords.map((keyword) => ({
                    where: {
                        keyword: keyword
                    },
                    create: {
                        keyword: keyword
                    }
                }))
            },
            photos: photos,
            sku: {
                create: {
                    minStock: productMinStock,
                    price: productPrice,
                    stock: productStock,
                    sku: body.sku.sku
                }
            }
        },
        select: {
            id: true,
            productName: true,
            description: true,
            categories: true,
            photos: true,
            thumbnail: true,
            sku: true,
        }
    })

    if (body.sku.expDate) {
        const productWithExpiration = await prisma.product.update({
            where: {
                id: addNewProductOnly.id
            },
            data: {
                sku: {
                    update: {
                        expDate: body.sku.expDate
                    }
                }
            }
        })

        return productWithExpiration
    }

    return addNewProductOnly
}

const disconnectProductCategories = async (id: number) => {
    const disconectCategories = await prisma.product.update({
        where: {
            id: id
        },
        data: {
            categories: {
                set: []
            }
        }
    })
    return disconectCategories
}

const disconnectKeywords = async (id: number) => {
    const disconnectKeyword = await prisma.product.update({
        where: {
            id: id,
        },
        data: {
            keywords: {
                set: []
            }
        }
    })
    return disconnectKeyword
}

const updateProduct = async (id: string, body: productInterface) => {
    const productId = parseInt(id)
    await disconnectProductCategories(productId)
    await disconnectKeywords(productId)
    const product = await prisma.product.update({
        where: {
            id: productId
        },
        data: {
            productName: body.productName,
            description: body.description,
            thumbnail: body.thumbnail,
            categories: {
                connect: body.categories.map((category) => ({
                    categoryName: category
                }))
            },
            keywords: {
                connectOrCreate: body.keywords.map((keyword) => ({
                    where: {
                        keyword: keyword
                    },
                    create: {
                        keyword: keyword
                    }
                }))
            },
            photos: body.photos,
            sku: {
                create: {
                    minStock: body.sku.minStock,
                    price: body.sku.price,
                    stock: body.sku.stock,
                    sku: body.sku.sku
                }
            }
        }
    })
    return product
}

const getSku = async (id: string) => {
    const productId = parseInt(id)
    const getSkuData = await prisma.product.findUnique({
        where: {
            id: productId
        },
        select: {
            sku: true
        }
    })
}

const updateSku = async (id: string, body: skuInterface) => {
    const productId = parseInt(id)
    const updatedSku = await prisma.product.update({
        where: {
            id: productId
        },
        data: {
            sku: {
                update: {
                    minStock: body.minStock,
                    price: body.price,
                    sku: body.sku,
                    stock: body.stock
                }
            }
        }
    })
    return updatedSku
}

const deleteSku = async (sku: string) => {
    const deletedSku = await prisma.sku.delete({
        where: {
            sku: sku
        }
    })
    return deletedSku
}

const wipeImages = async (productDelete: Product) => {
    productDelete.photos.forEach(async photo => {
        await fs.unlink(path.resolve(photo))
    });
    await fs.unlink(path.resolve(productDelete.thumbnail));
}

const wipeProduct = async (id: string) => {
    const productId = parseInt(id)
    const productDelete = await prisma.product.delete({
        where: {
            id: productId
        }
    })
    return await wipeImages(productDelete)
}
// export { getProducts, createProduct, createProductWithVariant, productWithVariantAdded, getProduct, wipeProduct, updateProduct, updateSku, deleteSku }

const searchProductBar = async (searchTerm: string) => {
    const searchResults = await prisma.product.findMany({
        where: {
            OR: [
                {
                    productName: {
                        contains: searchTerm
                    }
                },
                {
                    keywords: {
                        some: {
                            keyword: {
                                contains: searchTerm
                            }
                        }
                    }
                },
                {
                    categories: {
                        some: {
                            categoryName: {
                                contains: searchTerm
                            }
                        }
                    }
                }
            ]
        },
        select: {
            productName: true
        },
        take: 5
    })
    return searchResults
}

const searchProductByTerm = async (searchTerm: string) => {
    const searchResults = await prisma.product.findMany({
        where: {
            OR: [
                {
                    productName: {
                        contains: searchTerm,
                    }
                },
                {
                    keywords: {
                        some: {
                            keyword: {
                                contains: searchTerm
                            }
                        }
                    }
                },
                {
                    categories: {
                        some: {
                            categoryName: {
                                contains: searchTerm
                            }
                        }
                    }
                }
            ]
        },
        select: {
            id: true,
            productName: true,
            thumbnail: true,
            sku: {
                select: {
                    price: true
                }
            }
        }
    })
    return searchResults
}

const getProducsByCategory = async (category: string) => {
    const products = await prisma.product.findMany({
        where: {
            AND: [
                {
                    categories: {
                        some: {
                            OR: [
                                {
                                    categoryName: category
                                },
                                {
                                    parentCategory: {
                                        categoryName: category
                                    }
                                }
                            ]
                        }
                    },
                },
                {
                    sku: {
                        stock: {
                            gt: 0
                        }
                    }
                }
            ]
        },
        select: {
            productName: true,
            thumbnail: true,
            sku: {
                select: {
                    price: true
                }
            }
        }
    })
    return products
}

const closeExpProducts = async () => {
    let date = new Date();
    date.setDate(date.getDate() + 30)

    const products = await prisma.sku.findMany({
        where: {
            expDate: {
                lte: date
            }
        }
    })
    return products
}

const mainPageProducts = async () => {
    console.log('here')
    const products = await getProducts()
    const randomProducts = products.sort(() => 0.5 - Math.random())

    return randomProducts.slice(0, 12)
}
export {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    getSku,
    updateSku,
    deleteSku,
    wipeProduct,
    searchProductBar,
    searchProductByTerm,
    getProducsByCategory,
    closeExpProducts,
    mainPageProducts
}
