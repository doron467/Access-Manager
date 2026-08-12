import express from 'express'
import { reviewRequest } from './ai.controller.js'
import { authenticateToken } from '../../middleware/authenticate.js'
import { authorize } from '../../middleware/authorize.js'

const aiRouter = express.Router()

aiRouter.post(
  '/requests/:requestId/review',
  authenticateToken,
  authorize('APPROVER'),
  reviewRequest
)

export default aiRouter