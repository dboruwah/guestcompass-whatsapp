import { cn } from "@/lib/utils/cn"

interface EngagementScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

const levels = [
  { min: 0, max: 20, label: "Dormant", color: "text-muted-foreground", bg: "bg-muted" },
  { min: 21, max: 40, label: "Low", color: "text-amber-400", bg: "bg-amber-400" },
  { min: 41, max: 60, label: "Moderate", color: "text-blue-400", bg: "bg-blue-400" },
  { min: 61, max: 80, label: "Active", color: "text-emerald-400", bg: "bg-emerald-400" },
  { min: 81, max: 100, label: "Highly Engaged", color: "text-accent", bg: "bg-accent" },
]

function getLevel(score: number) {
  return levels.find((l) => score >= l.min && score <= l.max) || levels[0]
}

export function EngagementScore({ score, size = "md", showLabel = false }: EngagementScoreProps) {
  const level = getLevel(score)
  const sizes = { sm: "h-1.5 w-12", md: "h-2 w-20", lg: "h-2.5 w-28" }

  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-full bg-secondary overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", level.bg)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", level.color)}>{level.label}</span>
      )}
    </div>
  )
}
