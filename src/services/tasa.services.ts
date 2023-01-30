import { PrismaClient } from "@prisma/client";
import axios from "axios";
import cheerio from 'cheerio'
import * as https from "https";

const prisma = new PrismaClient();

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});


const getTasa = async (url: string) => {
    const response = await axios.get(url, { httpsAgent });
    const html = response.data;

    const $ = cheerio.load(html);

    const dolar = $('#dolar').text().trim().replace(',', '.').split(' ');

    const tasa = parseFloat(dolar[dolar.length - 1])

    return tasa
}



const addTasaDeCambio = async () => {
    const tasa = await getTasa('https://www.bcv.org.ve/')

    const newTasaUpdate = await prisma.tasaDeCambio.create({
        data: {
            tasa: tasa
        }
    })
    return newTasaUpdate
}

const getLastTasa = async () => {
    const tasa = await prisma.tasaDeCambio.findFirst({
        select: {
            tasa: true,
            date: true
        },
        orderBy: {
            date: 'desc'
        },
        take: 1
    })
    return tasa
}
export { addTasaDeCambio, getLastTasa }
