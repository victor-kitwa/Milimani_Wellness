// Plain-JS/ESM variant of update-product-images.ts, for running with the
// globally installed `node` (no tsx / esbuild involved) on Victor's Mac,
// where the project's node_modules/tsx ships a macOS-only esbuild binary
// that a Linux shell can't execute.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const envPath = path.join(projectRoot, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const IMAGE_MAP = {
  "Vitamin C 1000mg":
    "https://images.unsplash.com/photo-1700911639640-854353c0465f?w=800&h=800&fit=crop&q=80&auto=format",
  "Daily Multivitamin":
    "https://images.unsplash.com/photo-1729701028046-2bd5b736a6d7?w=800&h=800&fit=crop&q=80&auto=format",
  "Omega 3 Fish Oil":
    "https://images.unsplash.com/photo-1670850756988-a1943aa0e554?w=800&h=800&fit=crop&q=80&auto=format",
  "Herbal Green Tea":
    "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&h=800&fit=crop&q=80&auto=format",
  "Chamomile Tea":
    "https://images.unsplash.com/photo-1749105862005-6e0409c8c55a?w=800&h=800&fit=crop&q=80&auto=format",
  "Lavender Essential Oil":
    "https://images.unsplash.com/photo-1707858950463-d47f5fcaacfa?w=800&h=800&fit=crop&q=80&auto=format",
  "Eucalyptus Essential Oil":
    "https://plus.unsplash.com/premium_photo-1706800175278-4b39bab8ffc2?w=800&h=800&fit=crop&q=80&auto=format",
  "Premium Yoga Mat":
    "https://plus.unsplash.com/premium_photo-1723759271930-3514bb76abb4?w=800&h=800&fit=crop&q=80&auto=format",
  "Meditation Cushion":
    "https://images.unsplash.com/photo-1685122121706-a7d632dec1df?w=800&h=800&fit=crop&q=80&auto=format",
  "Resistance Bands Set":
    "https://images.unsplash.com/photo-1767404890803-228d5390fcd4?w=800&h=800&fit=crop&q=80&auto=format",
  "Natural Face Serum":
    "https://images.unsplash.com/photo-1741896135512-084b251887f7?w=800&h=800&fit=crop&q=80&auto=format",
  "Aloe Vera Gel":
    "https://images.unsplash.com/photo-1556408978-ce0a0a5e352e?w=800&h=800&fit=crop&q=80&auto=format",
  "Shea Body Butter":
    "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?w=800&h=800&fit=crop&q=80&auto=format",
  "Himalayan Salt Lamp":
    "https://images.unsplash.com/photo-1623241923490-5b2fd532828f?w=800&h=800&fit=crop&q=80&auto=format",
  "Insulated Water Bottle":
    "https://images.unsplash.com/photo-1649867219867-3faeab653df9?w=800&h=800&fit=crop&q=80&auto=format",
};

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  let updated = 0;
  let missing = 0;
  for (const [name, url] of Object.entries(IMAGE_MAP)) {
    const { rows } = await pool.query('SELECT id FROM products WHERE name = $1 LIMIT 1', [name]);
    if (rows.length === 0) {
      console.log(`  ! no product found named "${name}", skipping`);
      missing++;
      continue;
    }
    await pool.query('UPDATE products SET images = $1::jsonb WHERE name = $2', [JSON.stringify([url]), name]);
    console.log(`  updated "${name}"`);
    updated++;
  }
  console.log(`Done. Updated ${updated}/${Object.keys(IMAGE_MAP).length} products (${missing} not found).`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
