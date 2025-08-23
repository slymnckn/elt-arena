"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token")

      if (!token) {
        router.push("/admin/login")
        return
      }

      try {
        // JWT token formatını kontrol et (header.payload.signature)
        const parts = token.split('.')
        if (parts.length !== 3) {
          throw new Error('Geçersiz token formatı')
        }

        // Payload kısmını decode et
        const payload = JSON.parse(atob(parts[1]))

        // Token süresi kontrolü (exp saniye cinsinden, Date.now() ms cinsinden)
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("admin_token")
          router.push("/admin/login")
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error('Token validation error:', error)
        localStorage.removeItem("admin_token")
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-0">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
