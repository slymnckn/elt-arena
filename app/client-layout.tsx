"use client"

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
import { usePathname } from "next/navigation" // usePathname import edildi

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname() // Mevcut yolu al

  // ChunkLoadError recovery - sadece client-side
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const reloadOnChunkError = (err: any) => {
        const name = err?.reason?.name || err?.error?.name || err?.name || ""
        const msg = err?.reason?.message || err?.message || ""
        if (name.includes("ChunkLoadError") || msg.includes("ChunkLoadError")) {
          console.log("ChunkLoadError detected, reloading page...")
          location.reload()
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

  // Admin paneli yollarını kontrol et
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <div className="min-h-screen flex flex-col">
      <DataProvider>
        <main className="flex-1">{children}</main>
        <BroosFooter />
        {!isAdminRoute && <AnnouncementPopup />}
        <Toaster />
      </DataProvider>
    </div>
  )
}
