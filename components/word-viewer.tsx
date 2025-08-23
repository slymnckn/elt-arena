"use client"
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  X
} from "lucide-react"
import { renderAsync } from 'docx-preview'

interface WordViewerProps {
  sourceUrl: string
  title: string
  onClose?: () => void
}

export function WordViewer({ sourceUrl, title, onClose }: WordViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [scale, setScale] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDocument = async () => {
      if (!containerRef.current) return

      try {
        setIsLoading(true)
        setError(false)

        // Dosyayı fetch et
        const response = await fetch(sourceUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const arrayBuffer = await response.arrayBuffer()

        // Önceki içeriği temizle
        containerRef.current.innerHTML = ''

        // DOCX'i render et
        await renderAsync(new Uint8Array(arrayBuffer), containerRef.current, undefined, {
          className: 'docx-preview-content',
          inWrapper: false,
          ignoreLastRenderedPageBreak: false,
          renderHeaders: true,
          renderFootnotes: true,
          renderEndnotes: true,
          debug: false,
          experimental: true,
          trimXmlDeclaration: true,
          useBase64URL: false
        })

        setIsLoading(false)
        
        // Scroll davranışını iyileştir
        if (containerRef.current) {
          containerRef.current.style.scrollBehavior = 'smooth'
        }

      } catch (err) {
        console.error('Word document loading error:', err)
        setError(true)
        setIsLoading(false)
      }
    }

    loadDocument()
  }, [sourceUrl])

  // Zoom fonksiyonları
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5))
  const resetZoom = () => setScale(1)

  // Fullscreen fonksiyonları
  const enterFullscreen = () => {
    const element = containerRef.current?.parentElement
    if (element?.requestFullscreen) {
      element.requestFullscreen()
      setIsFullscreen(true)
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // ESC tuşu ile çıkış
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen()
        } else if (onClose) {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, onClose])

  // Fullscreen değişikliklerini dinle
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Word Dosyası Yüklenemedi</h3>
            <p className="text-gray-600 mb-6">
              Bu Word dosyası önizlenemiyor. Alternatif yöntemler:
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={() => window.open(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(sourceUrl)}`, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Office Online'da Aç
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open(sourceUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                İndir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Word Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        {/* Zoom kontrolleri */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm px-3 py-1 bg-white rounded min-w-[60px] text-center border">
            {Math.round(scale * 100)}%
          </span>
          <Button size="sm" variant="outline" onClick={zoomIn} disabled={scale >= 2.0}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={resetZoom}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Fullscreen toggle */}
        <Button 
          size="sm" 
          variant="outline" 
          onClick={isFullscreen ? exitFullscreen : enterFullscreen}
        >
          <Maximize className="h-4 w-4" />
          {isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
        </Button>
      </div>

      {/* Word Content */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-gray-600">Word dosyası yükleniyor...</p>
            </div>
          </div>
        )}

        <div className="p-6">
          <div 
            ref={containerRef}
            className="word-document-container bg-white shadow-lg rounded-lg p-8 mx-auto max-w-4xl"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              minHeight: '800px'
            }}
          />
        </div>
      </div>
    </div>
  )
}
