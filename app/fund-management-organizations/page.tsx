import FundManagementOrganizationsList from "@/components/fund-management-organizations-list"
import { Suspense } from "react"

export default function FundManagementOrganizationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Fund Management Organizations</h1>
      <Suspense fallback={<p>Loading organizations list...</p>}>
        <FundManagementOrganizationsList />
      </Suspense>
    </div>
  )
}
