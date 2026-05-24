"use client"

import { useState, useCallback } from "react"

interface Contact {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  tags: string[]
  opt_in_status: "opted_in" | "pending" | "opted_out"
  opt_in_source: string | null
  engagement_score: number
  total_messages_received: number
  total_messages_sent: number
  last_message_at: string | null
  lifetime_value: number
  conversion_count: number
  assigned_to: string | null
  status: "active" | "inactive" | "blocked" | "opted_out"
  created_at: string
}

interface FilterRule {
  field: string
  operator: string
  value: string
}

interface UseContactsReturn {
  contacts: Contact[]
  loading: boolean
  search: string
  setSearch: (v: string) => void
  filters: FilterRule[]
  setFilters: (v: FilterRule[]) => void
  selected: string[]
  setSelected: (v: string[]) => void
  sortBy: string
  sortOrder: "asc" | "desc"
  handleSort: (key: string, order: "asc" | "desc") => void
  page: number
  setPage: (v: number) => void
  pageSize: number
  setPageSize: (v: number) => void
  total: number
  openImport: () => void
  closeImport: () => void
  openExport: () => void
  closeExport: () => void
  showImport: boolean
  showExport: boolean
}

const DEMO_CONTACTS: Contact[] = [
  { id: "1", first_name: "Sarah", last_name: "Mitchell", phone: "+1 (555) 234-5678", email: "sarah.m@email.com", tags: ["VIP", "High Spender"], opt_in_status: "opted_in", opt_in_source: "Website", engagement_score: 92, total_messages_received: 48, total_messages_sent: 34, last_message_at: "2026-05-20T14:30:00Z", lifetime_value: 4250, conversion_count: 8, assigned_to: "Sarah M.", status: "active", created_at: "2025-08-12T09:00:00Z" },
  { id: "2", first_name: "James", last_name: "Kowalski", phone: "+1 (555) 345-6789", email: "james.k@email.com", tags: ["Repeat Buyer"], opt_in_status: "opted_in", opt_in_source: "In-Store", engagement_score: 78, total_messages_received: 32, total_messages_sent: 18, last_message_at: "2026-05-19T11:20:00Z", lifetime_value: 1890, conversion_count: 5, assigned_to: "James K.", status: "active", created_at: "2025-11-03T10:00:00Z" },
  { id: "3", first_name: "Priya", last_name: "Rajasthan", phone: "+1 (555) 456-7890", email: "priya.r@email.com", tags: ["VIP", "Early Adopter"], opt_in_status: "opted_in", opt_in_source: "Referral", engagement_score: 95, total_messages_received: 62, total_messages_sent: 48, last_message_at: "2026-05-21T09:15:00Z", lifetime_value: 6800, conversion_count: 12, assigned_to: "Priya R.", status: "active", created_at: "2025-06-18T08:00:00Z" },
  { id: "4", first_name: "Alex", last_name: "Thompson", phone: "+1 (555) 567-8901", email: "alex.t@email.com", tags: ["New"], opt_in_status: "pending", opt_in_source: "Social Media", engagement_score: 25, total_messages_received: 3, total_messages_sent: 1, last_message_at: "2026-05-15T16:45:00Z", lifetime_value: 120, conversion_count: 0, assigned_to: null, status: "active", created_at: "2026-05-10T12:00:00Z" },
  { id: "5", first_name: "Maria", last_name: "Garcia", phone: "+1 (555) 678-9012", email: "maria.g@email.com", tags: ["High Spender", "VIP"], opt_in_status: "opted_in", opt_in_source: "Website", engagement_score: 88, total_messages_received: 41, total_messages_sent: 29, last_message_at: "2026-05-18T13:00:00Z", lifetime_value: 3420, conversion_count: 7, assigned_to: "Sarah M.", status: "active", created_at: "2025-09-22T11:00:00Z" },
  { id: "6", first_name: "David", last_name: "Chen", phone: "+1 (555) 789-0123", email: "david.c@email.com", tags: ["Inactive"], opt_in_status: "opted_in", opt_in_source: "In-Store", engagement_score: 15, total_messages_received: 8, total_messages_sent: 0, last_message_at: "2026-03-10T10:00:00Z", lifetime_value: 340, conversion_count: 1, assigned_to: null, status: "inactive", created_at: "2025-12-01T09:00:00Z" },
  { id: "7", first_name: "Emma", last_name: "Wilson", phone: "+1 (555) 890-1234", email: "emma.w@email.com", tags: ["Repeat Buyer"], opt_in_status: "opted_in", opt_in_source: "Campaign", engagement_score: 72, total_messages_received: 28, total_messages_sent: 15, last_message_at: "2026-05-17T15:30:00Z", lifetime_value: 1560, conversion_count: 4, assigned_to: "Alex T.", status: "active", created_at: "2026-01-15T10:00:00Z" },
  { id: "8", first_name: "Robert", last_name: "Brown", phone: "+1 (555) 901-2345", email: "robert.b@email.com", tags: [], opt_in_status: "opted_out", opt_in_source: "Website", engagement_score: 8, total_messages_received: 5, total_messages_sent: 0, last_message_at: "2026-02-20T08:00:00Z", lifetime_value: 0, conversion_count: 0, assigned_to: null, status: "opted_out", created_at: "2026-02-01T09:00:00Z" },
  { id: "9", first_name: "Lisa", last_name: "Anderson", phone: "+1 (555) 012-3456", email: "lisa.a@email.com", tags: ["VIP", "High Spender", "Early Adopter"], opt_in_status: "opted_in", opt_in_source: "Referral", engagement_score: 97, total_messages_received: 78, total_messages_sent: 56, last_message_at: "2026-05-21T17:00:00Z", lifetime_value: 9200, conversion_count: 18, assigned_to: "Priya R.", status: "active", created_at: "2025-04-10T08:00:00Z" },
  { id: "10", first_name: "Michael", last_name: "Taylor", phone: "+1 (555) 123-4567", email: "michael.t@email.com", tags: ["New"], opt_in_status: "pending", opt_in_source: "Social Media", engagement_score: 30, total_messages_received: 4, total_messages_sent: 2, last_message_at: "2026-05-19T12:00:00Z", lifetime_value: 85, conversion_count: 0, assigned_to: "James K.", status: "active", created_at: "2026-05-14T14:00:00Z" },
]

export function useContacts(): UseContactsReturn {
  const [contacts] = useState<Contact[]>(DEMO_CONTACTS)
  const [loading] = useState(false)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<FilterRule[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("last_message_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const handleSort = useCallback((key: string, order: "asc" | "desc") => {
    setSortBy(key)
    setSortOrder(order)
  }, [])

  return {
    contacts,
    loading,
    search,
    setSearch,
    filters,
    setFilters,
    selected,
    setSelected,
    sortBy,
    sortOrder,
    handleSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    total: contacts.length,
    openImport: () => setShowImport(true),
    closeImport: () => setShowImport(false),
    openExport: () => setShowExport(true),
    closeExport: () => setShowExport(false),
    showImport,
    showExport,
  }
}
