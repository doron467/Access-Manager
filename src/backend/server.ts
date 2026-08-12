const port = 3000;

import express from 'express';
import 'dotenv/config.js'
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './modules/auth/auth.routes.js'
import requestsRouter from './modules/requests/request.routes.js'
import aiRouter from './modules/ai/ai.routes.js'
import cors from "cors"
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json());
app.use(cookieParser())

app.use('/auth', authRouter);
app.use('/requests', requestsRouter);
app.use('/ai',aiRouter)


app.use(errorHandler)

app.listen(port)