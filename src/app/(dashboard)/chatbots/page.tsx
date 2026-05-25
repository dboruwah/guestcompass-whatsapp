"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Loader2, Bot, Plus, Power, PowerOff, Edit, Trash2 } from "lucide-react"
import type { Chatbot } from "@/lib/types"

const STATUS_COLORS: Record<string, "neutral" | "green" | "amber" | "red"> = {
  draft: "neutral",
  active: "green",
  paused: "amber",
}

export default function ChatbotsPage() {
  const router = useRouter()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch("/api/chatbots")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setChatbots(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      const bot = await res.json()
      setShowCreate(false)
      setName("")
      router.push(`/chatbots/${bot.id}`)
    } catch {}
    setCreating(false)
  }

  const handleToggleStatus = async (bot: Chatbot) => {
    const newStatus = bot.status === "active" ? "paused" : "active"
    await fetch(`/api/chatbots/${bot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setChatbots((prev) => prev.map((b) => (b.id === bot.id ? { ...b, status: newStatus as Chatbot["status"] } : b)))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this chatbot?")) return
    await fetch(`/api/chatbots/${id}`, { method: "DELETE" })
    setChatbots((prev) => prev.filter((b) => b.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Chatbots"
        description="No-code WhatsApp auto-reply bots"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Chatbot
          </Button>
        }
      />

      {chatbots.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No chatbots yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create automated WhatsApp reply flows for your guests
          </p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first chatbot
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chatbots.map((bot) => (
            <div key={bot.id} className="rounded-xl border border-border bg-card p-5 hover:border-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Bot className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{bot.name}</h3>
                    <Badge variant={STATUS_COLORS[bot.status] || "neutral"} size="sm">
                      {bot.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => router.push(`/chatbots/${bot.id}`)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleToggleStatus(bot)}>
                  {bot.status === "active" ? <PowerOff className="h-4 w-4 mr-1" /> : <Power className="h-4 w-4 mr-1" />}
                  {bot.status === "active" ? "Pause" : "Activate"}
                </Button>
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(bot.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Chatbot" size="sm">
        <div className="space-y-4">
          <Input
            placeholder="e.g., Guest Support Bot"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
