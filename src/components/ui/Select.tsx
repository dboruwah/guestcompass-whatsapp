"use client"

import { forwardRef, type SelectHTMLAttributes } from "react"
import { cn } from "@/lib/utils/cn"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string; disabled?: boolean }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg border border-input bg-secondary/50 py-2 pl-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all",
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    )
  },
)
Select.displayName = "Select"
