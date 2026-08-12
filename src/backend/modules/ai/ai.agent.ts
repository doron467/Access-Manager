import type { AccessRequestContext, AIReview } from "./ai.types.js";
import { AppError } from "../../errors/AppError.js";

function buildPrompt(context: AccessRequestContext): string {
    return `
    You are an internal access-management assistant.

    Your task is to analyze an employee's access request and provide a
    recommendation to a human approver.

    IMPORTANT RULES:
    - You are an assistant, not the final decision-maker.
    - Do not approve or reject the request yourself.
    - Only use information explicitly provided below.
    - Do not invent facts about the requester, application, or request.
    - Consider whether the requested access level is reasonable given
    the application's purpose and the requester's role.
    - If there is insufficient information to make a confident
    recommendation, choose "REVIEW".
    - Do not make assumptions based on the username alone.

    REQUESTER:
    Username: ${context.requester.username}
    Role: ${context.requester.role}

    APPLICATION:
    Name: ${context.application.name}
    Description: ${context.application.description}

    ACCESS REQUEST:
    Access level: ${context.request.accessLevel}
    State: ${context.request.state}
    Reason for request: ${context.request.reason}
    Created at: ${context.request.createdAt.toISOString()}

    RECOMMENDATION OPTIONS:
    - APPROVE: The requested access appears reasonable based on the
    available information.
    - REJECT: The requested access appears inappropriate based on the
    available information.
    - REVIEW: There is not enough information to confidently recommend
    approval or rejection.

    CONFIDENCE:
    Provide a number between 0 and 1 representing how confident you are
    in your recommendation.

    REASONING:
    Provide a short explanation based only on the information provided.

    OUTPUT REQUIREMENTS:
    - Return ONLY a valid JSON object.
    - Do NOT use Markdown.
    - Do NOT wrap the JSON in \`\`\`json or any other code block.
    - Do NOT include any text before or after the JSON.
    - The JSON must contain exactly these three fields:
    "recommendation", "confidence", and "reasoning".
    - "recommendation" must be exactly "APPROVE", "REJECT", or "REVIEW".
    - "confidence" must be a number between 0 and 1.
    - "reasoning" must be a non-empty string.

    Return the JSON now.
    `;
}


function parseResponse(response: string): AIReview {
    let parsed: unknown;

    const failText = "AI review failed";

    try {
        parsed = JSON.parse(response);
    } catch {
        throw new AppError(502, failText);
    }

    if (!parsed || typeof parsed !== "object") {
        throw new AppError(502, failText);
    }

    const result = parsed as Record<string, unknown>;

    if (
        result.recommendation !== "APPROVE" &&
        result.recommendation !== "REJECT" &&
        result.recommendation !== "REVIEW"
    ) {
        throw new AppError(502, failText);
    }

    if (
        typeof result.confidence !== "number" ||
        result.confidence < 0 ||
        result.confidence > 1
    ) {
        throw new AppError(502, failText);
    }

    if (
        typeof result.reasoning !== "string" ||
        result.reasoning.trim().length === 0
    ) {
        throw new AppError(502, failText);
    }

    return {
        recommendation: result.recommendation,
        confidence: result.confidence,
        reasoning: result.reasoning,
    };
}

async function callLLM(prompt: string): Promise<string> {
    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            }),
        }
    );

    if (!response.ok) {
        const errorBody = await response.text();

        console.error(
            "OpenRouter error:",
            response.status,
            errorBody
        );
        
        throw new AppError(502, "AI review failed");
    }

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
        throw new AppError(502, "AI review failed");
    }

    return content;
}

export async function analyzeAccessRequest(
  context: AccessRequestContext
): Promise<AIReview> {

  console.log("getting response")

  const prompt = buildPrompt(context)

  const response = await callLLM(prompt)
  console.log(response)

  return parseResponse(response)
}