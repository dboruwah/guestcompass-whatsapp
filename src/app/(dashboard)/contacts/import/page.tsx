"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Upload, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function ImportContactsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    const res = await fetch("/api/contacts/import?format=csv")
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contacts.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setResult(null)
    setError(null)

    try {
      const text = await file.text()
      const lines = text.split("\n").filter(Boolean)
      const headers = lines[0].split(",")
      const contacts = lines.slice(1).map((line) => {
        const vals = line.split(",")
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || "").trim() })
        return obj
      })

      const res = await fetch("/api/contacts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(String(err))
    }
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Import Contacts"
        description="Upload a CSV file or download a template"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload CSV</h3>
        <p className="text-sm text-muted-foreground mb-6">Columns: Phone, Name, Email, Tags, Status</p>
        <Button onClick={() => fileInputRef.current?.click()} loading={importing} disabled={importing}>
          {importing ? "Importing..." : "Select CSV File"}
        </Button>
      </div>

      {importing && (
        <div className="flex items-center justify-center gap-3 p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Importing contacts...
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="font-semibold">Import complete</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {result.imported} imported, {result.skipped} skipped
          </p>
          {result.errors.length > 0 && (
            <p className="text-sm text-red-400 mt-2">{result.errors.length} errors</p>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="font-semibold">Import failed</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      )}
    </div>
  )
}
