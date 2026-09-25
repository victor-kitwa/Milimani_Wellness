import { ContactSection } from "@/components/storefront/contact-section";

export const metadata = {
  title: "Contact us",
  description: "Get in touch for order help, product advice, or delivery questions.",
};

export default function ContactPage() {
  const storeName = process.env.STORE_NAME || "Milimani Wellness Center";
  const whatsappNumber = process.env.STORE_WHATSAPP_NUMBER;

  return <ContactSection storeName={storeName} whatsappNumber={whatsappNumber} />;
}
