"use client"

import { EducationDashboard } from "@/components/education-dashboard"
import { useSearchParams } from "next/navigation"
import { Suspense, Component, ReactNode } from "react"

// Dashboard-specific error boundary
class DashboardErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error; retryCount: number }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Dashboard Error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState(prev => ({ 
      hasError: false, 
      error: undefined,
      retryCount: prev.retryCount + 1 
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Dashboard Yükleme Hatası
            </h2>
            <p className="text-gray-600 mb-6">
              Platform yüklenirken bir sorun oluştu. Bu durum eski tarayıcılarda (Chrome 79) yaşanabilir.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                🔄 Tekrar Dene ({3 - this.state.retryCount} deneme kaldı)
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                ⚡ Sayfayı Yenile
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                🏠 Ana Sayfaya Dön
              </button>
            </div>
            {this.state.error && (
              <details className="mt-4 text-left text-xs">
                <summary className="cursor-pointer text-gray-500">Teknik Detaylar</summary>
                <pre className="mt-2 text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const gradeParam = searchParams.get('grade')
  
  console.log('📊 DashboardContent:', {
    searchParams: Object.fromEntries(searchParams.entries()),
    gradeParam
  })

  return (
    <DashboardErrorBoundary>
      <div className="bg-slate-50">
        <EducationDashboard initialGrade={gradeParam} />
      </div>
    </DashboardErrorBoundary>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Platform yükleniyor...</h3>
          <p className="text-sm text-slate-600 mb-4">
            Materyaller hazırlanıyor. Bu işlem birkaç saniye sürebilir.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 <strong>İpucu:</strong> Akıllı tahtalar için optimize edilmiştir.
            </p>
          </div>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
