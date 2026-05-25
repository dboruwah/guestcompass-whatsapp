import { createAdminClient } from "@/lib/supabase/admin"
import { WhatsAppAPI } from "@/services/whatsapp/api"

interface ChatbotMessage {
  from: string
  text?: string
  type: string
}

export async function processChatbotMessage(msg: ChatbotMessage) {
  const supabase = createAdminClient()

  const phone = msg.from?.replace(/[^0-9]/g, "") || ""
  if (!phone) return

  const { data: contact } = await (supabase as any)
    .from("contacts")
    .select("id, business_id")
    .eq("phone", phone)
    .maybeSingle()

  if (!contact?.business_id) return

  const { data: chatbots } = await (supabase as any)
    .from("chatbots")
    .select("id, welcome_message, fallback_message")
    .eq("business_id", contact.business_id)
    .eq("status", "active")
    .limit(1)

  const chatbot = chatbots?.[0]
  if (!chatbot) return

  const { data: rules } = await (supabase as any)
    .from("chatbot_rules")
    .select("*")
    .eq("chatbot_id", chatbot.id)
    .eq("is_active", true)
    .order("position", { ascending: true })

  if (!rules || rules.length === 0) return

  const body = msg.text?.trim() || ""

  let matchedRule: any = null
  for (const rule of rules) {
    if (rule.trigger_type === "welcome") continue
    if (rule.trigger_type === "fallback") {
      matchedRule = rule
      continue
    }

    if (!rule.trigger_value) continue
    const value = rule.trigger_value

    switch (rule.trigger_type) {
      case "keyword":
        if (body.toLowerCase().includes(value.toLowerCase())) matchedRule = rule
        break
      case "exact_match":
        if (body.toLowerCase() === value.toLowerCase()) matchedRule = rule
        break
      case "regex":
        try {
          if (new RegExp(value, "i").test(body)) matchedRule = rule
        } catch {}
        break
    }

    if (matchedRule) break
  }

  if (matchedRule?.trigger_type === "fallback" && !body) return

  const config = matchedRule?.response_config as Record<string, string> | null
  const text = config?.text || chatbot.fallback_message

  if (text) {
    const to = phone.includes("+") ? phone : `+91${phone}`
    try {
      await WhatsAppAPI.sendMessage(to, text)
    } catch (e) {
      console.error("chatbot send failed", e)
    }
  }
}
