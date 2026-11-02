import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Run `vercel env pull .env.local`.");
}

// Use as a tagged template: sql`SELECT * FROM books WHERE isbn13 = ${isbn}`
// Values in ${} are sent as parameters, never pasted into the SQL string.
export const sql = neon(process.env.DATABASE_URL);
