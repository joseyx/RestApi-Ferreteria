import { Cart, CartProduct, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { chatbotUser } from '../interfaces/user.interface';
import { getLastTasa } from './tasa.services';

const prisma = new PrismaClient();

const createOrder = async (User: chatbotUser, entrega: string, payment: string, amount?: string) => {

    const user = User
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

    return createProductOrder(user, cart as (Cart & { cartProduct: CartProduct[] }), order as { id: string })
}

const createProductOrder = async (User: chatbotUser, cart: (Cart & { cartProduct: CartProduct[] }),
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

    return updateTotal
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
    return updatedOrder
}

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
