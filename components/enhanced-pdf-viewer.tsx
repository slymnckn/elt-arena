"use client"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  X,
  ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react"

interface EnhancedPdfViewerProps {
  sourceUrl: string
  title: string
  onClose?: () => void
}

export function EnhancedPdfViewer({ sourceUrl, title, onClose }: EnhancedPdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [searchText, setSearchText] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pdfComponent, setPdfComponent] = useState<any>(null)

  // PDF.js kütüphanesini yükle (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-pdf').then((module) => {
        // Local worker dosyasını kullan
        module.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
        setPdfComponent(module)
      }).catch((err) => {
        console.error('PDF kütüphanesi yüklenemedi:', err)
        setError(true)
        setIsLoading(false)
      })
    }
  }, [])

  // PDF yükleme başarılı
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
    setError(false)
  }

  // PDF yükleme hatası
  const onDocumentLoadError = (error: Error) => {
    console.error('PDF yükleme hatası:', error)
    setError(true)
    setIsLoading(false)
  }

  // Sayfa kontrolları
  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1))
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1))
  const goToPage = (page: number) => {
    if (page >= 1 && page <= (numPages || 1)) {
      setPageNumber(page)
    }
  }

  // Zoom kontrolları
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))
  const resetZoom = () => setScale(1.2)

  // Tam ekran kontrolları
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Tam ekran moduna geçilemedi:', err)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Tam ekran modundan çıkılamadı:', err)
      })
      setIsFullscreen(false)
    }
  }

  // Tam ekran durumu değişikliklerini dinle
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // ESC tuşu ile çıkış
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
      // Klavye kısayolları
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault()
            zoomIn()
            break
          case '-':
            e.preventDefault()
            zoomOut()
            break
          case '0':
            e.preventDefault()
            resetZoom()
            break
        }
      }
      // Ok tuşları ile sayfa gezinme
      if (e.key === 'ArrowLeft') goToPrevPage()
      if (e.key === 'ArrowRight') goToNextPage()
      // F11 tuşu ile tam ekran
      if (e.key === 'F11') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, numPages, isFullscreen])

  // Hata durumu
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">PDF Yüklenemedi</h3>
            <p className="text-gray-600 mb-6">
              Bu PDF dosyası önizlenemiyor. Alternatif yöntemler:
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={() => window.open(sourceUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Yeni Sekmede Aç
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = sourceUrl
                  link.download = title
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
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

  // PDF kütüphanesi henüz yüklenmediyse
  if (!pdfComponent) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-sm text-gray-600">PDF kütüphanesi yükleniyor... 🚀</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { Document, Page } = pdfComponent

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* PDF Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 border-b">
        {/* Sayfa kontrolları */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const container = document.querySelector('.flex-1.overflow-auto.bg-gray-100');
              container?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={!numPages}
          >
            <ChevronLeft className="h-4 w-4" />
            İlk Sayfa
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {numPages || '--'} sayfa
            </span>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const container = document.querySelector('.flex-1.overflow-auto.bg-gray-100');
              container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            }}
            disabled={!numPages}
          >
            Son Sayfa
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom kontrolları */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm px-3 py-1 bg-white rounded min-w-[60px] text-center border">
            {Math.round(scale * 100)}%
          </span>
          <Button size="sm" variant="outline" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={resetZoom}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Tam ekrandan çık (F11)" : "Tam ekran (F11)"}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        {/* Arama */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="PDF'de ara..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 w-48 bg-white"
            />
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="relative bg-white flex-1">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-gray-600">PDF yükleniyor...</p>
            </div>
          </div>
        )}

        <div 
          className="flex-1 overflow-auto bg-gray-100 p-4" 
          style={{ 
            scrollBehavior: 'smooth',
            height: 'calc(100vh - 200px)',
            minHeight: '400px'
          }}
        >
          <div className="flex justify-center">
            <div className="space-y-4">
              <Document
                file={sourceUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>PDF yükleniyor...</p>
                  </div>
                }
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page 
                    key={`page_${index + 1}`}
                    pageNumber={index + 1} 
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="border border-gray-300 bg-white mb-4 shadow-lg block"
                  />
                ))}
              </Document>
            </div>
          </div>
        </div>
      </div>

      {/* Klavye kısayolları bilgisi */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
        <span>Kısayollar: </span>
        <span className="mr-4">← → Sayfa geçişi</span>
        <span className="mr-4">Ctrl/Cmd + +/- Zoom</span>
        <span className="mr-4">Ctrl/Cmd + 0 Zoom sıfırla</span>
        <span>F11 Tam ekran</span>
      </div>
    </div>
  )
}
