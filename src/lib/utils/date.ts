import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"

const IST_OFFSET = "+05:30"

export function formatDate(date: string | Date, formatStr = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, formatStr)
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  if (isToday(d)) return "Today"
  if (isYesterday(d)) return "Yesterday"
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "MMM d, yyyy h:mm a") + " IST"
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "h:mm a") + " IST"
}

export function formatIST(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date
  return format(d, "dd MMM yyyy, h:mm a") + " IST"
}

export function toIST(date: string | Date): Date {
  const d = typeof date === "string" ? parseISO(date) : date
  return new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
}

export function isExpired(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date
  return d < new Date()
}

export function daysFromNow(date: string | Date): number {
  const d = typeof date === "string" ? parseISO(date) : date
  const diff = d.getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
