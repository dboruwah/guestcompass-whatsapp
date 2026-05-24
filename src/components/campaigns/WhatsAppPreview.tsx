"use client"

import { cn } from "@/lib/utils/cn"
import { Check, CheckCheck, Phone, Video, MoreVertical, Paperclip, Send, Smile } from "lucide-react"

interface ButtonConfig {
  type: "url" | "call" | "reply"
  text: string
  url?: string
  phone?: string
}

interface WhatsAppPreviewProps {
  content: string
  mediaUrl?: string | null
  mediaType?: "image" | "video" | "document" | null
  buttons?: ButtonConfig[]
  businessName?: string
  avatarUrl?: string | null
  variables?: Record<string, string>
}

function parseFormatting(text: string): string {
  // Replace *text* with bold, _text_ with italics, ~text~ with strikethrough, ```text``` with monospace
  return text
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/~([^~]+)~/g, "<del>$1</del>")
    .replace(/```([^`]+)```/g, "<code class='bg-black/10 px-1 rounded font-mono'>$1</code>")
}

function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text
  Object.entries(variables).forEach(([key, val]) => {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), val || `[${key}]`)
  })
  return result
}

export function WhatsAppPreview({
  content,
  mediaUrl,
  mediaType = "image",
  buttons = [],
  businessName = "GuestCompass Support",
  avatarUrl,
  variables = { first_name: "Sarah", last_name: "Mitchell", code: "GUEST50" },
}: WhatsAppPreviewProps) {
  const processedContent = parseFormatting(replaceVariables(content || "Hello {{first_name}}! Welcome to our broadcast.", variables))
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="w-[320px] rounded-3xl border-8 border-neutral-800 bg-[#efeae2] shadow-2xl overflow-hidden aspect-[9/16] flex flex-col font-sans text-neutral-800 select-none">
      {/* Header */}
      <div className="bg-[#075e54] text-white p-3 flex items-center gap-2 shrink-0">
        <div className="h-8 w-8 rounded-full bg-neutral-200 shrink-0 flex items-center justify-center font-bold text-[#075e54]">
          {avatarUrl ? <img src={avatarUrl} alt={businessName} className="h-full w-full rounded-full object-cover" /> : businessName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate leading-tight">{businessName}</p>
          <p className="text-[10px] text-white/80 leading-none">Online</p>
        </div>
        <div className="flex items-center gap-3 text-white/90">
          <Video className="h-4 w-4" />
          <Phone className="h-3.5 w-3.5" />
          <MoreVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col justify-end bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-contain">
        {/* Message Bubble */}
        <div className="max-w-[85%] bg-[#d9fdd3] rounded-lg shadow-sm p-2 flex flex-col relative self-start animate-in">
          {mediaUrl && (
            <div className="mb-1.5 rounded bg-black/5 overflow-hidden border border-black/5">
              {mediaType === "image" && <img src={mediaUrl} alt="Campaign Media" className="w-full object-cover aspect-video" />}
              {mediaType === "video" && (
                <div className="relative aspect-video bg-black flex items-center justify-center">
                  <span className="text-xs text-white">Video Attachment</span>
                </div>
              )}
              {mediaType === "document" && (
                <div className="p-3 flex items-center gap-2">
                  <span className="text-xs font-medium">📄 PDF Document</span>
                </div>
              )}
            </div>
          )}

          <div
            className="text-xs leading-normal break-words"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          <div className="flex items-center justify-end gap-1 text-[9px] text-neutral-500 mt-1 self-end leading-none">
            <span>{time}</span>
            <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
          </div>
        </div>

        {/* Buttons (Interactive CTA/Quick Reply) */}
        {buttons.length > 0 && (
          <div className="space-y-1.5 max-w-[85%] self-start w-full">
            {buttons.map((btn, i) => (
              <div
                key={i}
                className="w-full bg-white rounded-lg py-2.5 px-4 shadow-sm text-xs font-semibold text-[#00a884] text-center flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-50 transition-colors animate-in"
              >
                {btn.type === "url" && <span>🔗</span>}
                {btn.type === "call" && <span>📞</span>}
                <span>{btn.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Bar (Static) */}
      <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-neutral-200 shrink-0">
        <Smile className="h-5 w-5 text-neutral-500 shrink-0" />
        <Paperclip className="h-5 w-5 text-neutral-500 shrink-0" />
        <div className="flex-1 bg-white rounded-full py-1.5 px-3 text-xs text-neutral-400">
          Message
        </div>
        <Send className="h-5 w-5 text-neutral-500 shrink-0" />
      </div>
    </div>
  )
}
