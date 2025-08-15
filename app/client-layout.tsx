"use client"

import type React from "react"
import "./globals.css"
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
