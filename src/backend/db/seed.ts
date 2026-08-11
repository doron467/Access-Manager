import bcrypt from 'bcrypt'
import { db } from "./index.js";
import { applications } from "./schema/applications.js";
import { users } from "./schema/users.js";
import type { UserRole } from "./schema/users.js";

const applicationData = [
    { name: "GitHub", description: "version control stuff"},
    { name: "Google Drive", description: "upload stuff to the cloud"},
    { name: "AWS", description: "server deployment"},
];

const usersData: {username: string, passwordHash: string, role: UserRole}[] = [
    {username: "user1", passwordHash: "1234", role: "APPROVER"},
    {username: "user2", passwordHash: "abcd", role: "REQUESTER"},
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