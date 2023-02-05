import { Request, Response, Router } from 'express';

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);
import { Order, OrderProduct, PrismaClient, Product, User } from '@prisma/client';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { index } from 'cheerio/lib/api/traversing';
import { processOrder } from '../services/order.services';

const prisma = new PrismaClient();
const router = Router();

/**
 * /whatsapp
 */

declare module 'express-session' {
    export interface SessionData {
        order: (Order & {
            user: User;
            orderProducts: (OrderProduct & {
                product: Product;
            })[];
        }),
        payment: string,
        entrega: string
        amount: string
    }
}

router.post('/whatsapp', async (req: Request, res: Response) => {
    // @ts-ignore
    if (!req.session.message || req.session.step == 0) {

        const contactNumber: string = '+' + req.body.WaId
        // @ts-ignore
        req.session.contactNumber = contactNumber
        const user = await prisma.user.findUnique({
            where: {
                phoneNumber: contactNumber
            },
            select: {
                firstName: true,
                phoneNumber: true,
                id: true
            }
        })

        let message: string

        if (user) {
            // @ts-ignore
            req.session.name = user.firstName
            // @ts-ignore
            req.session.user = user
            message = `Hola!! 👋 ${user.firstName}, en que te podemos ayudar? \n 1. Informacion productos. \n 2. Procesar pedido.`
        } else {
            message = `Hola!! 👋, en que te podemos ayudar? \n Escribe unicamente el numero de la opcion deseada \n 1. Informacion productos.`
        }

        const twiml = new MessagingResponse()
        twiml.message(message)
        // @ts-ignore
        req.session.message = req.body.Body
        // @ts-ignore
        req.session.step = 1
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        // @ts-ignore
    } else if (req.session.step == 1) {
        // @ts-ignore
        const message = req.body.Body

        const twiml = new MessagingResponse()
        if (message == '1' || message == 'Informacion productos') {
            const answer = 'Por favor ingresa el nombre del producto del cual deseas informacion.'
            twiml.message(answer)
            // @ts-ignore
            req.session.step = 2
        } else if (message == '2') {
            // @ts-ignore
            const answer = `Por favor ${req.session.user.firstName} envia un mensaje con unicamente el numero de orden.`
            twiml.message(answer)
            // @ts-ignore
            req.session.step = 3
        } else {
            const answer = 'Por favor ingresa unicamente el numero de la opcion deseada'
            twiml.message(answer)
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        // @ts-ignore
    } else search: if (req.session.step == 2) {

        const message = req.body.Body
        if (message == 'Finalizar') {
            req.session.destroy(() => {
                const twiml = new MessagingResponse()
                twiml.message('Gracias por contactarnos, esperamos haberte sido de utilidad');
                res.writeHead(200, { 'Content-Type': 'text/xml' });
                res.end(twiml.toString());
            })
            break search;
        }

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    {
                        productName: {
                            contains: message
                        }
                    },
                    {
                        keywords: {
                            some: {
                                keyword: {
                                    contains: message
                                }
                            }
                        }
                    },
                    {
                        categories: {
                            some: {
                                categoryName: {
                                    contains: message
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                productName: true,
                description: true,
                sku: {
                    select: {
                        price: true,
                        stock: true,
                        unit: true
                    }
                }
            },
            take: 5
        })

        console.log(message, products)

        let answer: string = ''

        const twiml = new MessagingResponse()

        if (products.length == 0) {
            answer = 'No se encontro el producto. \nPuedes hacer una nueva busqueda.'

        } else if (products.length == 1) {
            const product = products[0]
            answer = `Se encontro el el siguiente producto: \n*${product.productName}* \n${product.description} \n\n*Precio: ${product.sku?.price}*
            \n*${product.sku?.unit} disponibles: ${product.sku?.stock}*.\n\nPuedes escribir nuevamente para realizar otra busqueda.
            O escribir 'Finalizar' para dar por terminada la session`

        } else if (products.length > 1) {
            answer = 'Se encontraron las siguientes opciones: \n'
            products.forEach((product, index) => answer = answer + `\n${index + 1}. *${product.productName}*`)
            // @ts-ignore
            req.session.products = products
            // @ts-ignore
            req.session.step = 2.5
            answer = answer + '\n\nIngresa el numero correspondiente para recibir la información del producto'
        }

        twiml.message(answer)
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        // @ts-ignore
    } else searchResults: if (req.session.step == 2.5) {

        let input: string = req.body.Body
        let index: number = 0

        if (input == 'Regresar') {
            // @ts-ignore
            req.session.step = 2
            const twiml = new MessagingResponse()
            twiml.message('Ingresa un nuevo producto a buscar');
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
            break searchResults;

        } else if (input == 'Finalizar') {
            req.session.destroy(() => {
                const twiml = new MessagingResponse()
                twiml.message('Gracias por contactarnos, esperamos haberte sido de utilidad');
                res.writeHead(200, { 'Content-Type': 'text/xml' });
                res.end(twiml.toString());
            })
            break search;
        }

        const userInput = parseInt(req.body.Body)
        if (0 < userInput && userInput < 6) {
            index = userInput - 1;
        }
        // @ts-ignore
        const product = req.session.products[index];

        console.log(product);

        const answer = `*${product.productName}*\n${product.description} \n\n*Precio: ${product.sku?.price}*
        \n*${product.sku?.unit} disponibles: ${product.sku?.stock}* \n
        \nPuedes ingresar otro numero correspondiente a la busqueda.
        \nEnviar 'Regresar' para realizar otra busqueda.
        \nO enviar 'Finalizar' para dar por terminada la sesión.`

        const twiml = new MessagingResponse()
        twiml.message(answer)
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());

        // @ts-ignore
    } else orderType: if (req.session.step == 3) {


        const twiml = new MessagingResponse()
        let message: string = ''

        if (req.body.Body == 0) {
            req.session.destroy(() => {
                // @ts-ignore
                req.session.step = 0
                message = 'Gracias por escribirnos, esperamos haberte ayudado.'
                twiml.message(message)
                res.writeHead(200, { 'Content-Type': 'text/xml' });
                res.end(twiml.toString());
            })
            break orderType
        }

        const orderNumber = req.body.Body
        // @ts-ignore
        const phoneNumber: string = req.session.contactNumber

        const order = await prisma.order.findUnique({
            where: {
                id: orderNumber,
            }, include: {
                user: true,
                orderProducts: {
                    include: {
                        product: true
                    }
                }
            },
        })
        if (order?.orderStatus == 'Procesado') {
            message = 'La orden ya fue procesada.'
            twiml.message(message)
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
            break orderType
        }
        req.session.order = order as (Order & {
            user: User;
            orderProducts: (OrderProduct & {
                product: Product;
            })[];
        })
        if (order?.user.phoneNumber == phoneNumber) {
            message = `Por favor verifique su orden\n\n
Numero de orden: *${order.id}*\n
---------------------------------\n`
            order.orderProducts.forEach((product, index) =>
                message = message + `${index + 1}. ${product.product.productName}\n
Cantidad: *${product.quantity}*   Precio: *${product.price}*\n`
            )
            message = message + `---------------------------------\n\n
Total del pedido: $${order.totalPrice}\n\n
Si el pedido es correcto indique la opcione correspondiente al metodo de entrega:\n
    1. Retiro en la tienda
    2. Delivery
    3. Cancelar el pedido`
            // @ts-ignore
            req.session.step = 4
        } else {
            message = 'El numero de orden no fue encontrado o la cuenta que lo hizo no se encuentra vinculada a este numero de telefono\n\n'
            message += 'Puede volver a enviar un numero de orden o enviar  0 para finalizar la sesion'
        }
        twiml.message(message)
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());

        // @ts-ignore
    } else orderPayment: if (req.session.step == 4) {

        const answer = req.body.Body
        const twiml = new MessagingResponse()

        if (req.body.Body == 'Finalizar') {
            req.session.destroy(() => {
                const message = 'Gracias por escribirnos, esperamos haberte ayudado.'
                twiml.message(message)
                res.writeHead(200, { 'Content-Type': 'text/xml' });
                res.end(twiml.toString());
            })
            break orderPayment
        }



        if (answer == '1') {
            // @ts-ignore
            req.session.entrega = 'Retiro en el local'
        } else if (answer == '2') {
            // @ts-ignore
            req.session.entrega = 'Delivery'
        } else {
            const message = `Opcion invalida, por favor ingresa unicamente el numero de la opcion deseada
            O envia 'Finalizar' para finalizar la sesion`
            twiml.message(message)
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
            break orderPayment
        }

        // @ts-ignore
        req.session.step = 5
        const message = `Ahora ingrese por favor la opcion correspondiente al metodo de pago: \n\n
1. Dolares efectivo (ingrese la opcion seguida de la denominacion del billete) \n
2. Dolares transferencia\n
3. Pago movil`
        twiml.message(message)
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());

        // @ts-ignore
    } else orderFinal: if (req.session.step == 5) {

        const answer: string = req.body.Body;
        console.log(answer);

        if (answer.charAt(0) == '1') {
            // @ts-ignore
            req.session.payment = 'Dolares efectivo'

            const amount = answer.split(' ')[1]
            // @ts-ignore
            req.session.amount = amount
            console.log(amount)
        } else if (answer == '2') {
            // @ts-ignore
            req.session.payment = 'Dolares transferencia'
        } else if (answer == '3') {
            // @ts-ignore
            req.session.payment = 'Pago movil'
        } else {
            const twiml = new MessagingResponse()
            twiml.message('Por favor ingresa una opcion valida');
            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(twiml.toString());
            break orderFinal;
        }
        const twiml = new MessagingResponse()
        twiml.message('Su orden fue procesada, en breve se le notificara cuando sea aprobada');
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString())
        // @ts-ignore
        if (req.session.amount) {
            // @ts-ignore
            await processOrder(req.session.order, req.session.entrega, req.session.payment, req.session.amount)
        } else {

        }
    }
})

export { router }
