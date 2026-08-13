import request from 'supertest'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import app from '../src/backend/app.js'
import { createAccessToken } from './helpers/auth.js'
import { createTestData, resetDatabase } from './helpers/db.js'

describe('PATCH /requests/:requestId - approve', () => {
  let requester: any
  let approver: any
  let application: any

  beforeEach(async () => {
    await resetDatabase()

    const data = await createTestData()

    requester = data.requester
    approver = data.approver
    application = data.application
  })

  async function createRequest() {
    const token = createAccessToken(requester.id)

    const response = await request(app)
      .post('/requests/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appId: application.id,
        level: 'READ',
        reason: 'I need repository access.',
      })

    return response.body
  }

  it('allows an approver to approve a pending request', async () => {
    const createdRequest = await createRequest()

    const token = createAccessToken(approver.id)

    const response = await request(app)
      .patch(`/requests/${createdRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        state: 'APPROVED',
      })

    expect(response.status).toBe(200)

    expect(response.body).toMatchObject({
      id: createdRequest.id,
      state: 'APPROVED',
      createdBy: requester.id,
      decisionBy: approver.id,
    })

    expect(response.body.decisionAt).not.toBeNull()
  })

  it('rejects a requester trying to approve a request', async () => {
    const createdRequest = await createRequest()

    const token = createAccessToken(requester.id)

    const response = await request(app)
      .patch(`/requests/${createdRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        state: 'APPROVED',
      })

    expect(response.status).toBe(403)
  })

  it('rejects an unauthenticated user', async () => {
    const createdRequest = await createRequest()

    const response = await request(app)
      .patch(`/requests/${createdRequest.id}`)
      .send({
        state: 'APPROVED',
      })

    expect(response.status).toBe(401)
  })

  it('rejects an invalid decision state', async () => {
    const createdRequest = await createRequest()

    const token = createAccessToken(approver.id)

    const response = await request(app)
      .patch(`/requests/${createdRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        state: 'INVALID',
      })

    expect(response.status).toBe(400)
  })

  it('rejects approving a nonexistent request', async () => {
    const token = createAccessToken(approver.id)

    const response = await request(app)
      .patch('/requests/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({
        state: 'APPROVED',
      })

    expect(response.status).toBe(409)
  })

  it('rejects approving an already approved request', async () => {
    const createdRequest = await createRequest()

    const token = createAccessToken(approver.id)

    const firstResponse = await request(app)
      .patch(`/requests/${createdRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        state: 'APPROVED',
      })

    expect(firstResponse.status).toBe(200)

    const secondResponse = await request(app)
      .patch(`/requests/${createdRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        state: 'APPROVED',
      })

    expect(secondResponse.status).toBe(409)
  })
})
