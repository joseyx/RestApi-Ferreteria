import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!

const generateToken = (id: number, role: String, cartId: number | null) => {
    const jwt = sign({ id, role, cartId }, JWT_SECRET, {
        expiresIn: "2h",
    });
    return jwt
}

const verifyToken = (jwt: string) => {
    return verify(jwt, JWT_SECRET);
}

export { generateToken, verifyToken }
