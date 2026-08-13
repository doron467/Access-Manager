import request from 'supertest'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import app from '../src/backend/app.js'
import { db } from '../src/backend/db/index.js'
import { users } from '../src/backend/db/schema/users.js'
import { eq } from 'drizzle-orm'
import { createAccessToken } from './helpers/auth.js'
import { createTestData, resetDatabase } from './helpers/db.js'

describe('Authentication', () => {
  let requester: any
  let approver: any

  beforeEach(async () => {
    await resetDatabase()

    const data = await createTestData()

    requester = data.requester
    approver = data.approver
  })

  describe('GET /auth/me', () => {
    it('returns the authenticated requester', async () => {
      const token = createAccessToken(requester.id)

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)

      expect(response.body).toMatchObject({
        id: requester.id,
        role: 'REQUESTER',
        username: requester.username,
      })
    })

    it('returns the authenticated approver', async () => {
      const token = createAccessToken(approver.id)

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)

      expect(response.body).toMatchObject({
        id: approver.id,
        role: 'APPROVER',
        username: approver.username,
      })
    })

    it('rejects a request without a token', async () => {
      const response = await request(app)
        .get('/auth/me')

      expect(response.status).toBe(401)
    })

    it('rejects an invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
    })
  })

  describe('POST /auth/register', () => {
    it('registers a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'new-user',
          password: 'password123',
        })

      expect(response.status).toBe(201)

      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('userInfo')

      expect(response.body.userInfo).toMatchObject({
        username: 'new-user',
      })

      expect(response.headers['set-cookie']).toBeDefined()
    })

    it('rejects an existing username', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          name: requester.username,
          password: 'password123',
        })

      expect(response.status).toBe(409)
    })
  })

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10)

      await db
        .update(users)
        .set({
          passwordHash,
        })
        .where(eq(users.id, requester.id))
    })

    it('logs in with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          name: requester.username,
          password: 'correct-password',
        })

      expect(response.status).toBe(201)

      expect(response.body).toHaveProperty('accessToken')

      expect(response.body.userInfo).toMatchObject({
        id: requester.id,
        username: requester.username,
        role: 'REQUESTER',
      })

      expect(response.headers['set-cookie']).toBeDefined()
    })

    it('rejects an incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          name: requester.username,
          password: 'wrong-password',
        })

      expect(response.status).toBe(401)
    })

    it('rejects a nonexistent username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          name: 'does-not-exist',
          password: 'correct-password',
        })

      expect(response.status).toBe(401)
    })
  })

})