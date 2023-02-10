import { Router } from "express";
import schedule from 'node-schedule'
import { lastTasa } from "../controllers/tasa";
import { checkRole } from "../middleware/role";
import { checkJwt } from "../middleware/session";
import { addTasaDeCambio } from "../services/tasa.services";

const router = Router();

schedule.scheduleJob('0 */6 * * *', async () => {
    try {
        addTasaDeCambio();
    } catch (error) {

    }

})

router.get('/last_update', checkJwt, checkRole(['Admin']), lastTasa)
export { router }
