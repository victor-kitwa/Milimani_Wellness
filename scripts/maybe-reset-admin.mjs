// Resets the admin account's password during a Vercel build, but only when
// RESET_ADMIN_PASSWORD is explicitly set to the desired new plaintext
// password as a Vercel environment variable. Without it, this is a no-op,
// so a future deploy can't silently reset the password again.
//
// Once you've confirmed the new password works, remove RESET_ADMIN_PASSWORD
// in Vercel so it doesn't sit there as a plaintext credential.
import { execSync } from "child_process";

if (process.env.RESET_ADMIN_PASSWORD) {
  console.log("RESET_ADMIN_PASSWORD is set, resetting the admin password...");
  execSync("npx tsx scripts/reset-admin-password.ts", { stdio: "inherit" });
} else {
  console.log("RESET_ADMIN_PASSWORD not set, skipping admin password reset.");
}
