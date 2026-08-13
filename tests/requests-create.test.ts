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

describe('POST /requests/create', () => {
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

  it('allows a requester to create a request', async () => {
    const token = createAccessToken(requester.id)

    const response = await request(app)
      .post('/requests/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appId: application.id,
        level: 'READ',
        reason: 'I need repository access for my assigned work.',
      })

    expect(response.status).toBe(201)

    expect(response.body).toMatchObject({
      state: 'PENDING',
      createdBy: requester.id,
      decisionBy: null,
      decisionAt: null,
      appId: application.id,
      level: 'READ',
      reason: 'I need repository access for my assigned work.',
    })
  })

  it('rejects an approver trying to create a request', async () => {
    const token = createAccessToken(approver.id)

    const response = await request(app)
      .post('/requests/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appId: application.id,
        level: 'READ',
        reason: 'Should not be allowed.',
      })

    expect(response.status).toBe(403)
  })

  it('rejects an unauthenticated user', async () => {
    const response = await request(app)
      .post('/requests/create')
      .send({
        appId: application.id,
        level: 'READ',
        reason: 'I need access.',
      })

    expect(response.status).toBe(401)
  })

  it('rejects an invalid access level', async () => {
    const token = createAccessToken(requester.id)

    const response = await request(app)
      .post('/requests/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appId: application.id,
        level: 'INVALID',
        reason: 'I need access.',
      })

    expect(response.status).toBe(400)
  })

  it('rejects a missing reason', async () => {
    const token = createAccessToken(requester.id)

    const response = await request(app)
      .post('/requests/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appId: application.id,
        level: 'READ',
      })

    expect(response.status).toBe(400)
  })

  it('rejects an empty reason', async () => {
    const token = createAccessToken(requester.id)

    const response = await request(app)
      .post('/requests/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appId: application.id,
        level: 'READ',
        reason: '   ',
      })

    expect(response.status).toBe(400)
  })

  it('rejects a reason longer than 500 characters', async () => {
    const token = createAccessToken(requester.id)

    const response = await request(app)
      .post('/requests/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        appId: application.id,
        level: 'READ',
        reason: 'a'.repeat(501),
      })

    expect(response.status).toBe(400)
  })

  it('rejects a missing appId', async () => {
    const token = createAccessToken(requester.id)

    const response = await request(app)
      .post('/requests/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        level: 'READ',
        reason: 'I need access.',
      })

    expect(response.status).toBe(400)
  })
})