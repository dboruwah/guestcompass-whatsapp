"use client"

import { useState } from "react"
import { Select } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Image, Video, FileText, Plus, X, Sparkles, Smile, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface ButtonConfig {
  type: "url" | "call" | "reply"
  text: string
  url?: string
  phone?: string
}

interface ComposerProps {
  content: string
  onChange: (v: string) => void
  mediaUrl: string | null
  onMediaUrlChange: (v: string | null) => void
  mediaType: "image" | "video" | "document" | null
  onMediaTypeChange: (v: "image" | "video" | "document" | null) => void
  buttons: ButtonConfig[]
  onButtonsChange: (v: ButtonConfig[]) => void
}

const TEMPLATE_PRESETS = [
  { id: "welcome", name: "Welcome Message", text: "Hello *{{first_name}}*! Thank you for opting in to *{{business_name}}*. Use code *{{code}}* for 10% off." },
  { id: "flash_sale", name: "Flash Sale Offer", text: "Flash Sale Alert! 🚨 *{{first_name}}*, get up to 50% off select items. Coupon: *{{code}}*. Valid for 24 hours only!" },
  { id: "feedback", name: "Customer Feedback", text: "Hi *{{first_name}}*, how was your recent purchase? Let us know by replying to this message." },
]

export function Composer({
  content,
  onChange,
  mediaUrl,
  onMediaUrlChange,
  mediaType,
  onMediaTypeChange,
  buttons,
  onButtonsChange,
}: ComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [showAddButton, setShowAddButton] = useState(false)
  const [btnType, setBtnType] = useState<"url" | "call" | "reply">("url")
  const [btnText, setBtnText] = useState("")
  const [btnValue, setBtnValue] = useState("")

  const applyTemplate = (id: string) => {
    setSelectedTemplate(id)
    const tpl = TEMPLATE_PRESETS.find((p) => p.id === id)
    if (tpl) onChange(tpl.text)
  }

  const addButton = () => {
    if (!btnText) return
    const newBtn: ButtonConfig = { type: btnType, text: btnText }
    if (btnType === "url") newBtn.url = btnValue
    if (btnType === "call") newBtn.phone = btnValue
    onButtonsChange([...buttons, newBtn])
    setBtnText("")
    setBtnValue("")
    setShowAddButton(false)
  }

  const removeButton = (idx: number) => {
    onButtonsChange(buttons.filter((_, i) => i !== idx))
  }

  const charCount = content.length

  return (
    <div className="space-y-6">
      {/* Presets / Templates */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Select Template Presets</label>
        <Select
          value={selectedTemplate}
          onChange={(e) => applyTemplate(e.target.value)}
          options={TEMPLATE_PRESETS.map((p) => ({ label: p.name, value: p.id }))}
          placeholder="Choose a template..."
        />
      </div>

      {/* Media Header */}
      <div>
        <label className="text-sm font-medium mb-2 block">Header Attachment (Optional)</label>
        <div className="flex gap-2 mb-3">
          {[
            { type: "image" as const, label: "Image", icon: Image },
            { type: "video" as const, label: "Video", icon: Video },
            { type: "document" as const, label: "Document", icon: FileText },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => onMediaTypeChange(mediaType === item.type ? null : item.type)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                mediaType === item.type
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {mediaType && (
          <div className="space-y-2">
            <Input
              value={mediaUrl || ""}
              onChange={(e) => onMediaUrlChange(e.target.value || null)}
              placeholder={`Enter ${mediaType} URL (e.g., https://example.com/image.jpg)`}
            />
            <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, MP4, PDF. Max 16MB.</p>
          </div>
        )}
      </div>

      {/* Message Body */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-medium">Message Content</label>
          <span className={cn("text-xs", charCount > 1024 ? "text-red-400" : "text-muted-foreground")}>
            {charCount}/1024 characters
          </span>
        </div>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            placeholder="Type your WhatsApp message. Wrap in *bold*, _italics_, ~strikethrough~, ```monospace```. Use {{first_name}} for dynamic tokens."
            className="w-full rounded-lg border border-input bg-secondary/50 py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="Insert Emoji">
              <Smile className="h-4 w-4" />
            </button>
            <button className="rounded-lg p-1.5 text-accent hover:bg-accent/10 transition-colors" title="AI Assistant">
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="neutral" size="sm">Formatting support</Badge>
          <span className="text-[10px] text-muted-foreground">*bold*, _italics_, ~strikethrough~</span>
        </div>
      </div>

      {/* Interactive Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Interactive Buttons (Max 3)</label>
          {buttons.length < 3 && !showAddButton && (
            <button
              onClick={() => setShowAddButton(true)}
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add button
            </button>
          )}
        </div>

        <div className="space-y-2">
          {buttons.map((btn, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30 animate-in">
              <div className="flex items-center gap-2">
                <Badge variant={btn.type === "url" ? "blue" : btn.type === "call" ? "green" : "neutral"} size="sm">
                  {btn.type.toUpperCase()}
                </Badge>
                <span className="text-sm font-medium">{btn.text}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {btn.url || btn.phone}
                </span>
              </div>
              <button onClick={() => removeButton(idx)} className="rounded-lg p-1 text-muted-foreground hover:text-red-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {showAddButton && (
          <div className="p-4 rounded-lg border border-border bg-secondary/50 space-y-3 animate-in">
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "url" as const, label: "Call to Action" },
                { type: "call" as const, label: "Phone Call" },
                { type: "reply" as const, label: "Quick Reply" },
              ].map((btnOpt) => (
                <button
                  key={btnOpt.type}
                  onClick={() => setBtnType(btnOpt.type)}
                  className={cn(
                    "py-1.5 rounded-md border text-xs font-semibold transition-colors",
                    btnType === btnOpt.type
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {btnOpt.label}
                </button>
              ))}
            </div>

            <div className="grid gap-2">
              <Input
                value={btnText}
                onChange={(e) => setBtnText(e.target.value)}
                placeholder="Button Text (e.g., Visit Website)"
                maxLength={25}
              />
              {btnType !== "reply" && (
                <Input
                  value={btnValue}
                  onChange={(e) => setBtnValue(e.target.value)}
                  placeholder={btnType === "url" ? "https://yourwebsite.com/promo" : "+1 (555) 123-4567"}
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAddButton(false)}>Cancel</Button>
              <Button size="sm" onClick={addButton} disabled={!btnText}>Add</Button>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 flex gap-2">
        <HelpCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-yellow-500">Template Compliance Notice</p>
          <p className="text-[10px] text-yellow-500/80 leading-relaxed">
            WhatsApp Business API requires marketing templates to be approved before sending. All campaigns using custom parameters will undergo rapid approval. Ensure you provide clear variables.
          </p>
        </div>
      </div>
    </div>
  )
}
