"use client"

import { useState } from "react"
import { Select } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Clock, Globe, Shield, Zap } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface SchedulingFormProps {
  onScheduleChange: (type: "now" | "scheduled", time: string | null, timezone: string) => void
}

const TIMEZONES = [
  { label: "Coordinated Universal Time (UTC)", value: "UTC" },
  { label: "Eastern Standard Time (EST / New York)", value: "America/New_York" },
  { label: "Pacific Standard Time (PST / Los Angeles)", value: "America/Los_Pacific" },
  { label: "Central European Time (CET / Paris)", value: "Europe/Paris" },
  { label: "India Standard Time (IST / Mumbai)", value: "Asia/Kolkata" },
  { label: "Singapore Standard Time (SGT)", value: "Asia/Singapore" },
]

export function SchedulingForm({ onScheduleChange }: SchedulingFormProps) {
  const [sendType, setSendType] = useState<"now" | "scheduled">("now")
  const [scheduledTime, setScheduledTime] = useState("")
  const [timezone, setTimezone] = useState("UTC")
  const [smartThrottling, setSmartThrottling] = useState(true)
  const [quietHours, setQuietHours] = useState(true)

  const handleSendTypeChange = (type: "now" | "scheduled") => {
    setSendType(type)
    onScheduleChange(type, type === "now" ? null : scheduledTime, timezone)
  }

  const handleTimeChange = (time: string) => {
    setScheduledTime(time)
    onScheduleChange(sendType, time, timezone)
  }

  const handleTimezoneChange = (tz: string) => {
    setTimezone(tz)
    onScheduleChange(sendType, sendType === "now" ? null : scheduledTime, tz)
  }

  return (
    <div className="space-y-6">
      {/* Schedule Options */}
      <div>
        <label className="text-sm font-medium mb-3 block">Schedule Strategy</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSendTypeChange("now")}
            className={cn(
              "p-4 rounded-xl border text-left flex flex-col gap-2 transition-all",
              sendType === "now"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
            )}
          >
            <Zap className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">Send Immediately</p>
              <p className="text-xs opacity-85 mt-0.5">Deliver campaign to target queue right now</p>
            </div>
          </button>

          <button
            onClick={() => handleSendTypeChange("scheduled")}
            className={cn(
              "p-4 rounded-xl border text-left flex flex-col gap-2 transition-all",
              sendType === "scheduled"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
            )}
          >
            <Clock className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">Schedule Broadcast</p>
              <p className="text-xs opacity-85 mt-0.5">Send at a specific future date and time</p>
            </div>
          </button>
        </div>
      </div>

      {sendType === "scheduled" && (
        <div className="grid gap-4 sm:grid-cols-2 animate-in">
          <div className="space-y-2">
            <label className="text-sm font-medium">Delivery Time</label>
            <Input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Timezone</label>
            <Select
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              options={TIMEZONES}
            />
          </div>
        </div>
      )}

      {/* Advanced Optimization Options */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="text-sm font-semibold">Delivery Optimization</h4>

        <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-secondary/30">
          <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Smart Throttling (Recommended)</p>
              <button
                onClick={() => setSmartThrottling(!smartThrottling)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
                  smartThrottling ? "bg-accent" : "bg-neutral-700",
                )}
              >
                <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-0.5 ml-0.5", smartThrottling ? "translate-x-4" : "translate-x-0")} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Throttles output rate to prevent spam detection by Meta. Adjusts dynamically based on recipient counts to maintain optimal platform health.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-secondary/30">
          <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Quiet Hours Protection</p>
              <button
                onClick={() => setQuietHours(!quietHours)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
                  quietHours ? "bg-accent" : "bg-neutral-700",
                )}
              >
                <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-0.5 ml-0.5", quietHours ? "translate-x-4" : "translate-x-0")} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Ensures campaigns are not sent during nocturnal hours (10 PM to 8 AM local recipient time). Messages in those brackets are queued for morning delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
