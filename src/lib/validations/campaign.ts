import { z } from "zod"

export const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().nullable().optional(),
  type: z.enum(["promotional", "transactional", "engagement", "feedback", "announcement"]),
  message_template: z.string().min(1, "Message template is required"),
  scheduled_at: z.string().datetime().nullable().optional(),
  segment_id: z.string().uuid().nullable().optional(),
})

export type CampaignInput = z.infer<typeof campaignSchema>
