"use client"

// Polyfill entry point for older browsers (Chrome 79+)
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import React from "react"
import "./globals.css"
// PDF text & annotation layer stilleri
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"
// Document viewer stilleri
import "../styles/document-viewer.css"
import { DataProvider } from "@/context/data-context"
import { BroosFooter } from "@/components/broos-footer"
import { AnnouncementPopup } from "@/components/announcement-popup"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from "next/navigation"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [isClient, setIsClient] = React.useState(false)
  const [loadingTimeout, setLoadingTimeout] = React.useState(false)

  // ChunkLoadError recovery ve loading timeout - sadece client-side
  React.useEffect(() => {
    // Loading timeout için 15 saniye bekle
    const timeoutId = setTimeout(() => {
      if (!isClient) {
        console.warn('Loading timeout detected after 15 seconds')
        setLoadingTimeout(true)
      }
    }, 15000)
    
    setIsClient(true)
    clearTimeout(timeoutId)
    
    if (typeof window !== "undefined") {
      const reloadOnChunkError = (err: any) => {
        const name = err?.reason?.name || err?.error?.name || err?.name || ""
        const msg = err?.reason?.message || err?.message || ""
        if (name.includes("ChunkLoadError") || msg.includes("ChunkLoadError") || 
            msg.includes("Loading chunk") || name.includes("Loading CSS chunk")) {
          console.log("ChunkLoadError detected, reloading page...")
          setTimeout(() => location.reload(), 1000)
        }
      }
      
      window.addEventListener("error", reloadOnChunkError)
      window.addEventListener("unhandledrejection", reloadOnChunkError)
      
      return () => {
        window.removeEventListener("error", reloadOnChunkError)
        window.removeEventListener("unhandledrejection", reloadOnChunkError)
      }
    }
  }, [])

  // Admin paneli yollarını kontrol et - sadece client-side render edildikten sonra
  const isAdminRoute = isClient ? pathname.startsWith("/admin") : false

  // Loading timeout fallback UI
  if (loadingTimeout && !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Platform yükleniyor...
          </h2>
          <p className="text-gray-600 mb-6">
            Yükleme normalden uzun sürüyor. Bu eski tarayıcı sürümlerinde olabilir.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sayfayı Yenile
            </button>
            <button
              onClick={() => {
                setLoadingTimeout(false)
                setIsClient(true)
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Yine de Devam Et
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DataProvider>
        <main className="flex-1">{children}</main>
        <BroosFooter />
        {isClient && !isAdminRoute && <AnnouncementPopup />}
        <Toaster />
      </DataProvider>
    </div>
  )
}
