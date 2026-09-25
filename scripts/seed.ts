import fs from "fs";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { slugify } from "../src/lib/utils";

// Load .env.local the same way drizzle.config.ts does, and do it before
// importing src/db (which reads DATABASE_URL at module load time).
if (fs.existsSync(".env.local")) {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

async function main() {
  const { db } = await import("../src/db");
  const { categories, products, users } = await import("../src/db/schema");

  console.log("Seeding admin account...");
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@milimaniwellness.co.ke";
  // A fixed fallback password here means every fresh install of this
  // script ships the same predictable admin login until someone thinks to
  // change it - anyone who's ever read this file (or the docs) knows it.
  // Generating a random one instead means the only way to get in is
  // whatever this run prints, once, right now.
  const generatedPassword = !process.env.SEED_ADMIN_PASSWORD;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString("base64url");
  const [existingAdmin] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (!existingAdmin) {
    await db.insert(users).values({
      name: "Milimani Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    });
    if (generatedPassword) {
      console.log("  ============================================================");
      console.log(`  created admin ${adminEmail}`);
      console.log(`  generated password: ${adminPassword}`);
      console.log("  Save this now - it will not be shown again. Set");
      console.log("  SEED_ADMIN_PASSWORD in .env.local to choose your own instead.");
      console.log("  ============================================================");
    } else {
      console.log(`  created admin ${adminEmail} / ${adminPassword}`);
    }
  } else {
    console.log(`  admin ${adminEmail} already exists`);
  }

  async function upsertCategory(name: string, description: string, imageUrl?: string) {
    const slug = slugify(name);
    const [existing] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (existing) {
      // Backfill imageUrl on categories created by an older run of this
      // script, before category photos existed — never overwrites an
      // image someone has already set through the admin dashboard.
      if (imageUrl && !existing.imageUrl) {
        const [updated] = await db
          .update(categories)
          .set({ imageUrl })
          .where(eq(categories.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }
    const [created] = await db.insert(categories).values({ name, slug, description, imageUrl }).returning();
    return created;
  }

  console.log("Seeding categories...");
  const supplements = await upsertCategory(
    "Supplements & Vitamins",
    "Daily vitamins, minerals, and health supplements",
    "https://images.unsplash.com/photo-1697273245326-1a3736f6f428?w=640&h=480&fit=crop&q=80&auto=format"
  );
  const herbal = await upsertCategory(
    "Herbal Teas",
    "Natural, calming teas and herbal infusions",
    "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=640&h=480&fit=crop&q=80&auto=format"
  );
  const oils = await upsertCategory(
    "Essential Oils",
    "Pure essential oils for aromatherapy and wellbeing",
    "https://images.unsplash.com/photo-1595871522483-00a17611a5e3?w=640&h=480&fit=crop&q=80&auto=format"
  );
  const yoga = await upsertCategory(
    "Yoga & Fitness",
    "Yoga, meditation, and home fitness gear",
    "https://images.unsplash.com/photo-1758599880788-e49f6ee77bc7?w=640&h=480&fit=crop&q=80&auto=format"
  );
  const skincare = await upsertCategory(
    "Natural Skincare",
    "Gentle, natural skincare and body care",
    "https://images.unsplash.com/photo-1748543668676-ea8241cb3886?w=640&h=480&fit=crop&q=80&auto=format"
  );
  const home = await upsertCategory(
    "Wellness Home",
    "Home products that support a calming lifestyle",
    "https://images.unsplash.com/photo-1727964506180-cc67958ad833?w=640&h=480&fit=crop&q=80&auto=format"
  );

  const demoProducts: {
    name: string;
    categoryId: string;
    price: number;
    compareAtPrice?: number;
    description: string;
    image: string;
    stock: number;
    featured?: boolean;
  }[] = [
    { name: "Vitamin C 1000mg", categoryId: supplements.id, price: 1200, compareAtPrice: 1500, description: "High-potency vitamin C for immune support. 60 tablets per bottle.", image: "vitamin-c-1000mg", stock: 40, featured: true },
    { name: "Daily Multivitamin", categoryId: supplements.id, price: 1800, description: "Complete daily multivitamin and mineral formula for adults. 30-day supply.", image: "multivitamin-daily", stock: 30 },
    { name: "Omega 3 Fish Oil", categoryId: supplements.id, price: 2400, description: "Premium omega 3 fatty acids for heart, brain, and joint health. 60 softgels.", image: "omega-3-fish-oil", stock: 25, featured: true },
    { name: "Herbal Green Tea", categoryId: herbal.id, price: 650, description: "Antioxidant-rich green tea leaves. 25 tea bags.", image: "herbal-green-tea", stock: 50 },
    { name: "Chamomile Tea", categoryId: herbal.id, price: 550, description: "Calming chamomile tea to help you unwind and sleep better. 20 tea bags.", image: "chamomile-tea", stock: 45 },
    { name: "Lavender Essential Oil", categoryId: oils.id, price: 1500, description: "Pure lavender essential oil for relaxation and better sleep. 30ml.", image: "lavender-essential-oil", stock: 20, featured: true },
    { name: "Eucalyptus Essential Oil", categoryId: oils.id, price: 1300, description: "Refreshing eucalyptus oil, great for steam inhalation and diffusers. 30ml.", image: "eucalyptus-oil", stock: 18 },
    { name: "Premium Yoga Mat", categoryId: yoga.id, price: 2800, compareAtPrice: 3500, description: "6mm non-slip yoga mat with carrying strap. Perfect for home practice.", image: "yoga-mat", stock: 22, featured: true },
    { name: "Meditation Cushion", categoryId: yoga.id, price: 3200, description: "Buckwheat-filled zafu cushion for comfortable seated meditation.", image: "meditation-cushion", stock: 12 },
    { name: "Resistance Bands Set", categoryId: yoga.id, price: 1800, description: "Set of 5 resistance bands for strength training at home.", image: "resistance-bands", stock: 20 },
    { name: "Natural Face Serum", categoryId: skincare.id, price: 2200, description: "Vitamin-rich face serum with natural botanicals. 30ml.", image: "natural-face-serum", stock: 15 },
    { name: "Aloe Vera Gel", categoryId: skincare.id, price: 850, description: "Pure aloe vera gel for skin hydration and soothing. 200ml.", image: "aloe-vera-gel", stock: 35 },
    { name: "Shea Body Butter", categoryId: skincare.id, price: 1400, description: "Rich, moisturising body butter made with pure shea. 250g.", image: "shea-body-butter", stock: 28 },
    { name: "Himalayan Salt Lamp", categoryId: home.id, price: 3800, description: "Hand-carved Himalayan salt lamp for a warm, calming glow.", image: "himalayan-salt-lamp", stock: 10 },
    { name: "Insulated Water Bottle", categoryId: home.id, price: 1500, description: "Stainless steel insulated bottle, 1L. Keeps drinks cold 24h, hot 12h.", image: "insulated-water-bottle", stock: 40 },
  ];

  console.log("Seeding products...");
  for (const p of demoProducts) {
    const slug = slugify(p.name);
    const [existing] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (existing) continue;
    await db.insert(products).values({
      name: p.name,
      slug,
      description: p.description,
      categoryId: p.categoryId,
      price: p.price.toFixed(2),
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toFixed(2) : null,
      stockQuantity: p.stock,
      images: [`/uploads/products/seed/${p.image}.png`],
      isFeatured: !!p.featured,
    });
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
