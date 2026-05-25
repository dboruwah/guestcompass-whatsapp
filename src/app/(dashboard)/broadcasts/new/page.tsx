"use client"

import { PageHeader } from "@/components/layout/PageHeader"
import { CampaignWizard } from "@/components/campaigns/CampaignWizard"
import { Button } from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCampaignPage() {
  const handleSaveCampaign = (data: any) => {
    // Trigger server-side dispatch endpoint to ensure jobs are enqueued server-side
    fetch(`/api/campaigns/${data.id}/dispatch`, { method: 'POST', headers: { 'Content-Type': 'application/json' } }).then(() => {
      console.log('Dispatch requested')
    }).catch((e) => console.error('dispatch error', e))
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Create Broadcast Campaign"
        description="Launch a bulk marketing or notification broadcast"
        actions={
          <Link href="/broadcasts">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to broadcasts
            </Button>
          </Link>
        }
      />

      <CampaignWizard onSave={handleSaveCampaign} />
    </div>
  )
}
