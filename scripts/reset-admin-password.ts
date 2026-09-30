import fs from "fs";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// Load .env.local the same way seed.ts and drizzle.config.ts do, and do it
// before importing src/db (which reads DATABASE_URL at module load time).
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

async function main() {
  const { db } = await import("../src/db");
  const { users } = await import("../src/db/schema");

  const email = process.env.SEED_ADMIN_EMAIL || "admin@milimaniwellness.co.ke";
  const newPassword = process.env.RESET_ADMIN_PASSWORD;

  if (!newPassword) {
    console.log("RESET_ADMIN_PASSWORD not set, nothing to reset.");
    process.exit(0);
  }
  if (newPassword.length < 8) {
    console.error("RESET_ADMIN_PASSWORD is under 8 characters, refusing to set a password that short.");
    process.exit(1);
  }

  const [admin] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!admin) {
    console.log(`No user found with email ${email}, nothing to reset.`);
    process.exit(0);
  }

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(newPassword, 10) })
    .where(eq(users.id, admin.id));

  console.log(`Password reset for ${email}. Remove RESET_ADMIN_PASSWORD from your Vercel env vars now.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
