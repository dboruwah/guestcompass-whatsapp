import { createAdminClient } from '@/lib/supabase/admin'

const SUPABASE: any = createAdminClient()

export const TemplateService = {
  async createTemplate(businessId: string, name: string, content: any, language = 'en_US') {
    const { data, error } = await SUPABASE.from('template_library').insert({ business_id: businessId, name, content, language })
    if (error) throw error
    return data
  },

  async listTemplates(businessId: string) {
    const { data, error } = await SUPABASE.from('template_library').select('*').eq('business_id', businessId)
    if (error) throw error
    return data
  },
}
