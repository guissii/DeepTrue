import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RiskBadgeProps {
  level: "low" | "medium" | "high";
  showLabel?: boolean;
  className?: string;
}

export function RiskBadge({ level, showLabel = true, className }: RiskBadgeProps) {
  const config = {
    low: {
      label: "Faible",
      labelEn: "Low",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    medium: {
      label: "Moyen",
      labelEn: "Medium",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    high: {
      label: "Élevé",
      labelEn: "High",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
  };

  const { label, className: riskClassName } = config[level];

  if (!showLabel) {
    return (
      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          level === "low" && "bg-green-500",
          level === "medium" && "bg-yellow-500",
          level === "high" && "bg-red-500",
          className
        )}
      />
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(riskClassName, className)}
    >
      {label}
    </Badge>
  );
}
