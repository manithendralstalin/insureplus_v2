import { HeartPulse, ShieldCheck, Car, Plane, Home, type LucideIcon } from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Health: HeartPulse,
  Life: ShieldCheck,
  Motor: Car,
  Travel: Plane,
  Home: Home,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const Icon = MAP[category] ?? ShieldCheck;
  return <Icon className={className} />;
}
