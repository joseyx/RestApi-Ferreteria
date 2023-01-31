import { Request, Response, Router } from 'express';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
import { PrismaClient } from '@prisma/client';
import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import { index } from 'cheerio/lib/api/traversing';

const prisma = new PrismaClient();
const router = Router();

/**
 * /whatsapp
 */

router.post('/whatsapp', async (req: Request, res: Response) => {
    // @ts-ignore
    if (!req.session.message || req.session.step == 0) {
        const contactNumber: string = '+' + req.body.WaId
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
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        // @ts-ignore
    } else if (req.session.step == 2) {
        const message = req.body.Body

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
            \n*${product.sku?.unit} disponibles: ${product.sku?.stock}*`
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
    } else if (req.session.step == 2.5) {

        let index: number = 0
        const userInput = parseInt(req.body.Body)
        if (0 < userInput && userInput < 6) {
            index = userInput - 1;
        }
        // @ts-ignore
        const product = req.session.products[index];
        console.log(product);
        const answer = `*${product.productName}*\n${product.description} \n\n*Precio: ${product.sku?.price}*
        \n*${product.sku?.unit} disponibles: ${product.sku?.stock}* \n\nPuedes ingresar otro numero correspondiente a la busqueda o enviar un 0 para realizar otra busqueda`
        const twiml = new MessagingResponse()
        twiml.message(answer)
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    }
})

export { router }
