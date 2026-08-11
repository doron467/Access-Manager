import express from 'express'
const authRouter = express.Router();

import { loginUser, refreshAccessToken, registerUser,  } from './auth.controller.js';

authRouter.post('/register',registerUser)
authRouter.post('/login',loginUser)
authRouter.post('/refresh-token', refreshAccessToken)

export default authRouter;