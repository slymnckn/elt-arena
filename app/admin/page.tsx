"use client"

import { AdminDashboardTabs } from "@/components/admin-dashboard-tabs"
import { AdminGuard } from "@/components/admin-guard"

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboardTabs />
    </AdminGuard>
  )
}
