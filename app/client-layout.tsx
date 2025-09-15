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
import { RouteLoadingMonitor } from "@/components/route-loading-monitor"
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
    let loadingTimeoutId: NodeJS.Timeout
    let browserUtilsLoaded = false
    
    // Loading timeout için 12 saniye bekle (akıllı tahtalar için kısa süre)
    loadingTimeoutId = setTimeout(() => {
      if (!isClient) {
        console.warn('Loading timeout detected after 12 seconds')
        setLoadingTimeout(true)
      }
    }, 12000)
    
    // Client side olarak işaretle
    setIsClient(true)
    clearTimeout(loadingTimeoutId)
    
    if (typeof window !== "undefined") {
      // Browser utils'i güvenli şekilde yükle
      try {
        // Static import kullan
        import('@/lib/browser-utils').then(({ initBrowserCompatibility }) => {
          initBrowserCompatibility()
          browserUtilsLoaded = true
        }).catch((err) => {
          console.warn('Browser utils yüklenemedi:', err)
          browserUtilsLoaded = true // Devam et
        })
      } catch (err) {
        console.warn('Browser utils import hatası:', err)
        browserUtilsLoaded = true
      }
      
      // Gelişmiş hata yakalama
      const reloadOnChunkError = (err: any) => {
        const name = err?.reason?.name || err?.error?.name || err?.name || ""
        const msg = err?.reason?.message || err?.message || ""
        
        // ChunkLoadError ve benzeri hataları yakala
        if (
          name.includes("ChunkLoadError") || 
          msg.includes("ChunkLoadError") || 
          msg.includes("Loading chunk") || 
          msg.includes("Loading CSS chunk") ||
          name.includes("TypeError") && msg.includes("Cannot read properties") ||
          msg.includes("call")
        ) {
          console.log("Chunk/Script loading error detected, reloading page...")
          setTimeout(() => {
            try {
              window.location.reload()
            } catch (reloadErr) {
              // Eğer reload çalışmazsa
              window.location.href = window.location.href
            }
          }, 1500)
        }
      }
      
      // Hata dinleyicilerini ekle
      window.addEventListener("error", reloadOnChunkError)
      window.addEventListener("unhandledrejection", reloadOnChunkError)
      
      // Page visibility change kontrolü (akıllı tahta için)
      const handleVisibilityChange = () => {
        if (!document.hidden && document.readyState !== 'complete') {
          console.log('Sayfa geri odaklandı ama yükleme tamamlanmamış')
          setTimeout(() => {
            if (document.readyState !== 'complete') {
              setLoadingTimeout(true)
            }
          }, 3000)
        }
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      return () => {
        clearTimeout(loadingTimeoutId)
        window.removeEventListener("error", reloadOnChunkError)
        window.removeEventListener("unhandledrejection", reloadOnChunkError)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [])

  // Admin paneli yollarını kontrol et - sadece client-side render edildikten sonra
  const isAdminRoute = isClient ? pathname.startsWith("/admin") : false

  // Loading timeout fallback UI
  if (loadingTimeout && !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="mb-6">
            <div className="animate-pulse rounded-full h-16 w-16 bg-gray-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Platform Yükleniyor...
          </h2>
          <p className="text-gray-600 mb-4">
            Yükleme süresi beklenenin üzerinde. Bu durum özellikle akıllı tahtalar ve eski tarayıcılarda yaşanabilir.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Akıllı Tahta Kullanıcıları:</strong><br/>
              Chrome 79+ gibi eski tarayıcılar yavaş yüklenebilir. 
              Lütfen bekleyin veya sayfayı yenileyin.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                try {
                  window.location.reload()
                } catch (err) {
                  window.location.href = window.location.href
                }
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              🔄 Sayfayı Yenile
            </button>
            <button
              onClick={() => {
                setLoadingTimeout(false)
                setIsClient(true)
              }}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
            >
              ⚡ Yine de Devam Et
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors"
            >
              🏠 Ana Sayfaya Dön
            </button>
          </div>
          <div className="mt-6 text-xs text-gray-500">
            Tarayıcı: {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').pop() : 'Bilinmiyor'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DataProvider>
        <RouteLoadingMonitor timeout={pathname === '/dashboard' ? 8000 : 5000}>
          <main className="flex-1">{children}</main>
          <BroosFooter />
          {isClient && !isAdminRoute && <AnnouncementPopup />}
          <Toaster />
        </RouteLoadingMonitor>
      </DataProvider>
    </div>
  )
}
