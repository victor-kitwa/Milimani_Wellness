"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { isStoreStaff } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

type Mode = "signin" | "signup";

export function AuthSwitch({ initialMode = "signin" }: { initialMode?: Mode }) {
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchTo(next: Mode) {
    if (next === mode) return;
    setMode(next);
    setError(null);
    // Update the URL so the visible route matches the tab (nice for share/back button)
    if (next === "signin" && window.location.pathname !== "/login") {
      window.history.replaceState(null, "", "/login" + window.location.search);
    } else if (next === "signup" && window.location.pathname !== "/register") {
      window.history.replaceState(null, "", "/register" + window.location.search);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "signin"
        ? { email: fd.get("email"), password: fd.get("password") }
        : {
            name: fd.get("name"),
            email: fd.get("email"),
            phone: fd.get("phone"),
            password: fd.get("password"),
          };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    if (mode === "signin") {
      const next = params.get("next") || (isStoreStaff(data.user) ? "/admin" : "/account");
      router.push(next);
    } else {
      router.push("/account");
    }
    router.refresh();
  }

  const brandName = "Milimani Wellness Center";

  return (
    <div className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-2">
      {/* Left brand panel */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between bg-gradient-to-br from-brand via-brand-strong to-brand-strong p-12 text-brand-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <Image
            src="/milimani-logo.jpg"
            alt={brandName}
            width={48}
            height={48}
            className="rounded-lg border border-white/20 bg-white"
          />
          <div className="leading-tight">
            <p className="text-lg font-bold">Milimani</p>
            <p className="text-xs opacity-80">Wellness Center</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Your wellness journey continues here.
          </h2>
          <p className="mt-4 text-base opacity-90">
            Join thousands of Kenyans who trust Milimani for supplements, herbal
            teas, essential oils, and everyday wellness essentials.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="h-4 w-4" />
              </span>
              Personalized product recommendations
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck className="h-4 w-4" />
              </span>
              Faster checkout, saved delivery addresses
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <Leaf className="h-4 w-4" />
              </span>
              Track every order from cart to doorstep
            </li>
          </ul>
        </div>

        <p className="relative text-xs opacity-70">
          © {new Date().getFullYear()} {brandName}
        </p>
      </aside>

      {/* Right form panel */}
      <section className="flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo (hidden when the aside is visible) */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src="/milimani-logo.jpg"
              alt={brandName}
              width={40}
              height={40}
              className="rounded-md"
            />
            <div className="leading-tight">
              <p className="text-base font-bold text-foreground">Milimani</p>
              <p className="text-xs text-muted-foreground">Wellness Center</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => switchTo("signin")}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                mode === "signin"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={mode === "signin"}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchTo("signup")}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                mode === "signup"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={mode === "signup"}
            >
              Create account
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue where you left off."
                : "Faster checkout, order tracking, and personalized picks."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" key={mode}>
            {mode === "signup" && (
              <Field label="Full name">
                <Input name="name" required autoComplete="name" />
              </Field>
            )}
            <Field label="Email">
              <Input name="email" type="email" required autoComplete="email" />
            </Field>
            {mode === "signup" && (
              <Field label="Phone (optional)">
                <Input
                  name="phone"
                  placeholder="0712 345 678"
                  autoComplete="tel"
                />
              </Field>
            )}
            <Field
              label="Password"
              hint={mode === "signup" ? "At least 6 characters" : undefined}
            >
              <Input
                name="password"
                type="password"
                required
                minLength={mode === "signup" ? 6 : undefined}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
              />
            </Field>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? mode === "signin"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <Link
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    switchTo("signup");
                  }}
                  className="font-medium text-brand hover:underline"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    switchTo("signin");
                  }}
                  className="font-medium text-brand hover:underline"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}

export default AuthSwitch;
