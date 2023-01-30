import { Request, Response } from "express";
import { getLastTasa } from "../services/tasa.services";

import { handleHttp } from "../utils/error.handle";


const lastTasa = async (req: Request, res: Response) => {
    try {
        const tasa = await getLastTasa();
        res.send(tasa)
    } catch (error) {
        handleHttp(res, 'Error getting last tasa de cambio', error);
    }
}

export { lastTasa }
