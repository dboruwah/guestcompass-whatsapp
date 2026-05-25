"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Loader2, Plus, GripVertical, Trash2, MessageSquare, Hash, Regex, DoorOpen, HelpCircle, Send, FileText, List } from "lucide-react"
import type { Chatbot, ChatbotRule, ChatbotTriggerType, ChatbotResponseType } from "@/lib/types"

interface RuleForm {
  trigger_type: ChatbotTriggerType
  trigger_value: string
  response_type: ChatbotResponseType
  response_text: string
}

const TRIGGER_ICONS: Record<ChatbotTriggerType, typeof Hash> = {
  keyword: Hash,
  exact_match: MessageSquare,
  regex: Regex,
  welcome: DoorOpen,
  fallback: HelpCircle,
}

const TRIGGER_LABELS: Record<ChatbotTriggerType, string> = {
  keyword: "Contains keyword",
  exact_match: "Exact match",
  regex: "Regex pattern",
  welcome: "Welcome message",
  fallback: "Fallback (catch-all)",
}

const RESPONSE_LABELS: Record<ChatbotResponseType, string> = {
  text: "Text reply",
  template: "Template message",
  interactive: "Interactive buttons",
}

const defaultRuleForm = (position: number): RuleForm => ({
  trigger_type: "keyword",
  trigger_value: "",
  response_type: "text",
  response_text: "",
})

