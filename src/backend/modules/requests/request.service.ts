import { db } from "../../db/index.js" 
import type { RequestState, RequestLevel } from "../../db/schema/requests.js" 
import type { UserRole } from "../../db/schema/users.js" 
import { requests } from "../../db/schema/requests.js";
import { applications } from "../../db/schema/applications.js";
import { logger } from "../../utils/logger.js";
import { and, eq } from "drizzle-orm";
import { alias } from 'drizzle-orm/pg-core';
import { users } from '../../db/schema/users.js';
import { AppError } from '../../errors/AppError.js';

export async function createRequest(
  userId: string,
  appId: string,
  level: "READ" | "WRITE"
) {
  const [request] = await db
    .insert(requests)
    .values({
      appId,
      level,
      createdBy: userId,
    })
    .returning()

  logger.info("request_creation", {
    requestBy: userId,
    appId,
    access_level: level,
  })

  return request
}

export async function getRequests(
  userId: string,
  userRole: UserRole,
  filters: {
    requesterId: string | undefined;
    level: RequestLevel | undefined;
    state: RequestState | undefined;
    appId: string | undefined;
  }
) {
  const conditions = [];

  if (userRole === "REQUESTER") {
    // Requesters can only see their own requests
    filters.requesterId = userId;
  }

  if (filters.requesterId) {
    conditions.push(eq(requests.createdBy, filters.requesterId));
  }

  if (filters.level) {
    conditions.push(eq(requests.level, filters.level));
  }

  if (filters.state) {
    conditions.push(eq(requests.state, filters.state));
  }

  if (filters.appId) {
    conditions.push(eq(requests.appId, filters.appId));
  }

  const createdByUser = alias(users, 'createdByUser');
  const decisionByUser = alias(users, 'decisionByUser');

  return db
    .select({
      id: requests.id,
      appId: requests.appId,
      level: requests.level,
      state: requests.state,

      createdBy: requests.createdBy,
      createdByUsername: createdByUser.username,
      createdAt: requests.createdAt,

      decisionBy: requests.decisionBy,
      decisionByUsername: decisionByUser.username,
      decisionAt: requests.decisionAt,
    })
    .from(requests)
    .leftJoin(
      createdByUser,
      eq(requests.createdBy, createdByUser.id)
    )
    .leftJoin(
      decisionByUser,
      eq(requests.decisionBy, decisionByUser.id)
    )
    .where(and(...conditions));
}

export async function updateDecision(
    requestId: string,
    state: "APPROVED" | "REJECTED",
    decisionBy: string
) {
    const [updatedRequest] = await db
    .update(requests)
    .set({
        state,
        decisionBy,
        decisionAt: new Date(),
    })
    .where(
        and(
            eq(requests.id, requestId),
            eq(requests.state, "PENDING")
        )
    )
    .returning();

    if (!updatedRequest) {
        throw new AppError(
            409,
            "Request does not exist or has already been decided"
        );
    }

    return updatedRequest;

}

export async function getApplications(){
    const apps = await db.select().from(applications)
    return apps;
}