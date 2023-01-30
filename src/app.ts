import "dotenv/config"
import express from "express";
import cors from "cors";
import path from "path";
import morgan from "morgan";

import { router } from "./routes";



const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

app.use(morgan('dev'))

app.use('/uploads', express.static(path.resolve('uploads')))
app.use(router)


app.listen(PORT, () => console.log(`Listening on ${PORT}`));



export { app };
