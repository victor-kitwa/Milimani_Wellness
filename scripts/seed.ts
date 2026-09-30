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
    { name: "Vitamin C 1000mg", categoryId: supplements.id, price: 1200, compareAtPrice: 1500, description: "High-potency vitamin C for immune support. 60 tablets per bottle.", image: "https://images.unsplash.com/photo-1767116291180-1838947b6c4d?w=800&h=800&fit=crop&q=80&auto=format", stock: 40, featured: true },
    { name: "Daily Multivitamin", categoryId: supplements.id, price: 1800, description: "Complete daily multivitamin and mineral formula for adults. 30-day supply.", image: "https://images.unsplash.com/photo-1648139347040-857f024f8da4?w=800&h=800&fit=crop&q=80&auto=format", stock: 30 },
    { name: "Omega 3 Fish Oil", categoryId: supplements.id, price: 2400, description: "Premium omega 3 fatty acids for heart, brain, and joint health. 60 softgels.", image: "https://images.unsplash.com/photo-1709907325862-170caa96e8bb?w=800&h=800&fit=crop&q=80&auto=format", stock: 25, featured: true },
    { name: "Herbal Green Tea", categoryId: herbal.id, price: 650, description: "Antioxidant-rich green tea leaves. 25 tea bags.", image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&h=800&fit=crop&q=80&auto=format", stock: 50 },
    { name: "Chamomile Tea", categoryId: herbal.id, price: 550, description: "Calming chamomile tea to help you unwind and sleep better. 20 tea bags.", image: "https://images.unsplash.com/photo-1654713803623-3d2b9d39f6b3?w=800&h=800&fit=crop&q=80&auto=format", stock: 45 },
    { name: "Lavender Essential Oil", categoryId: oils.id, price: 1500, description: "Pure lavender essential oil for relaxation and better sleep. 30ml.", image: "https://images.unsplash.com/photo-1693567397897-61ea5c665078?w=800&h=800&fit=crop&q=80&auto=format", stock: 20, featured: true },
    { name: "Eucalyptus Essential Oil", categoryId: oils.id, price: 1300, description: "Refreshing eucalyptus oil, great for steam inhalation and diffusers. 30ml.", image: "https://images.unsplash.com/photo-1671493235081-5842463637cd?w=800&h=800&fit=crop&q=80&auto=format", stock: 18 },
    { name: "Premium Yoga Mat", categoryId: yoga.id, price: 2800, compareAtPrice: 3500, description: "6mm non-slip yoga mat with carrying strap. Perfect for home practice.", image: "https://images.unsplash.com/photo-1763004871583-4183d64096b1?w=800&h=800&fit=crop&q=80&auto=format", stock: 22, featured: true },
    { name: "Meditation Cushion", categoryId: yoga.id, price: 3200, description: "Buckwheat-filled zafu cushion for comfortable seated meditation.", image: "https://images.unsplash.com/photo-1597307509190-e33cb9fb3ff7?w=800&h=800&fit=crop&q=80&auto=format", stock: 12 },
    { name: "Resistance Bands Set", categoryId: yoga.id, price: 1800, description: "Set of 5 resistance bands for strength training at home.", image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&h=800&fit=crop&q=80&auto=format", stock: 20 },
    { name: "Natural Face Serum", categoryId: skincare.id, price: 2200, description: "Vitamin-rich face serum with natural botanicals. 30ml.", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=800&fit=crop&q=80&auto=format", stock: 15 },
    { name: "Aloe Vera Gel", categoryId: skincare.id, price: 850, description: "Pure aloe vera gel for skin hydration and soothing. 200ml.", image: "https://images.unsplash.com/photo-1486961927870-395253783824?w=800&h=800&fit=crop&q=80&auto=format", stock: 35 },
    { name: "Shea Body Butter", categoryId: skincare.id, price: 1400, description: "Rich, moisturising body butter made with pure shea. 250g.", image: "https://images.unsplash.com/photo-1768483018807-bd0b9ab86539?w=800&h=800&fit=crop&q=80&auto=format", stock: 28 },
    { name: "Himalayan Salt Lamp", categoryId: home.id, price: 3800, description: "Hand-carved Himalayan salt lamp for a warm, calming glow.", image: "https://images.unsplash.com/photo-1623241923490-5b2fd532828f?w=800&h=800&fit=crop&q=80&auto=format", stock: 10 },
    { name: "Insulated Water Bottle", categoryId: home.id, price: 1500, description: "Stainless steel insulated bottle, 1L. Keeps drinks cold 24h, hot 12h.", image: "https://images.unsplash.com/photo-1544003484-3cd181d17917?w=800&h=800&fit=crop&q=80&auto=format", stock: 40 },
  ];

  console.log("Seeding products...");
  for (const p of demoProducts) {
    const slug = slugify(p.name);
    const [existing] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (existing) {
      // Backfill the photo on rows seeded before this script switched from
      // the generated color-card placeholders to real stock photography.
      // Only touches a row whose image is still that old placeholder path,
      // so a photo an admin has since replaced through the dashboard is
      // never overwritten.
      if (existing.images?.[0]?.startsWith("/uploads/products/seed/")) {
        await db.update(products).set({ images: [p.image] }).where(eq(products.id, existing.id));
      }
      continue;
    }
    await db.insert(products).values({
      name: p.name,
      slug,
      description: p.description,
      categoryId: p.categoryId,
      price: p.price.toFixed(2),
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toFixed(2) : null,
      stockQuantity: p.stock,
      images: [p.image],
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
