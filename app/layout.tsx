import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ELT Arena",
  description: "İngilizce Öğretmenlerinin Buluşma Noktası - Kapsamlı eğitim materyalleri ve kaynakları",
}

import ClientLayout from "./client-layout"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="relative z-0" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}


import './globals.css'