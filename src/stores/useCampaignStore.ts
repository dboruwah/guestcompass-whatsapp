import { create } from 'zustand'
import type { Campaign } from '@/lib/types/models'

type CampaignState = {
  campaigns: Campaign[]
  setCampaigns: (c: Campaign[]) => void
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  setCampaigns: (c) => set({ campaigns: c }),
}))
