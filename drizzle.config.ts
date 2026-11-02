import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// Sagt drizzle-kit, wo das Schema liegt und wohin die SQL-Dateien sollen
export default defineConfig({
  schema: "./app/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
