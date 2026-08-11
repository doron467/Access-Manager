const port = 3000;
const ACCESS_TOKEN_LIFETIME = "15m"
const REFRESH_COOKIE_LIFETIME = 30 * 24 * 60 * 60 * 1000;

import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from './db/index.js';
import {users} from './db/schema/users.js'
import {refreshTokens} from './db/schema/refreshTokens.js'
import { eq } from 'drizzle-orm';
import 'dotenv/config.js'
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './modules/auth/auth.routes.js'

const app = express();

app.use(express.json());

app.use('/auth', authRouter);

app.use(errorHandler)

app.listen(port)