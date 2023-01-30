import { Request, Response } from "express";
import { loginUser, registerNewUser } from '../services/auth.services';
import { handleHttp } from "../utils/error.handle";

const registerCtrl = async ({ body }: Request, res: Response) => {
    try {
        const responseUser = await registerNewUser(body);
        res.send(responseUser)
    } catch (err) {
        handleHttp(res, 'Error creating new user', err);
    }
}

const loginCtrl = async ({ body }: Request, res: Response) => {
    try {
        const { email, password } = body;
        const responseUser = await loginUser({ email, password });
        res.send(responseUser)
    } catch (err) {
        handleHttp(res, 'Error at login', err);
    }
}

export { loginCtrl, registerCtrl }
