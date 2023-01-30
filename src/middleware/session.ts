import { NextFunction, Request, Response } from "express";
import { RequestExt } from "../interfaces/request.interface";
import { verifyToken } from "../utils/jwt.handle";

const checkJwt = (req: RequestExt, res: Response, next: NextFunction) => {
    try {
        const jwtByUser = req.headers.authorization || "";
        const jwt = jwtByUser.split(' ').pop();
        const isUser = verifyToken(`${jwt}`)
        console.log(isUser)
        if (!isUser) {
            res.status(401).send('Session expired')
        } else {
            req.user = isUser;
            next();
        }
    } catch (error) {
        console.log({ error })
        res.status(400).send('Session not valid').redirect('/auth/login')
    }
}

export { checkJwt }
