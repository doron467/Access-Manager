import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import {users} from '../db/schema/users.js'
import { eq } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

export async function authenticateToken(req: Request,res: Response,next: NextFunction){
    const header = req.headers['authorization']
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No valid authorization header' });
    }
    const token = header.split(' ')[1]!;
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {id: string}
        const result = await db.select().from(users).where(eq(users.id, payload.id));
        const user = result[0];
        if (!user){
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;

        next();
    } catch {
        res.status(401).json({ error: 'Invalid token'})
    }
}