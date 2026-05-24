"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui"
import { DataTable, type Column } from "@/components/data-display"
import { formatPhoneNumber } from "@/lib/utils/format"
import { formatDateTime } from "@/lib/utils/date"
import { Loader2, Plus, Users } from "lucide-react"

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string
  tags: string[]
  opt_in_status: string
  created_at: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchContacts = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    fetch(`/api/contacts?${params}`)
      .then(r => r.json())
      .then(data => setContacts(data.contacts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchContacts() }, [])

  const columns: Column<Contact>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <Link href={`/contacts/${c.id}`} className="hover:opacity-80 transition-opacity">
          <p className="font-medium text-sm">{c.first_name} {c.last_name}</p>
          {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
        </Link>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (c) => <span className="text-sm">{formatPhoneNumber(c.phone)}</span>,
    },
    {
      key: "opt_in_status",
      header: "Status",
      render: (c) => (
        <span className={`text-xs font-medium ${c.opt_in_status === "opted_in" ? "text-emerald-400" : "text-muted-foreground"}`}>
          {c.opt_in_status.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (c) => (
        <div className="flex gap-1 flex-wrap">
          {(c.tags || []).slice(0, 3).map((t, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{t}</span>
          ))}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (c) => <span className="text-xs text-muted-foreground">{formatDateTime(c.created_at)}</span>,
    },
  ]

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Contacts"
        description={`${contacts.length} contacts`}
        actions={
          <Link href="/contacts/import">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Import
            </Button>
          </Link>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); fetchContacts() }}
            placeholder="Search by name, phone, or email..."
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No contacts yet. Import contacts or they will appear here automatically.</p>
        </div>
      ) : (
        <DataTable data={contacts} columns={columns} getId={(c) => c.id} />
      )}
    </div>
  )
}
