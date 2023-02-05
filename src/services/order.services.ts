import { Cart, CartProduct, Order, OrderProduct, PrismaClient, Product, User } from '@prisma/client';
import { JwtPayLoad } from '../interfaces/token.interfaces';
import { processedOrder } from './cart.services';
import { getLastTasa } from './tasa.services';

const prisma = new PrismaClient();

const createOrder = async (user: JwtPayLoad) => {

    const cart = await prisma.cart.findUnique({
        where: {
            userId: user.id
        },
        include: {
            cartProduct: true,
        }
    })

    const orderId = Math.floor(Date.now() * Math.random()).toString().slice(0, 6)

    const order = await prisma.order.create({
        data: {
            id: orderId,
            user: {
                connect: {
                    id: user.id
                }
            }
        },
        select: {
            id: true
        }
    })

    return createProductOrder(cart as (Cart & { cartProduct: CartProduct[] }), order as { id: string })
}

const createProductOrder = async (cart: (Cart & { cartProduct: CartProduct[] }),
    order: { id: string }) => {

    cart.cartProduct.forEach(async (cartProduct) => {
        await prisma.orderProduct.create({
            data: {
                price: cartProduct.price,
                quantity: cartProduct.quantity,
                order: {
                    connect: {
                        id: order.id
                    }
                },
                product: {
                    connect: {
                        id: cartProduct.productId
                    }
                }
            }
        })
    })

    return updateTotal(order, cart)
}

const updateTotal = async (order: { id: string }, cart: (Cart & { cartProduct: CartProduct[] })) => {
    const updatedOrder = await prisma.order.update({
        where: {
            id: order.id
        },
        data: {
            totalPrice: cart.total
        }
    })
    await processedOrder(cart?.id as number)
    return updatedOrder
}

const processOrder = async (order: (Order & {
    user: User; orderProducts: (OrderProduct & { product: Product })[];
}), entrega: string, payment: string, amount?: string) => {

    if (amount && payment == 'Dolares efectivo') {
        (async () => {
            await prisma.order.update({
                where: {
                    id: order.id
                },
                data: {
                    orderType: entrega,
                    paymentMethod: payment,
                    amount: amount,
                    orderStatus: 'Procesado'
                }
            })
        })()
    } else if (payment == 'Pago movil') {
        const tasaDeCambio = await getLastTasa()

        const tasa = tasaDeCambio?.tasa;

        (async () => {
            await prisma.order.update({
                where: {
                    id: order.id
                },
                data: {
                    orderType: entrega,
                    paymentMethod: payment,
                    tasa: tasa,
                    orderStatus: 'Procesado'
                }
            })
        })()
    } else {
        (async () => {
            await prisma.order.update({
                where: {
                    id: order.id
                },
                data: {
                    orderType: entrega,
                    paymentMethod: payment,
                    orderStatus: 'Procesado'
                }
            })
        })()
    }
}

export { createOrder, processOrder }

//     if (payment == 'Pago movil') {
//         const tasaDeCambio = await getLastTasa()
//         tasa = tasaDeCambio?.tasa

//         order = await prisma.order.update({
//             where: {
//                 id: order.id
//             },
//             data: {
//                 tasa: tasa
//             }
//         })
//     } else if (payment == 'Dolares efectivo') {
//         order = await prisma.order.update({
//             where: {
//                 id: order.id
//             },
//             data: {
//                 amount: amount
//             }
//         })
//     }

//     const products = cart?.cartProduct
// }

// ERRROOOOOOR tengo que crear la orden y despues agregar la informacion
