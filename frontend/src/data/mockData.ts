import type { AccessRequest, Application, User } from '../types'

export const APPLICATIONS: Application[] = [
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    name: 'GitHub',
    description: 'Version control and collaboration',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    name: 'Google Drive',
    description: 'Cloud file storage',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000003',
    name: 'AWS',
    description: 'Cloud infrastructure',
  },
]

export const SEED_USERS: User[] = [
  {
    id: 'u1000000-0000-4000-8000-000000000001',
    username: 'user1',
    password: '1234',
    role: 'APPROVER',
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'u1000000-0000-4000-8000-000000000002',
    username: 'user2',
    password: 'abcd',
    role: 'REQUESTER',
    createdAt: '2026-01-10T09:30:00.000Z',
  },
]

export const SEED_REQUESTS: AccessRequest[] = [
  {
    id: 'r1000000-0000-4000-8000-000000000001',
    appId: APPLICATIONS[0].id,
    level: 'READ',
    state: 'PENDING',
    createdBy: SEED_USERS[1].id,
    createdAt: '2026-02-01T10:00:00.000Z',
    decisionBy: null,
    decisionAt: null,
  },
  {
    id: 'r1000000-0000-4000-8000-000000000002',
    appId: APPLICATIONS[1].id,
    level: 'WRITE',
    state: 'PENDING',
    createdBy: SEED_USERS[1].id,
    createdAt: '2026-02-02T14:30:00.000Z',
    decisionBy: null,
    decisionAt: null,
  },
  {
    id: 'r1000000-0000-4000-8000-000000000003',
    appId: APPLICATIONS[2].id,
    level: 'READ',
    state: 'APPROVED',
    createdBy: SEED_USERS[1].id,
    createdAt: '2026-01-20T08:15:00.000Z',
    decisionBy: SEED_USERS[0].id,
    decisionAt: '2026-01-21T11:00:00.000Z',
  },
  {
    id: 'r1000000-0000-4000-8000-000000000004',
    appId: APPLICATIONS[0].id,
    level: 'WRITE',
    state: 'REJECTED',
    createdBy: SEED_USERS[1].id,
    createdAt: '2026-01-18T16:45:00.000Z',
    decisionBy: SEED_USERS[0].id,
    decisionAt: '2026-01-19T09:20:00.000Z',
  },
  {
    id: 'r1000000-0000-4000-8000-000000000005',
    appId: APPLICATIONS[2].id,
    level: 'WRITE',
    state: 'PENDING',
    createdBy: SEED_USERS[1].id,
    createdAt: '2026-02-05T09:00:00.000Z',
    decisionBy: null,
    decisionAt: null,
  },
  {
    id: 'r1000000-0000-4000-8000-000000000006',
    appId: APPLICATIONS[1].id,
    level: 'READ',
    state: 'APPROVED',
    createdBy: SEED_USERS[1].id,
    createdAt: '2026-01-12T12:00:00.000Z',
    decisionBy: SEED_USERS[0].id,
    decisionAt: '2026-01-13T10:30:00.000Z',
  },
  {
    id: 'r1000000-0000-4000-8000-000000000007',
    appId: APPLICATIONS[0].id,
    level: 'READ',
    state: 'REJECTED',
    createdBy: SEED_USERS[1].id,
    createdAt: '2026-01-08T07:30:00.000Z',
    decisionBy: SEED_USERS[0].id,
    decisionAt: '2026-01-09T15:00:00.000Z',
  },
  {
    id: 'r1000000-0000-4000-8000-000000000008',
    appId: APPLICATIONS[2].id,
    level: 'READ',
    state: 'APPROVED',
    createdBy: SEED_USERS[1].id,
    createdAt: '2026-01-05T13:20:00.000Z',
    decisionBy: SEED_USERS[0].id,
    decisionAt: '2026-01-06T08:45:00.000Z',
  },
]
