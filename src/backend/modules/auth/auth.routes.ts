import express from 'express'
import { authenticateToken } from '../../middleware/authenticate.js';

const authRouter = express.Router();

import { loginUser, refreshAccessToken, registerUser, getMe , logout} from './auth.controller.js';

authRouter.post('/register',registerUser)
authRouter.post('/login',loginUser)
authRouter.post('/refresh-token', refreshAccessToken)
authRouter.get('/me',authenticateToken,getMe)
authRouter.post('/logout',authenticateToken,logout)

export default authRouter;