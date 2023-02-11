import { authInterface } from '../interfaces/user.interface';
import { userInterface } from '../interfaces/user.interface';
import { PrismaClient } from '@prisma/client';
import { encrypt, verified } from '../utils/bcrypt.handle';
import { generateToken } from '../utils/jwt.handle';

const prisma = new PrismaClient();

const registerNewUser = async ({
    email, password, firstName, lastName, address, city, state, phoneNumber }: userInterface) => {
    const checkIs = await prisma.user.findUnique({
        where: {
            email: email
        },
    })
    if (checkIs) return 'Already registered'
    const passHash = await encrypt(password)
    const registerNewUser = await prisma.user.create({
        data: {
            email,
            password: passHash,
            firstName,
            lastName,
            address,
            city,
            state,
            phoneNumber,
            cart: {
                create: {

                }
            }
        }
    })
    return registerNewUser
}

const loginUser = async ({ email, password }: authInterface) => {
    const checkIs = await prisma.user.findUnique({
        where: {
            email: email,
        },
        include: {
            cart: true
        }
    })

    if (checkIs == null) return 'User not found';

    const passwordHash = checkIs.password
    const isCorrect = await verified(password, passwordHash)

    if (!isCorrect) return "Password_incorrect";

    let cartID: number = 0
    if (checkIs.cart != null) {
        cartID = checkIs.cart.id
    }

    const token = generateToken(checkIs.id, checkIs.role, cartID)
    const data = {
        token,
        user: checkIs
    }
    return data
}

export { registerNewUser, loginUser }
