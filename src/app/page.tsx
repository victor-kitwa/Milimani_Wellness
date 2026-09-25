import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { and, eq, isNull, desc, sql } from "drizzle-orm";
import { ProductCard } from "@/components/storefront/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Truck, Smartphone, ShieldCheck, MapPin } from "lucide-react";
import { HeroSection } from "@/components/storefront/hero-section";
import { TestimonialsSection } from "@/components/storefront/testimonials-section";
import { AboutSection } from "@/components/storefront/about-section";
import { WellnessTipsSection } from "@/components/storefront/wellness-tips-section";
import { CategoryShowcase } from "@/components/storefront/category-showcase";
import { FinalCtaSection } from "@/components/storefront/final-cta-section";
import { FloatingWellnessDecor, type FloatingIcon } from "@/components/ui/floating-wellness-decor";

// Hand-placed per section so the effect doesn't feel like one repeated
// pattern copy-pasted down the page — see floating-wellness-decor.tsx.
// Icons are referenced by name, not by component: this array is built in a
// Server Component, and only plain serializable data can be passed as
// props into the Client Component that renders them.
const FEATURED_DECOR: FloatingIcon[] = [
  { icon: "leaf", className: "top-6 left-[4%] h-24 w-24 sm:h-32 sm:w-32", duration: 11, delay: 0 },
  { icon: "droplet", className: "bottom-4 right-[6%] h-20 w-20 sm:h-28 sm:w-28", duration: 9, delay: 1.5 },
  { icon: "sparkles", className: "top-10 right-[18%] hidden h-14 w-14 sm:block", duration: 7, delay: 0.6 },
  { icon: "ring", className: "bottom-16 left-[22%] hidden h-16 w-16 sm:block", duration: 14, delay: 0.9 },
];

const SHOP_DECOR: FloatingIcon[] = [
  { icon: "flower", className: "bottom-0 left-[2%] h-28 w-28 sm:h-40 sm:w-40", duration: 13, delay: 0.3 },
  { icon: "leaf", className: "top-8 right-[5%] h-20 w-20 sm:h-28 sm:w-28", duration: 10, delay: 1 },
  { icon: "droplet", className: "top-1/2 left-[15%] hidden h-12 w-12 sm:block", duration: 8, delay: 2 },
  { icon: "ring-dashed", className: "top-4 right-[28%] hidden h-20 w-20 lg:block", duration: 15, delay: 1.6 },
];

export default async function HomePage() {
  const [featured, recent, topCategories, productCountRow] = await Promise.all([
    db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .limit(4),
    db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt))
      .limit(12),
    db
      .select()
      .from(categories)
      .where(and(eq(categories.isActive, true), isNull(categories.parentId)))
      .limit(8),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.isActive, true)),
  ]);
  const productCount = productCountRow[0]?.count ?? 0;

  const storeName = process.env.STORE_NAME || "Milimani Wellness Center";
  const whatsappNumber = process.env.STORE_WHATSAPP_NUMBER;
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

  const trustItems = [
    { icon: Truck, label: "Free delivery over KSh 10,000" },
    { icon: Smartphone, label: "Pay with M-Pesa" },
    { icon: ShieldCheck, label: "Genuine products only" },
    { icon: MapPin, label: "Fast Nairobi and countrywide delivery" },
  ];

  return (
    <div>
      <HeroSection />

      <section className="border-b border-border bg-surface">
        <div className="container-page grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 text-center">
              <item.icon className="h-6 w-6 text-brand" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <AboutSection storeName={storeName} categoriesCount={topCategories.length} />

      <CategoryShowcase categories={topCategories} />

      {featured.length > 0 && (
        <section className="container-page relative overflow-hidden py-14 sm:py-20">
          <FloatingWellnessDecor icons={FEATURED_DECOR} />
          <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            Featured picks
          </h2>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            A few favorites our customers keep coming back for.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section id="shop" className="relative overflow-hidden border-t border-border bg-surface py-14 sm:py-20">
        <FloatingWellnessDecor icons={SHOP_DECOR} />
        <div className="container-page">
          <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            Shop wellness essentials
          </h2>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Our newest arrivals across supplements, teas, oils, skincare and more.
          </p>
          {recent.length === 0 ? (
            <p className="text-muted-foreground">
              No products yet. Add your first product from the admin dashboard.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {recent.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <ButtonLink href="/products" variant="outline" size="lg">
                  View all products
                </ButtonLink>
              </div>
            </>
          )}
        </div>
      </section>

      <TestimonialsSection />

      <WellnessTipsSection />

      <FinalCtaSection whatsappHref={whatsappHref} productCount={productCount} />
    </div>
  );
}
