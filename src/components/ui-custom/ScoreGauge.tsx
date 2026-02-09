import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreGauge({
  score,
  size = "md",
  showLabel = true,
  className,
}: ScoreGaugeProps) {
  const getRiskLevel = (s: number) => {
    if (s < 30) return { level: "low", label: "Faible", color: "#22c55e" };
    if (s < 70) return { level: "medium", label: "Moyen", color: "#f59e0b" };
    return { level: "high", label: "Élevé", color: "#ef4444" };
  };

  const risk = getRiskLevel(score);

  const sizeConfig = {
    sm: { width: 80, stroke: 8, font: "text-sm" },
    md: { width: 120, stroke: 12, font: "text-lg" },
    lg: { width: 160, stroke: 16, font: "text-2xl" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.stroke}
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={risk.color}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", config.font)}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      {showLabel && (
        <div className="mt-2 text-center">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              risk.level === "low" && "bg-green-100 text-green-800",
              risk.level === "medium" && "bg-yellow-100 text-yellow-800",
              risk.level === "high" && "bg-red-100 text-red-800"
            )}
          >
            {risk.label}
          </span>
        </div>
      )}
    </div>
  );
}
