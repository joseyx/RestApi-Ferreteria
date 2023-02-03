import { Cart, Prisma, PrismaClient, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { ICartProduct } from '../interfaces/cart.interface';
import { JwtPayLoad } from '../interfaces/token.interfaces';

const prisma = new PrismaClient();


const createCart = (user: JwtPayLoad) => {
    const { id } = user;
    const cart = prisma.user.update({
        where: {
            id: id,
        },
        data: {
            cart: {
                create: {

                }
            }
        }
    })
    return cart
}

const newProductToCart = async ({ productId, quantity }: ICartProduct, user: JwtPayLoad) => {
    const rootProduct = await prisma.product.findUnique({
        where: {
            id: productId
        },
        include: {
            sku: true
        }
    })
    let price: Decimal = new Prisma.Decimal(0.00)
    if (rootProduct != null && rootProduct.sku != null) {
        price = rootProduct.sku.price.mul(quantity)
        if (rootProduct.sku.stock < quantity) {
            return 'Cantidad supera el stock disponible'
        }
        if (await checkCartProduct(user.cartId, productId)) {
            return reAddProduct(quantity, user.cartId, rootProduct.id, rootProduct.sku.stock)
        }
    }

    const createCartProduct = await prisma.cartProduct.create({
        data: {
            product: {
                connect: {
                    id: productId
                }
            },
            cart: {
                connect: {
                    id: user.cartId
                }
            },
            price: new Prisma.Decimal(price),
            quantity: quantity
        }
    })
    createCartProduct

    return sumProductsPrice(user.cartId)
}

const sumProductsPrice = async (id: number) => {
    const x = await prisma.cartProduct.aggregate({
        _sum: {
            price: true
        },
        where: {
            cart: {
                id: id
            }
        }
    })
    return updateCartTotal(x._sum.price as Prisma.Decimal, id)
}

const updateCartTotal = async (suma: Prisma.Decimal = new Prisma.Decimal(0.00), id: number) => {
    const updatedCartTotal = await prisma.cart.update({
        where: {
            userId: id,
        },
        data: {
            total: suma
        },
    })
    return updatedCartTotal
}

const reAddProduct = async (quantity: number, id: number, productId: number, productStock: number) => {
    const cart = await prisma.cart.findUnique({
        where: {
            id: id
        },
        select: {
            id: true
        }
    }) as Cart
    const cartId = cart.id

    const cartProduct = await prisma.cartProduct.findUnique({
        where: {
            cartId_productId: { cartId, productId }
        }
    })

    if (cartProduct != null) {
        if ((cartProduct.quantity + quantity) > productStock) {
            return 'Cantidad supera el stock disponible'
        }
    }

    const updateCartProduct = await prisma.cartProduct.update({
        where: {
            cartId_productId: { cartId, productId }
        },
        data: {
            quantity: {
                increment: quantity
            }
        }
    })
    updateCartProduct
    return sumProductsPrice(id)
}

const checkCartProduct = async (id: number, productId: number) => {
    const cart = await prisma.cart.findUnique({
        where: {
            id: id
        },
        select: {
            id: true
        }
    }) as Cart
    const cartId = cart.id
    return await prisma.cartProduct.findUnique({
        where: {
            cartId_productId: { cartId, productId }
        }
    })
}

const changeCartProductQuantity = async ({ productId, quantity }: ICartProduct, user: JwtPayLoad) => {
    const cartId = user.cartId
    const changeOrderAmount = await prisma.cartProduct.update({
        where: {
            cartId_productId: { cartId, productId }
        },
        data: {
            quantity: quantity
        }
    })
    changeOrderAmount
    return sumProductsPrice(user.id)
}

const processedOrder = async (id: number) => {
    const cleanCart = await prisma.cart.update({
        where: {
            id: id,
        },
        data: {
            cartProduct: {
                deleteMany: {}
            }
        }
    })
    cleanCart
    return sumProductsPrice(id)
}

const getCart = async (user: JwtPayLoad) => {
    const userId = user.id
    const cart = await prisma.cart.findUnique({
        where: {
            userId: userId
        },
        select: {
            cartProduct: {
                select: {
                    quantity: true,
                    price: true,
                    product: {
                        select: {
                            thumbnail: true,
                            productName: true,
                            sku: {
                                select: {
                                    sku: true,
                                    price: true
                                }
                            }
                        }
                    }
                }
            },
            total: true
        }
    })
    return cart
}

export { newProductToCart, createCart, changeCartProductQuantity, processedOrder, getCart }
