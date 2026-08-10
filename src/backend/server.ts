const port = 3000;

import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/index.js';
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm';
import 'dotenv/config.js'

const app = express();

app.use(express.json());

type User = {
    name: string;
    password: string;
}

const Users: User[] = []

app.get('/users', (req, res) => {
    res.json(Users)
})

app.post('/users', async (req, res) => {
    const { name, password } = req.body;
    const hashedPassword: string = await bcrypt.hash(password, 10);
    const result = await db.insert(users).values({username: name, passwordHash: hashedPassword}).returning()
    res.status(201).json({name: name});
})

app.post('/users/login', async (req, res) => {
    const result = await db.select().from(users).where(eq(users.username, req.body.name));
    const user = result[0];
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    try {
        if(await bcrypt.compare(req.body.password, user.passwordHash)){
            res.send('Success');
        } else {
            res.send('Not Allowed');
        }
    } catch {
        res.status(500).send()
    }
})

app.listen(port)