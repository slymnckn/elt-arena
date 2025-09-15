"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface RouteLoadingMonitorProps {
  children: React.ReactNode
  timeout?: number // milliseconds
}

export function RouteLoadingMonitor({ children, timeout = 10000 }: RouteLoadingMonitorProps) {
  const [isTimeout, setIsTimeout] = useState(false)
  const [isContentReady, setIsContentReady] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Reset states on route change
    setIsTimeout(false)
    setIsContentReady(false)

    const timeoutId = setTimeout(() => {
      if (!isContentReady) {
        console.warn(`Route loading timeout for ${pathname}`)
        setIsTimeout(true)
      }
    }, timeout)

    // Check if content is ready by looking for dashboard content
    const checkContentReady = () => {
      if (pathname === '/dashboard') {
        // Look for dashboard specific elements
        const dashboardElements = document.querySelectorAll('[data-dashboard-ready]')
        if (dashboardElements.length > 0) {
          setIsContentReady(true)
          clearTimeout(timeoutId)
        }
      } else {
        // For other routes, assume ready after initial render
        const timer = setTimeout(() => {
          setIsContentReady(true)
          clearTimeout(timeoutId)
        }, 1000)
        
        return () => clearTimeout(timer)
      }
    }

    // Monitor content readiness
    const observer = new MutationObserver(checkContentReady)
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['data-dashboard-ready']
    })

    // Initial check
    checkContentReady()

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [pathname, timeout, isContentReady])

  if (isTimeout && !isContentReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="mb-6">
            <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Sayfa Yüklenme Sorunu
          </h2>
          <p className="text-gray-600 mb-4">
            <strong>{pathname}</strong> sayfası yüklenirken sorun yaşandı.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              Bu durum özellikle akıllı tahtalar ve eski tarayıcılarda yaşanabilir.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium transition-colors"
            >
              🔄 Sayfayı Yenile
            </button>
            <button
              onClick={() => {
                setIsTimeout(false)
                setIsContentReady(true)
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              ⚡ Devam Etmeye Çalış
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors"
            >
              🏠 Ana Sayfaya Dön
            </button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Timeout: {timeout}ms | Route: {pathname}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}