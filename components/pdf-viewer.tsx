"use client"
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink, Download, AlertCircle } from "lucide-react"
import { resolveFileUrl } from "@/lib/utils"
import type { Resource } from "@/lib/data"
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// PDF.js worker setup
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface PdfViewerProps {
  sourceUrl: string
  resource: Resource
}

export default function PdfViewer({ sourceUrl, resource }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pdfScale, setPdfScale] = useState(1.0)
  const [pdfError, setPdfError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
    setPdfError(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error)
    setPdfError(true)
    setIsLoading(false)
  }

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1))
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1))

  const zoomIn = () => setPdfScale(prev => Math.min(prev + 0.2, 3.0))
  const zoomOut = () => setPdfScale(prev => Math.max(prev - 0.2, 0.5))

  if (pdfError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">PDF Yüklenemedi</h3>
          <p className="text-gray-600 mb-4">
            Bu PDF dosyası önizlenemiyor. Dosyayı görüntülemek için aşağıdaki seçenekleri kullanabilirsiniz.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button 
              onClick={() => window.open(sourceUrl, '_blank')} 
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Yeni Sekmede Aç
            </Button>
            {(resource.downloadLink || resource.fileUrl) && (
              <Button 
                variant="outline"
                onClick={() => {
                  const url = resource.downloadLink || resource.fileUrl
                  if (url) {
                    const relativePath = url.split('/uploads/')[1]
                    const downloadUrl = relativePath ? `/api/storage/download?file=${encodeURIComponent(relativePath)}` : resolveFileUrl(url)
                    window.open(downloadUrl, '_blank')
                  }
                }}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                İndir
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">PDF yükleniyor...</p>
          </div>
        </div>
      )}

      {/* PDF Toolbar */}
      <div className="flex-shrink-0 bg-gray-800 text-white p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="text-white hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2">
            {pageNumber} / {numPages || '--'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="text-white hover:bg-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            className="text-white hover:bg-gray-700 px-2"
          >
            -
          </Button>
          <span className="text-sm px-2">
            {Math.round(pdfScale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            className="text-white hover:bg-gray-700 px-2"
          >
            +
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4 pdf-container" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex justify-center min-h-full">
          <Document
            file={sourceUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="shadow-lg"
          >
            <Page 
              pageNumber={pageNumber} 
              scale={pdfScale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="border border-gray-300 bg-white mb-4"
            />
          </Document>
        </div>
      </div>
    </div>
  )
}
