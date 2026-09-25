// Runs the demo catalog seed during a Vercel build, but only when
// SEED_ON_BUILD is explicitly set to "true" as a Vercel environment
// variable. Without it, this is a no-op, so redeploys never risk
// recreating a demo product someone deleted through the admin panel.
//
// The seed script itself is idempotent (it checks for an existing row by
// slug/email before inserting), so running it more than once is harmless.
// Still, once you've confirmed the demo catalog loaded, remove the
// SEED_ON_BUILD variable in Vercel so future deploys skip this step.
import { execSync } from "child_process";

if (process.env.SEED_ON_BUILD === "true") {
  console.log("SEED_ON_BUILD is set, running scripts/seed.ts...");
  execSync("npx tsx scripts/seed.ts", { stdio: "inherit" });
} else {
  console.log("SEED_ON_BUILD not set, skipping the demo catalog seed.");
}
