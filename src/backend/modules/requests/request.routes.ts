import express from 'express'
const requestsRoute = express.Router();

import { createRequest, getRequest, decideRequest } from './request.controller.js';
import { authenticateToken } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';



requestsRoute.post('/create',authenticateToken,createRequest)

requestsRoute.get('/',authenticateToken,getRequest)

requestsRoute.patch('/:requestId',authenticateToken,authorize("APPROVER"),decideRequest)

export default requestsRoute;