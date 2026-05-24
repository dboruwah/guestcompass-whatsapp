export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length > 11) {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -5)} ${cleaned.slice(-5)}`
  }
  return phone
}

export function formatCurrency(amount: number, currency = "INR"): string {
  if (currency === "INR") {
    const lakh = Math.floor(amount / 100000)
    const thousand = Math.floor((amount % 100000) / 1000)
    const remainder = amount % 1000
    let result = "₹"
    if (lakh > 0) result += `${lakh},${thousand.toString().padStart(2, "0")},${remainder.toFixed(2).padStart(6, "0")}`
    else if (thousand > 0) result += `${thousand},${remainder.toFixed(2).padStart(6, "0")}`
    else result += remainder.toFixed(2)
    return result
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, compact = false): string {
  if (compact) {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }
  return new Intl.NumberFormat("en-IN").format(value)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + "..."
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
