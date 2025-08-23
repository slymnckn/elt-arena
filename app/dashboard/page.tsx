"use client"

import { EducationDashboard } from "@/components/education-dashboard"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function DashboardContent() {
  const searchParams = useSearchParams()
  const gradeParam = searchParams.get('grade')
  
  console.log('📊 DashboardContent:', {
    searchParams: Object.fromEntries(searchParams.entries()),
    gradeParam
  })

  return (
    <div className="bg-slate-50">
      <EducationDashboard initialGrade={gradeParam} />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-slate-600">Platform yükleniyor...</p>
      </div>
    </div>}>
      <DashboardContent />
    </Suspense>
  )
}
