
import bcrypt from 'bcrypt'
import { db } from '../../src/backend/db/index.js'
import { users } from '../../src/backend/db/schema/users.js'
import { applications } from '../../src/backend/db/schema/applications.js'
import { requests } from '../../src/backend/db/schema/requests.js'
import { refreshTokens } from '../../src/backend/db/schema/refreshTokens.js'

export async function createTestData() {
  const [requester] = await db
    .insert(users)
    .values({
      username: 'test-requester',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'REQUESTER',
    })
    .returning()

  const [approver] = await db
    .insert(users)
    .values({
      username: 'test-approver',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'APPROVER',
    })
    .returning()

  const [application] = await db
    .insert(applications)
    .values({
      name: 'Test Application',
      description: "test description"
    })
    .returning()

  return {
    requester,
    approver,
    application,
  }
}

export async function resetDatabase() {
  await db.delete(requests)
  await db.delete(refreshTokens)
  await db.delete(applications)
  await db.delete(users)
}