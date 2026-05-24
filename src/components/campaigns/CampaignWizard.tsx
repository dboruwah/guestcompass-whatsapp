"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { WhatsAppPreview } from "./WhatsAppPreview"
import { Composer } from "./Composer"
import { SchedulingForm } from "./SchedulingForm"
import { Check, ArrowRight, ArrowLeft, Users, Send, MessageSquare, AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface ButtonConfig {
  type: "url" | "call" | "reply"
  text: string
  url?: string
  phone?: string
}

interface CampaignWizardProps {
  onSave?: (campaignData: any) => void
}

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Audience" },
  { id: 3, label: "Composer" },
  { id: 4, label: "Schedule" },
  { id: 5, label: "Review" },
]

const OBJECTIVES = [
  { label: "Promotional Offer", value: "promotional" },
  { label: "Customer Re-engagement", value: "engagement" },
  { label: "Transactional Broadcast", value: "transactional" },
  { label: "Feedback / Review", value: "feedback" },
  { label: "General Announcement", value: "announcement" },
]

const DEMO_SEGMENTS = [
  { id: "1", name: "VIP Customers (342 contacts)" },
  { id: "2", name: "Highly Engaged (1,284 contacts)" },
  { id: "3", name: "Recent Opt-ins (284 contacts)" },
  { id: "4", name: "Inactive 90 Days (892 contacts)" },
]

export function CampaignWizard({ onSave }: CampaignWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1: Details
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [objective, setObjective] = useState("promotional")

  // Step 2: Audience
  const [selectedSegment, setSelectedSegment] = useState("1")
  const [exclusionSegment, setExclusionSegment] = useState("")

  // Step 3: Composer
  const [content, setContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | "document" | null>(null)
  const [buttons, setButtons] = useState<ButtonConfig[]>([])

  // Step 4: Scheduling
  const [sendType, setSendType] = useState<"now" | "scheduled">("now")
  const [scheduledTime, setScheduledTime] = useState<string | null>(null)
  const [timezone, setTimezone] = useState("UTC")

  const nextStep = () => {
    if (step < 5) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handlePublish = () => {
    const data = {
      id: 'local-' + Math.random().toString(36).slice(2),
      name,
      description,
      objective,
      business_id: 'demo',
      segment_id: selectedSegment,
      content,
      sample_recipients: [
        // small sample for local simulation
        { contact_id: 'c1', phone: '+15550001111' },
        { contact_id: 'c2', phone: '+15550002222' },
        { contact_id: 'c3', phone: '+15550003333' },
      ],
      mediaUrl,
      mediaType,
      buttons,
      sendType,
      scheduledTime,
      timezone,
    }
    onSave?.(data)
    router.push('/broadcasts')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Main Wizard Form */}
      <div className="space-y-6">
        {/* Steps Progress Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold border transition-colors",
                    step === s.id
                      ? "border-accent bg-accent/10 text-accent"
                      : step > s.id
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span
                  className={cn(
                    "hidden sm:inline-block ml-2 text-xs font-medium mr-4",
                    step === s.id ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-5 animate-in">
              <h3 className="text-base font-semibold">Campaign Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Campaign Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Summer VIP Broadcast" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Internal Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Briefly describe the purpose of this campaign"
                    className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Campaign Objective</label>
                  <Select value={objective} onChange={(e) => setObjective(e.target.value)} options={OBJECTIVES} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in">
              <h3 className="text-base font-semibold">Audience Selection</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Target Segment</label>
                  <Select
                    value={selectedSegment}
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    options={DEMO_SEGMENTS.map((s) => ({ label: s.name, value: s.id }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Exclusion Segment (Optional)</label>
                  <Select
                    value={exclusionSegment}
                    onChange={(e) => setExclusionSegment(e.target.value)}
                    options={[
                      { label: "None", value: "" },
                      ...DEMO_SEGMENTS.map((s) => ({ label: s.name, value: s.id })),
                    ]}
                  />
                </div>

                <div className="rounded-xl border border-border bg-secondary/20 p-4 flex gap-3">
                  <Users className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Estimated Audience Size</p>
                    <p className="text-2xl font-bold mt-1">342 contacts</p>
                    <p className="text-xs text-muted-foreground mt-1">Estimations are calculated from current segment matches. Highly active numbers will be verified prior to transmission.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in">
              <Composer
                content={content}
                onChange={setContent}
                mediaUrl={mediaUrl}
                onMediaUrlChange={setMediaUrl}
                mediaType={mediaType}
                onMediaTypeChange={setMediaType}
                buttons={buttons}
                onButtonsChange={setButtons}
              />
            </div>
          )}

          {step === 4 && (
            <div className="animate-in">
              <SchedulingForm
                onScheduleChange={(type, time, tz) => {
                  setSendType(type)
                  setScheduledTime(time)
                  setTimezone(tz)
                }}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5 animate-in">
              <h3 className="text-base font-semibold">Review & Confirm</h3>
              <div className="space-y-4 border border-border rounded-xl p-6 bg-secondary/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Campaign Name</span>
                    <p className="text-sm font-medium">{name || "Unnamed Campaign"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Objective</span>
                    <p className="text-sm font-medium capitalize">{objective}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Target Audience</span>
                    <p className="text-sm font-medium">VIP Customers (342 contacts)</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Schedule</span>
                    <p className="text-sm font-medium capitalize">{sendType === "now" ? "Immediate Send" : `Scheduled for ${scheduledTime}`}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">Message Content</span>
                  <p className="text-sm mt-1 bg-background/50 p-3 rounded-lg leading-relaxed border border-border/50 text-muted-foreground font-mono whitespace-pre-wrap">{content || "(No message content)"}</p>
                </div>

                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 flex gap-3">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-400">Ready for Broadcast</p>
                    <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                      All criteria checked. Audience counts resolved. Ready to add to dispatch queue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={prevStep} disabled={step === 1}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          {step === 5 ? (
            <Button size="sm" onClick={handlePublish} disabled={!name}>
              <Send className="h-4 w-4 mr-1" />
              Publish Campaign
            </Button>
          ) : (
            <Button size="sm" onClick={nextStep}>
              Next Step
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Right Column: Dynamic WhatsApp Preview */}
      <div className="hidden lg:block space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Live Preview</h4>
        <div className="flex justify-center">
          <WhatsAppPreview
            content={content}
            mediaUrl={mediaUrl}
            mediaType={mediaType}
            buttons={buttons}
          />
        </div>
      </div>
    </div>
  )
}
