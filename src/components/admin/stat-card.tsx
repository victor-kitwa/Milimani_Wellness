import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "neutral" | "brand" | "danger";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <Icon
            className={cn(
              "h-4 w-4",
              tone === "brand" && "text-brand",
              tone === "danger" && "text-danger",
              tone === "neutral" && "text-muted"
            )}
          />
        )}
      </div>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </Card>
  );
}
