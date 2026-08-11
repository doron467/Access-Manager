import { Role } from "../db/schema/users";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: Role;
            };
        }
    }
}

export {};