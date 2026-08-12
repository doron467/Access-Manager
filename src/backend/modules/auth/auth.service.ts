import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/users.js';
import {refreshTokens} from '../../db/schema/refreshTokens.js'
import { eq } from 'drizzle-orm';

import 'dotenv/config.js'
import { AppError } from '../../errors/AppError.js';
import {logger} from '../../utils/logger.js';

export async function registerUser(username: string, password: string) {
    // check if user already exists
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (result.length > 0) {
        throw new AppError(409, "Username already exists");
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({username: username, passwordHash: hashedPassword}).returning()
    if (!user) {
        throw new AppError(400, "User creation failed");
    }

    const {accessToken, refreshToken} = await createSession(user.id)

    logger.info("user_register",
        {
            userId: user.id,
            username: user.username,
            role: user.role
        }
    )

    //return {accessToken, refreshToken}
    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        userInfo: {
            id: user.id,
            username: user.username,
            role: user.role
        }
    }
}

export async function loginUser(username: string, password: string) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = result[0];
    if (!user) {
        throw new AppError(401, "Username doesn't exist");
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new AppError(401, "Wrong password");
    }
    const {accessToken, refreshToken} = await createSession(user.id);

    logger.info("user_login",
        {
            userId: user.id,
            username: user.username
        }
    )

    //return {accessToken, refreshToken};
    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        userInfo: {
            id: user.id,
            username: user.username,
            role: user.role
        }
    }
}

export async function refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
        throw new AppError(401, "Refresh token is required");
    }
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const result = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
    const storedToken = result[0];

    if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new AppError(401, "Invalid refresh token");
    }

    const accessLifetime = process.env.ACCESS_TOKEN_LIFETIME_MINUTES!;
    const accessLifetimeS = parseInt(accessLifetime) * 60; // convert minutes to seconds
    const accessToken = jwt.sign(
    {id: storedToken.userId },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: accessLifetimeS }
    );

    return {accessToken}
}

function hashRefreshToken(refreshToken: string){
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
}

export async function logout(refreshToken: string) {
  const hashedToken = hashRefreshToken(refreshToken)

  await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.tokenHash, hashedToken))
}

async function createSession(id: string) {
    const accessLifetime = process.env.ACCESS_TOKEN_LIFETIME_MINUTES!;
    const accessLifetimeS = parseInt(accessLifetime) * 60; // convert minutes to seconds
    console.log("lifetime: ", accessLifetimeS)

    const refreshLifetime = process.env.REFRESH_TOKEN_LIFETIME_DAYS!;
    const refreshLifetimeMS = parseInt(refreshLifetime) * 24 * 60 * 60 * 1000; // convert days to milliseconds

    const accessToken = jwt.sign({id: id}, process.env.ACCESS_TOKEN_SECRET!, {expiresIn: accessLifetimeS})
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = hashRefreshToken(refreshToken)
    await db.insert(refreshTokens).values({userId: id,tokenHash: tokenHash, expiresAt: new Date(Date.now() + refreshLifetimeMS)});
    return {accessToken, refreshToken}
}

