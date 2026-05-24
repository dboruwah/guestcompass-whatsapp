import { create } from 'zustand'
import type { QueueJob } from '@/services/messaging/types'

type QueueState = {
  pending: QueueJob[]
  setPending: (p: QueueJob[]) => void
}

export const useQueueStore = create<QueueState>((set) => ({
  pending: [],
  setPending: (p) => set({ pending: p }),
}))
