import { cn } from "@/lib/utils";
import Link from "next/link";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary: "bg-brand text-brand-foreground hover:bg-brand-hover",
  secondary: "bg-foreground text-background hover:opacity-90",
  accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
  outline: "border border-border-strong bg-card text-foreground hover:bg-surface",
  ghost: "text-foreground hover:bg-surface",
  danger: "bg-danger text-white hover:opacity-90",
  gradient:
    "bg-gradient-to-r from-brand to-brand-hover text-brand-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

export function ButtonLink({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
}: {
  href: string;
  className?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
