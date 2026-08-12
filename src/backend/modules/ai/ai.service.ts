import { db } from "../../db/index.js";
import { requests } from "../../db/schema/requests.js";
import { applications } from "../../db/schema/applications.js";
import { users } from "../../db/schema/users.js";
import { eq } from "drizzle-orm";
import { AppError } from "../../errors/AppError.js";
import { logger } from "../../utils/logger.js";
import type { AccessRequestContext, AIReview } from "./ai.types.js";
import { analyzeAccessRequest } from "./ai.agent.js";

export async function reviewRequest(
    requestId: string,
    reviewerId: string
) {
    
    // Get the request
    const [request] = await db
        .select()
        .from(requests)
        .where(eq(requests.id, requestId));

    if (!request) {
        throw new AppError(404, "Request not found");
    }

    // AI reviews should only be performed on pending requests
    if (request.state !== "PENDING") {
        throw new AppError(
            409,
            "Only pending requests can be reviewed"
        );
    }

    // Get the requester
    const [requester] = await db
        .select({
            id: users.id,
            username: users.username,
            role: users.role,
        })
        .from(users)
        .where(eq(users.id, request.createdBy));

    if (!requester) {
        throw new AppError(404, "Requester not found");
    }

    // Get the application
    const [application] = await db
        .select()
        .from(applications)
        .where(eq(applications.id, request.appId));

    if (!application) {
        throw new AppError(404, "Application not found");
    }

    // Build the context that will be given to the AI agent
    const context: AccessRequestContext = {
        request: {
            id: request.id,
            accessLevel: request.level,
            state: request.state,
            reason: request.reason,
            createdAt: request.createdAt,
        },

        requester: {
            id: requester.id,
            username: requester.username,
            role: requester.role,
        },

        application: {
            id: application.id,
            name: application.name,
            description: application.description,
        },
    };

    // Ask the AI agent to analyze the request
    const review = await analyzeAccessRequest(context);

    // Basic evaluation of the AI's response
    const evaluation = evaluateReview(review);

    logger.info("ai_request_review", {
        requestId,
        reviewerId,
        recommendation: review.recommendation,
        confidence: review.confidence,
        evaluationPassed: evaluation.valid,
        evaluationIssues: evaluation.issues,
    });

    return {
        ...review,
        evaluation,
    };
}

function evaluateReview(review: AIReview) {
    const issues: string[] = [];

    return {
        valid: issues.length === 0,
        issues,
    };
}