import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { Toaster } from "sonner";
import { MessageCircle } from "lucide-react";
import Script from "next/script";

const storeName = process.env.STORE_NAME || "Milimani Wellness Center";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: { default: storeName, template: `%s | ${storeName}` },
  description: `Shop supplements, herbal teas, essential oils, and wellness products at ${storeName}. Delivered across Kenya, pay with M-Pesa or on delivery.`,
};

// Runs before hydration to set data-theme from localStorage (falling back to
// system preference), which prevents a light-mode flash for dark-mode users
// on first paint. Kept as a string so it inlines into the head.
const themeInitScript = `(function(){try{var t=localStorage.getItem('duka_theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}else{var m=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',m?'dark':'light');}}catch(e){}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const whatsapp = process.env.STORE_WHATSAPP_NUMBER;

  // The admin dashboard has its own sidebar chrome - the storefront footer
  // (shop links, WhatsApp help card, trust strip) doesn't belong under it.
  // See proxy.ts, which is what sets this header on every request.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <CustomCursor />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        {!isAdminRoute && <SiteFooter />}
        <Toaster richColors position="top-center" />

        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors"
          >
            <MessageCircle className="h-7 w-7" />
          </a>
        )}

        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
