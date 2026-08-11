import express from 'express'
const requestsRoute = express.Router();

import { createRequest } from './request.controller.js';

requestsRoute.post('/create',createRequest)

export default requestsRoute;