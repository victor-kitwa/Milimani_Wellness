import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-surface-2 text-muted-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  brand: "bg-brand/10 text-brand-dark",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // The border alone wasn't enough to lift these off the page in light
    // mode, where --background (#fafaf9) and --card (#ffffff) are only a
    // few points apart. Dark mode's card tone is already visibly lighter
    // than its background, so this shadow just quietly adds nothing extra
    // there instead of needing its own light/dark split.
    <div className={cn("rounded-xl border border-border bg-card shadow-md", className)}>
      {children}
    </div>
  );
}
