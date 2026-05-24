import type { Database as GeneratedDatabase } from "./supabase"

export type DbResult<T extends Promise<unknown>> = T extends Promise<infer R> ? R : never

export type DbResultOk<T extends Promise<unknown>> = T extends Promise<{ data: infer R; error: null }> ? R : never

export type Tables = GeneratedDatabase["public"]["Tables"]
export type TableRow<T extends keyof Tables> = Tables[T]["Row"]
export type TableInsert<T extends keyof Tables> = Tables[T]["Insert"]
export type TableUpdate<T extends keyof Tables> = Tables[T]["Update"]
