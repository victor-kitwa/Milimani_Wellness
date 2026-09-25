import {
  Pill,
  Leaf,
  Droplet,
  Dumbbell,
  Sparkles,
  Home as HomeIcon,
  type LucideIcon,
} from "lucide-react";

// Keyword-matched icon per category, with a sensible fallback for any
// category name we don't recognize (categories are managed data, not a
// fixed list, so this has to degrade gracefully rather than assume).
// Shared by the homepage category showcase, the header's Shop dropdown,
// and the mobile menu, so all three stay in sync automatically.
export function iconFor(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("supplement") || n.includes("vitamin")) return Pill;
  if (n.includes("tea") || n.includes("herb")) return Leaf;
  if (n.includes("oil") || n.includes("aroma")) return Droplet;
  if (n.includes("yoga") || n.includes("fitness") || n.includes("gym")) return Dumbbell;
  if (n.includes("home")) return HomeIcon;
  return Sparkles;
}
