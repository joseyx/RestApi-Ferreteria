import { hash, compare } from 'bcryptjs';

const encrypt = async (planePassword: string) => {
    const passwordHash = await hash(planePassword, 8);
    return passwordHash
}

const verified = async (pass: string, passHash: string) => {
    const isCorrect = await compare(pass, passHash);
    return isCorrect
}

export { encrypt, verified }
