import { NextFunction, Response } from "express";
import { RequestExt } from "../interfaces/request.interface";
import { verifyToken } from "../utils/jwt.handle";
import { roleVerification } from "../utils/role.handle";


const checkRole = (roles: string[]) => async (req: RequestExt, res: Response, next: NextFunction) => {
    try {
        const jwtByUser = req.headers.authorization || "";
        const jwt = jwtByUser.split(' ').pop();
        const isUser = verifyToken(`${jwt}`)
        // de aqui para abajo convertir en una funcion 
        // const { id } = isUser as JwtPayLoad
        // const userData = await prisma.user.findUnique({ where: { id: id } })
        // const { role } = userData as userRole
        // hasta aqui la funcion
        console.log(isUser)
        // reemplazar if por la funcion de arriba
        if (await roleVerification(isUser, roles)) {
            next()
        } else {
            res.send('Permiso Invalido').redirect('/login')
        }
    } catch (error) {
        console.log({ error })
        res.status(400).send('No tienes permiso')
    }
}

export { checkRole }
