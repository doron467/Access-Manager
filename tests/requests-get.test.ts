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

describe('GET /requests', () => {
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

  async function createRequest(
    requesterId = requester.id,
    level = 'READ',
  ) {
    const token = createAccessToken(requesterId)

    const response = await request(app)
      .post('/requests/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appId: application.id,
        level,
        reason: 'I need repository access.',
      })

    return response.body
  }

  it('allows an authenticated requester to retrieve requests', async () => {
    const createdRequest = await createRequest()

    const token = createAccessToken(requester.id)

    const response = await request(app)
      .get('/requests')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdRequest.id,
          createdBy: requester.id,
          state: 'PENDING',
        }),
      ]),
    )
  })

  it('allows an approver to retrieve requests', async () => {
    const createdRequest = await createRequest()

    const token = createAccessToken(approver.id)

    const response = await request(app)
      .get('/requests')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdRequest.id,
          state: 'PENDING',
        }),
      ]),
    )
  })

  it('rejects an unauthenticated user', async () => {
    const response = await request(app)
      .get('/requests')

    expect(response.status).toBe(401)
  })

  it('can filter requests by level', async () => {
    await createRequest(requester.id, 'READ')
    const writeRequest = await createRequest(requester.id, 'WRITE')

    const token = createAccessToken(requester.id)

    const response = await request(app)
      .get('/requests')
      .query({ level: 'WRITE' })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: writeRequest.id,
          level: 'WRITE',
        }),
      ]),
    )

    expect(
      response.body.every((r: any) => r.level === 'WRITE'),
    ).toBe(true)
  })

  it('can filter requests by state', async () => {
    const createdRequest = await createRequest()

    const approverToken = createAccessToken(approver.id)

    await request(app)
      .patch(`/requests/${createdRequest.id}`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({
        state: 'APPROVED',
      })

    const response = await request(app)
      .get('/requests')
      .query({ state: 'APPROVED' })
      .set('Authorization', `Bearer ${approverToken}`)

    expect(response.status).toBe(200)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdRequest.id,
          state: 'APPROVED',
        }),
      ]),
    )

    expect(
      response.body.every((r: any) => r.state === 'APPROVED'),
    ).toBe(true)
  })

  it('rejects an invalid requesterId query parameter', async () => {
    const token = createAccessToken(requester.id)

    const response = await request(app)
      .get('/requests')
      .query({ requesterId: ['one', 'two'] })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
  })
})

describe('GET /requests/apps', () => {
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

  it('returns applications to an authenticated user', async () => {
    const token = createAccessToken(requester.id)

    const response = await request(app)
      .get('/requests/apps')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: application.id,
          name: 'Test Application',
        }),
      ]),
    )
  })

  it('rejects an unauthenticated user', async () => {
    const response = await request(app)
      .get('/requests/apps')

    expect(response.status).toBe(401)
  })
})