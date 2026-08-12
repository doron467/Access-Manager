import express from 'express'
const requestsRoute = express.Router();

import { createRequest, getRequest, decideRequest, getApplications } from './request.controller.js';
import { authenticateToken } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';



requestsRoute.post('/create',authenticateToken,authorize("REQUESTER"),createRequest)

requestsRoute.get('/',authenticateToken,getRequest)

requestsRoute.patch('/:requestId',authenticateToken,authorize("APPROVER"),decideRequest)

requestsRoute.get('/apps',authenticateToken,getApplications)

export default requestsRoute;