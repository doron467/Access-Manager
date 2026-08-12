import { UserRole } from "../db/schema/users";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: UserRole;
                username: string;
            };
        }
    }
}

export {};