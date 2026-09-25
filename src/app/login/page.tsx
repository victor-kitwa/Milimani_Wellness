import { Suspense } from "react";
import { SignInCard } from "@/components/ui/sign-in-card";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense>
      <SignInCard
        mode="signin"
        whatsappNumber={process.env.STORE_WHATSAPP_NUMBER}
      />
    </Suspense>
  );
}
