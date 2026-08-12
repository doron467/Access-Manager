import bcrypt from 'bcrypt'
import { db } from "./index.js";
import { applications } from "./schema/applications.js";
import { users } from "./schema/users.js";
import type { UserRole } from "./schema/users.js";

const applicationData = [
    { name: "GitHub", description: "an open source app to upload important projects"},
    { name: "Google Drive", description: "used for uploading non-secret images"},
    { name: "Test app", description: "an app currently in development, no user should be allowed write access to it"},
];

const usersData: {username: string, passwordHash: string, role: UserRole}[] = [
    {username: "user1", passwordHash: "1234", role: "APPROVER"},
    {username: "user2", passwordHash: "abcd", role: "REQUESTER"},
    {username: "user3", passwordHash: "qwerty", role: "APPROVER"},
    {username: "user4", passwordHash: "asdf", role: "REQUESTER"},
]

async function seed() {
    console.log("Seeding data...");

    // insert applications data
    await db.insert(applications).values(applicationData).onConflictDoNothing();

    // map the passwords in the user data to their hashed version
    const usersToInsert = await Promise.all(
    usersData.map(async (user) => ({
        ...user,
        passwordHash: await bcrypt.hash(user.passwordHash, 10),
    })));
    // insert users data
    await db.insert(users).values(usersToInsert).onConflictDoNothing();

    console.log("data seeded.");
}

seed()
    .catch((error) => {
        console.error("Seeding failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        // If your db uses a connection pool,
        // close it here.
        process.exit(0);
    });