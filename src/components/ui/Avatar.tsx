import { cn } from "@/lib/utils/cn"
import { initials } from "@/lib/utils/format"

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
} as const

interface AvatarProps {
  src?: string | null
  name: string
  size?: keyof typeof sizes
  className?: string
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  )
}
