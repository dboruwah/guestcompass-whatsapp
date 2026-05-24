"use client"

import { useCallback } from "react"
import { useToastStore } from "@/providers/ToastProvider"

export function useToast() {
  const addToast = useToastStore((state) => state.addToast)

  const toast = useCallback(
    (message: string, variant: "success" | "error" | "warning" | "info" = "info", description?: string) => {
      addToast({ message, description, variant })
    },
    [addToast],
  )

  return { toast }
}
