import { PrismaClient } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { JwtPayLoad } from "../interfaces/token.interfaces";

import { userRole } from "../interfaces/user.interface";

const prisma = new PrismaClient();

const roleVerification = async (isUser: JwtPayload | string, roles: string[]) => {
    const { id } = isUser as JwtPayLoad;
    const userData = await prisma.user.findUnique({
        where: {
            id: id
        }
    })
    const { role } = userData as userRole
    return roles.includes(role)
}

export { roleVerification }
