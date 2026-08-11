const port = 3000;

import express from 'express';
import 'dotenv/config.js'
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './modules/auth/auth.routes.js'
import requestsRouter from './modules/requests/request.routes.js'

const app = express();

app.use(express.json());

app.use('/auth', authRouter);
app.use('/requests', requestsRouter);


app.use(errorHandler)

app.listen(port)