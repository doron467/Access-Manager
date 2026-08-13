import jwt from 'jsonwebtoken'

export function createAccessToken(userId: string) {

    const accessLifetime = process.env.ACCESS_TOKEN_LIFETIME_MINUTES!;
    const accessLifetimeS = parseInt(accessLifetime) * 60; // convert minutes to seconds

    const accessToken = jwt.sign({id: userId}, process.env.ACCESS_TOKEN_SECRET!, {expiresIn: accessLifetimeS})

    return accessToken;
}