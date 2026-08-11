import 'dotenv/config.js';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    schema: './src/backend/db/index.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
//# sourceMappingURL=drizzle.config.js.map