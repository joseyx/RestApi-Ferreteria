import { Router } from "express";
import { readdirSync } from "fs";

const PATH_ROUTER = `${__dirname}`
const router = Router();

const cleanFileName = (filename: string) => {
    const index = filename.lastIndexOf(".");
    const file = filename.substring(0, index);
    console.log(file)
    return file
}

readdirSync(PATH_ROUTER).filter((filename) => {
    let cleanName = cleanFileName(filename);
    if (cleanName !== 'index') {
        import(`./${cleanName}`).then((moduleRouter) => {
            router.use(`/${cleanName}`, moduleRouter.router)
        })
    }
})

export { router }