export default function ChatbotBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [rules, setRules] = useState<ChatbotRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingRule, setEditingRule] = useState<RuleForm | null>(null)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)

  const fetchBot = useCallback(async () => {
    const { id } = await params
    const res = await fetch(`/api/chatbots/${id}`)
    if (!res.ok) { router.push("/chatbots"); return }
    const data = await res.json()
    setChatbot(data)
    setRules(data.rules || [])
    setLoading(false)
  }, [params, router])

  useEffect(() => { fetchBot() }, [fetchBot])

  const updateBot = async (updates: Partial<Chatbot>) => {
    const { id } = await params
    setSaving(true)
    const res = await fetch(`/api/chatbots/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const data = await res.json()
      setChatbot(data)
    }
    setSaving(false)
  }

  const openNewRule = () => {
    setEditingRule(defaultRuleForm(rules.length))
    setEditingRuleId(null)
    setShowRuleModal(true)
  }

  const openEditRule = (rule: ChatbotRule) => {
    setEditingRule({
      trigger_type: rule.trigger_type,
      trigger_value: rule.trigger_value || "",
      response_type: rule.response_type,
      response_text: typeof rule.response_config === "object" && rule.response_config !== null
        ? (rule.response_config as Record<string, string>).text || ""
        : "",
    })
    setEditingRuleId(rule.id)
    setShowRuleModal(true)
  }

  const saveRule = async () => {
    if (!editingRule) return
    const { id } = await params
    setSaving(true)

    const payload = {
      trigger_type: editingRule.trigger_type,
      trigger_value: editingRule.trigger_value || null,
      response_type: editingRule.response_type,
      response_config: { text: editingRule.response_text },
    }

    if (editingRuleId) {
      await fetch(`/api/chatbots/${id}/rules/${editingRuleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(`/api/chatbots/${id}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, position: rules.length }),
      })
    }

    setShowRuleModal(false)
    setEditingRule(null)
    setSaving(false)
    fetchBot()
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm("Delete this rule?")) return
    const { id } = await params
    await fetch(`/api/chatbots/${id}/rules/${ruleId}`, { method: "DELETE" })
    fetchBot()
  }

  const moveRule = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= rules.length) return
    const reordered = [...rules]
    ;[reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]]
    setRules(reordered)

    const { id } = await params
    for (let i = 0; i < reordered.length; i++) {
      await fetch(`/api/chatbots/${id}/rules/${reordered[i].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: i }),
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!chatbot) return null

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={chatbot.name}
        description="Configure your chatbot's auto-reply rules"
        actions={
          <div className="flex gap-2">
            <Button
              variant={chatbot.status === "active" ? "outline" : "primary"}
              onClick={() => updateBot({ status: chatbot.status === "active" ? "paused" : "active" })}
              loading={saving}
            >
              {chatbot.status === "active" ? "Pause" : "Activate"}
            </Button>
            <Button onClick={openNewRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        }
      />

      {/* Settings section */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Bot Settings</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Name</label>
            <Input
              value={chatbot.name}
              onChange={(e) => setChatbot({ ...chatbot, name: e.target.value })}
              onBlur={() => updateBot({ name: chatbot.name })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Status</label>
            <div className="pt-2">
              <Badge variant={chatbot.status === "active" ? "green" : chatbot.status === "paused" ? "amber" : "neutral"}>
                {chatbot.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Welcome Message (sent when a new conversation starts)</label>
          <textarea
            className="w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
            rows={2}
            value={chatbot.welcome_message || ""}
            onChange={(e) => setChatbot({ ...chatbot, welcome_message: e.target.value })}
            onBlur={() => updateBot({ welcome_message: chatbot.welcome_message || null })}
            placeholder="Hi! Welcome to our hotel. How can I help you today?"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Fallback Message (when no rule matches)</label>
          <textarea
            className="w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
            rows={2}
            value={chatbot.fallback_message || ""}
            onChange={(e) => setChatbot({ ...chatbot, fallback_message: e.target.value })}
            onBlur={() => updateBot({ fallback_message: chatbot.fallback_message || null })}
            placeholder="Sorry, I didn't understand that. Please try again or type 'help'."
          />
        </div>
      </div>

      {/* Rules flow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Rules ({rules.length})</h3>
          <Button size="sm" onClick={openNewRule}>
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>

        {rules.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No rules yet. Add rules to define how your chatbot responds to messages.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Flow arrow header */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 px-16">
              <span>Incoming message</span>
              <span className="flex-1 border-t border-dashed border-border" />
              <span>Match rule</span>
              <span className="flex-1 border-t border-dashed border-border" />
              <span>Send reply</span>
            </div>

            {rules.map((rule, index) => {
              const TrigIcon = TRIGGER_ICONS[rule.trigger_type] || HelpCircle
              const config = rule.response_config as Record<string, string> | null
              return (
                <div key={rule.id} className="relative">
                  {/* Connection arrow */}
                  {index > 0 && (
                    <div className="absolute -top-2 left-8 right-8 flex justify-center">
                      <div className="w-0.5 h-2 bg-border" />
                    </div>
                  )}

                  <div className="rounded-xl border border-border bg-card p-4 hover:border-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <button
                        className="cursor-grab text-muted-foreground hover:text-foreground"
                        onClick={() => moveRule(index, "up")}
                        title="Move up"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>

                      {/* Trigger */}
                      <div className="flex-1 flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                          <TrigIcon className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            {TRIGGER_LABELS[rule.trigger_type]}
                          </span>
                          {rule.trigger_value && (
                            <p className="text-sm font-medium">{rule.trigger_value}</p>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center text-muted-foreground">
                        <div className="w-4 border-t border-dashed border-border" />
                        <Send className="h-4 w-4 mx-1" />
                        <div className="w-4 border-t border-dashed border-border" />
                      </div>

                      {/* Response */}
                      <div className="flex-1 flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                          <FileText className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">
                            {RESPONSE_LABELS[rule.response_type]}
                          </span>
                          {config?.text && (
                            <p className="text-sm truncate max-w-[200px]">{config.text}</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditRule(rule)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rule editor modal */}
      <Modal
        open={showRuleModal}
        onClose={() => { setShowRuleModal(false); setEditingRule(null) }}
        title={editingRuleId ? "Edit Rule" : "Add Rule"}
        size="md"
      >
        {editingRule && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">When someone sends...</label>
              <select
                className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={editingRule.trigger_type}
                onChange={(e) => setEditingRule({ ...editingRule, trigger_type: e.target.value as ChatbotTriggerType })}
              >
                <option value="keyword">Contains keyword</option>
                <option value="exact_match">Exact match</option>
                <option value="regex">Regex pattern</option>
                <option value="welcome">Welcome message (new conversation)</option>
                <option value="fallback">Fallback (catch-all, no match)</option>
              </select>
            </div>

            {editingRule.trigger_type !== "welcome" && editingRule.trigger_type !== "fallback" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {editingRule.trigger_type === "regex" ? "Pattern" : "Keyword or phrase"}
                </label>
                <Input
                  value={editingRule.trigger_value}
                  onChange={(e) => setEditingRule({ ...editingRule, trigger_value: e.target.value })}
                  placeholder={editingRule.trigger_type === "regex" ? "e.g., booking|reservation|room" : "e.g., booking"}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Response type</label>
              <select
                className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={editingRule.response_type}
                onChange={(e) => setEditingRule({ ...editingRule, response_type: e.target.value as ChatbotResponseType })}
              >
                <option value="text">Text reply</option>
                <option value="template">Template message</option>
                <option value="interactive">Interactive buttons</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Response text</label>
              <textarea
                className="w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
                rows={3}
                value={editingRule.response_text}
                onChange={(e) => setEditingRule({ ...editingRule, response_text: e.target.value })}
                placeholder="Type your reply message here..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => { setShowRuleModal(false); setEditingRule(null) }}>
                Cancel
              </Button>
              <Button onClick={saveRule} loading={saving}>
                {editingRuleId ? "Save Changes" : "Add Rule"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
