import "dotenv/config"
import express from "express";
import cors from "cors";
import path from "path";
import morgan from "morgan";

import bodyParser from 'body-parser';
import session from 'express-session';
import { router } from "./routes";

const secret_key = process.env.SECRET_KEY || "secret";

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

app.use(morgan('dev'))

app.use('/uploads', express.static(path.resolve('uploads')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({ secret: secret_key, resave: true, saveUninitialized: true, cookie: { maxAge: 20 * 60 * 1000 } }));
app.use(router)


app.listen(PORT, () => console.log(`Listening on ${PORT}`));



export { app };
