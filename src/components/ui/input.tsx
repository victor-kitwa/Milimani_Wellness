import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

export type InputVariant = "default" | "neu";

/* "default" keeps today's bordered look (used across the storefront: checkout,
   login, and anywhere else these are shared). "neu" is the pressed-in
   neumorphic treatment, kept opt-in so it never changes storefront inputs
   (see src/components/admin/admin-input.tsx, which defaults to it for the
   admin dashboard only). */
const variantStyles: Record<InputVariant, string> = {
  default: "border border-border bg-card focus:border-brand focus:ring-2 focus:ring-brand/20",
  neu: "border-none bg-card inset-shadow-neu focus:ring-2 focus:ring-brand/30",
};

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { variant?: InputVariant }
>(function Input({ className, variant = "default", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg px-3 text-sm outline-none transition",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { variant?: InputVariant }
>(function Textarea({ className, variant = "default", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg px-3 py-2 text-sm outline-none transition",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { variant?: InputVariant }
>(function Select({ className, variant = "default", ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg px-3 text-sm outline-none transition",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
