import { Suspense } from "react";
import { SignInCard } from "@/components/ui/sign-in-card";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <Suspense>
      <SignInCard
        mode="signup"
        whatsappNumber={process.env.STORE_WHATSAPP_NUMBER}
      />
    </Suspense>
  );
}
