import { Badge } from "@/components/ui/Badge"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

interface OptInBadgeProps {
  status: "opted_in" | "pending" | "opted_out"
  size?: "sm" | "md"
}

const config = {
  opted_in: { label: "Opted In", variant: "green" as const, icon: CheckCircle },
  pending: { label: "Pending", variant: "amber" as const, icon: Clock },
  opted_out: { label: "Opted Out", variant: "red" as const, icon: XCircle },
} as const

export function OptInBadge({ status, size = "sm" }: OptInBadgeProps) {
  const { label, variant, icon: Icon } = config[status]

  return (
    <Badge variant={variant} size={size} dot>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
