"use client"

import { useState } from "react"
import { Modal, Button, Badge } from "@/components/ui"
import { Upload, Download, FileText, AlertTriangle, CheckCircle, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onImport?: (file: File) => void
}

export function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const [step, setStep] = useState<"upload" | "mapping" | "review">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.name.endsWith(".csv")) {
      setFile(dropped)
      setStep("mapping")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setStep("mapping")
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Import Contacts" description="Upload a CSV file to add contacts" size="lg">
      {step === "upload" && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center transition-colors",
            dragging ? "border-accent bg-accent/5" : "border-border",
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium mb-1">Drop your CSV file here</p>
          <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
          <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="inline-flex">
            <Button variant="outline" size="sm">Browse files</Button>
          </label>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> CSV format</span>
            <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Max 10,000 rows</span>
          </div>
        </div>
      )}

      {step === "mapping" && file && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <FileText className="h-5 w-5 text-accent" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { setFile(null); setStep("upload") }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Column Mapping</h4>
            <p className="text-xs text-muted-foreground">Map your CSV columns to contact fields</p>
            {[
              { csv: "First Name", field: "first_name", required: true },
              { csv: "Last Name", field: "last_name", required: true },
              { csv: "Phone", field: "phone", required: true },
              { csv: "Email", field: "email", required: false },
              { csv: "Tags", field: "tags", required: false },
            ].map((mapping) => (
              <div key={mapping.field} className="flex items-center gap-3">
                <span className="text-sm w-24">{mapping.csv}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-accent">{mapping.field}</span>
                {mapping.required && <Badge variant="red" size="sm">Required</Badge>}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-400">Duplicate detection will run during import. Existing contacts will be skipped by default.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        {step === "mapping" && (
          <Button onClick={() => setStep("review")}>Review & Import</Button>
        )}
      </div>
    </Modal>
  )
}

interface ExportModalProps {
  open: boolean
  onClose: () => void
  selectedCount?: number
  onExport?: (format: "csv" | "xlsx") => void
}

export function ExportModal({ open, onClose, selectedCount = 0, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<"csv" | "xlsx">("csv")
  const [scope, setScope] = useState<"selected" | "all" | "filtered">("selected")

  return (
    <Modal open={open} onClose={onClose} title="Export Contacts" description="Download your contact data" size="sm">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Export Scope</label>
          <div className="space-y-2">
            {[
              { value: "selected" as const, label: `Selected contacts (${selectedCount})`, disabled: selectedCount === 0 },
              { value: "filtered" as const, label: "Filtered contacts" },
              { value: "all" as const, label: "All contacts" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => !option.disabled && setScope(option.value)}
                disabled={option.disabled}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border text-sm text-left transition-colors",
                  scope === option.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/50",
                  option.disabled && "opacity-40 pointer-events-none",
                )}
              >
                <div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center", scope === option.value ? "border-accent" : "border-border")}>
                  {scope === option.value && <div className="h-2 w-2 rounded-full bg-accent" />}
                </div>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Format</label>
          <div className="flex gap-2">
            {(["csv", "xlsx"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={cn(
                  "flex-1 py-2.5 rounded-lg border text-sm font-medium uppercase transition-colors",
                  format === fmt ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground",
                )}
              >
                .{fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onExport?.(format)}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </Modal>
  )
}
