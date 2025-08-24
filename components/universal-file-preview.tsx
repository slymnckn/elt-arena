"use client"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  Eye,
  FileIcon,
  Image as ImageIcon,
  Video,
  Music,
  File,
  X,
  Maximize
} from "lucide-react"
import { WordViewer } from "./word-viewer"
import { EnhancedPdfViewer } from "./enhanced-pdf-viewer"
import type { Resource } from "@/lib/data"
import { resolveFileUrl } from "@/lib/utils"

interface UniversalFilePreviewProps {
  resource: Resource
  onClose?: () => void
}

type FileType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image' | 'video' | 'audio' | 'text' | 'unknown'

export function UniversalFilePreview({ resource, onClose }: UniversalFilePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'native' | 'embed' | 'download'>('native')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const rawUrl = resolveFileUrl(resource.previewLink || resource.link || resource.fileUrl || '')
  
  // Google Drive linklerini embed formatına çevirme
  const convertGoogleDriveUrl = (url: string): string => {
    if (url.includes('drive.google.com/file/d/')) {
      // Google Drive view linkini embed linkine çevir
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
      if (fileIdMatch) {
        const fileId = fileIdMatch[1]
        return `https://drive.google.com/file/d/${fileId}/preview`
      }
    }
    return url
  }

  // Google Docs, Sheets, Slides linklerini embed formatına çevirme
  const convertGoogleDocsUrl = (url: string): string => {
    if (url.includes('docs.google.com/document/d/')) {
      return url.replace('/edit', '/preview').replace('/view', '/preview')
    }
    if (url.includes('docs.google.com/spreadsheets/d/')) {
      return url.replace('/edit', '/preview').replace('/view', '/preview')
    }
    if (url.includes('docs.google.com/presentation/d/')) {
      return url.replace('/edit', '/preview').replace('/view', '/preview')
    }
    return url
  }

  // YouTube linklerini embed formatına çevirme
  const convertYouTubeUrl = (url: string): string => {
    if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
      let videoId = ''
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0]
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
    return url
  }

  // URL dönüştürme işlemleri
  const sourceUrl = convertYouTubeUrl(convertGoogleDocsUrl(convertGoogleDriveUrl(rawUrl)))

  // Dosya tipini belirleme - Google Drive ve diğer servisler için özel kontroller
  const getFileType = (url: string, originalUrl: string = ''): FileType => {
    // Google Drive dosyaları için özel kontrol
    if (url.includes('drive.google.com')) {
      return 'unknown'
    }
    
    // Google Docs servisleri
    if (url.includes('docs.google.com/document')) return 'word'
    if (url.includes('docs.google.com/spreadsheets')) return 'excel'
    if (url.includes('docs.google.com/presentation')) return 'powerpoint'
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video'
    
    // Diğer harici servisler
    if (url.includes('wordwall.net') || url.includes('kahoot.com') || url.includes('baamboozle.com') || 
        url.includes('quizizz.com') || url.includes('padlet.com') || url.includes('forms.google.com')) {
      return 'unknown' // Harici servisler için iframe kullanılacak
    }

    // Dosya uzantısını bulmak için original URL'yi de kontrol et
    const checkUrl = originalUrl || url
    const extension = checkUrl.split('.').pop()?.toLowerCase() || ''
    
    // URL parametrelerini temizle (?file=uploads/... gibi)
    let cleanUrl = checkUrl
    if (checkUrl.includes('?file=')) {
      cleanUrl = decodeURIComponent(checkUrl.split('?file=')[1] || '')
    }
    const cleanExtension = cleanUrl.split('.').pop()?.toLowerCase() || ''
    
    const finalExtension = cleanExtension || extension
    
    if (['pdf'].includes(finalExtension)) return 'pdf'
    if (['doc', 'docx'].includes(finalExtension)) return 'word'
    if (['xls', 'xlsx'].includes(finalExtension)) return 'excel'  
    if (['ppt', 'pptx'].includes(finalExtension)) return 'powerpoint'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(finalExtension)) return 'image'
    if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(finalExtension)) return 'video'
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(finalExtension)) return 'audio'
    if (['txt', 'md', 'json', 'xml', 'csv'].includes(finalExtension)) return 'text'
    
    return 'unknown'
  }

  const fileType = getFileType(sourceUrl, rawUrl)
  const fileName = rawUrl.split('/').pop() || 'Dosya'

  // Tam ekran işlevi
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

  // Dosya türü ikonu
  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />
      case 'word': return <FileText className="h-5 w-5 text-blue-600" />
      case 'excel': return <FileIcon className="h-5 w-5 text-green-600" />
      case 'powerpoint': return <FileIcon className="h-5 w-5 text-orange-600" />
      case 'image': return <ImageIcon className="h-5 w-5 text-purple-600" />
      case 'video': return <Video className="h-5 w-5 text-blue-500" />
      case 'audio': return <Music className="h-5 w-5 text-pink-600" />
      case 'text': return <File className="h-5 w-5 text-gray-600" />
      default: return <FileIcon className="h-5 w-5 text-gray-500" />
    }
  }

  // Resource türüne göre ikon
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'book-presentation': return <FileText className="h-5 w-5 text-blue-600" />
      case 'game': return <Video className="h-5 w-5 text-green-600" />
      case 'summary': return <File className="h-5 w-5 text-yellow-600" />
      case 'quiz': return <FileIcon className="h-5 w-5 text-purple-600" />
      case 'video': return <Video className="h-5 w-5 text-red-600" />
      case 'worksheet': return <FileText className="h-5 w-5 text-gray-600" />
      case 'flashcards': return <img src="/flashcard.png" alt="Flashcards" className="h-5 w-5" />
      case 'file': return <FileIcon className="h-5 w-5 text-gray-500" />
      default: return getFileIcon(fileType)
    }
  }

  // Dosya türü etiketi
  const getFileTypeLabel = (type: FileType) => {
    switch (type) {
      case 'pdf': return 'PDF'
      case 'word': return 'Word'
      case 'excel': return 'Excel'
      case 'powerpoint': return 'PowerPoint'
      case 'image': return 'Resim'
      case 'video': return 'Video'
      case 'audio': return 'Ses'
      case 'text': return 'Metin'
      default: return 'Bilinmeyen'
    }
  }

  // Resource türüne göre etiket
  const getResourceTypeLabel = (resourceType: string) => {
    switch (resourceType) {
      case 'book-presentation': return 'Sunum'
      case 'game': return 'Oyun'
      case 'summary': return 'Özet'
      case 'quiz': return 'Sınav'
      case 'video': return 'Video'
      case 'worksheet': return 'Çalışma Kağıdı'
      case 'flashcards': return 'Flashcards & Speaking Cards'
      case 'file': return 'Dosya'
      default: return getFileTypeLabel(fileType)
    }
  }

  // Office dosyaları için Microsoft Online embed URL'i
  const getOfficeEmbedUrl = (url: string) => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
  }

  // Google Docs Viewer URL'i
  const getGoogleViewerUrl = (url: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  }

  // Native önizleme renderı
  const renderNativePreview = () => {
    console.log('🔍 Debug Info - sourceUrl:', sourceUrl, 'fileType:', fileType, 'resource.type:', resource.type)
    
    // Google Drive için özel durum - embed formatını koru
    if (sourceUrl.includes('drive.google.com')) {
      return (
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <iframe
              src={sourceUrl}
              className="w-full h-full min-h-[600px] border-0"
              title={`${resource.title} - Google Drive Önizleme`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </CardContent>
        </Card>
      )
    }

    // Dosya tipine göre native rendering - ÖNCE BU KONTROL EDİLSİN
    switch (fileType) {
      case 'pdf':
        return (
          <EnhancedPdfViewer 
            sourceUrl={sourceUrl}
            title={resource.title}
          />
        )

      case 'word':
        return (
          <WordViewer 
            sourceUrl={sourceUrl}
            title={resource.title}
          />
        )

      case 'image':
        return (
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <img 
                  src={sourceUrl} 
                  alt={resource.title}
                  className="max-w-full h-auto max-h-96 rounded border shadow-sm mx-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )

      case 'video':
        console.log('🎬 Video rendering - URL:', sourceUrl, 'fileType:', fileType)
        
        // YouTube embed URL'leri için iframe kullan
        if (sourceUrl.includes('youtube.com/embed/')) {
          return (
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <iframe
                  src={sourceUrl}
                  className="w-full h-full min-h-[600px] border-0"
                  title={`${resource.title} - YouTube Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </CardContent>
            </Card>
          )
        }
        
        // Direkt video dosyaları (.mp4, .webm vs.) için video element
        return (
          <Card>
            <CardContent className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Video URL: {sourceUrl}</p>
                <p className="text-sm text-gray-600">File Type: {fileType}</p>
              </div>
              <video 
                controls 
                className="w-full h-auto max-h-96 rounded border"
                preload="metadata"
                onLoadStart={() => console.log('🎬 Video loading started')}
                onError={(e) => console.log('❌ Video error:', e)}
                onCanPlay={() => console.log('✅ Video can play')}
              >
                <source src={sourceUrl} type="video/mp4" />
                Tarayıcınız video oynatmayı desteklemiyor.
              </video>
            </CardContent>
          </Card>
        )

      case 'audio':
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Music className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-4">{resource.title}</h3>
              <audio 
                controls 
                className="w-full max-w-md mx-auto"
                preload="metadata"
              >
                <source src={sourceUrl} />
                Tarayıcınız ses oynatmayı desteklemiyor.
              </audio>
            </CardContent>
          </Card>
        )

      case 'text':
        return <TextFileViewer sourceUrl={sourceUrl} title={resource.title} />

      case 'excel':
      case 'powerpoint':
        // Office dosyaları için fallback iframe
        if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
          return (
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <iframe
                  src={sourceUrl}
                  className="w-full h-full min-h-[600px] border-0"
                  title={`${resource.title} - Dosya Önizleme`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </CardContent>
            </Card>
          )
        }
        return renderUnsupportedFile()

      default:
        // Diğer harici linkler için iframe
        if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
          return (
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <iframe
                  src={sourceUrl}
                  className="w-full h-full min-h-[600px] border-0"
                  title={`${resource.title} - Web İçerik Önizlemesi`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </CardContent>
            </Card>
          )
        }
        return renderUnsupportedFile()
    }
  }

  // Embed önizleme renderı
  const renderEmbedPreview = () => {
    // Google Drive için özel embed
    if (sourceUrl.includes('drive.google.com')) {
      return (
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <iframe
              src={sourceUrl}
              className="w-full h-full min-h-[600px] border-0"
              title={`${resource.title} - Google Drive Önizleme`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </CardContent>
        </Card>
      )
    }

    // Google Docs için özel embed
    if (sourceUrl.includes('docs.google.com')) {
      return (
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <iframe
              src={sourceUrl}
              className="w-full h-full min-h-[600px] border-0"
              title={`${resource.title} - Google Docs Önizleme`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </CardContent>
        </Card>
      )
    }

    // YouTube için özel embed
    if (sourceUrl.includes('youtube.com/embed/')) {
      return (
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <iframe
              src={sourceUrl}
              className="w-full h-full min-h-[600px] border-0"
              title={`${resource.title} - YouTube Video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </CardContent>
        </Card>
      )
    }

    if (['word', 'excel', 'powerpoint'].includes(fileType)) {
      return (
        <Card>
          <CardContent className="p-0">
            <iframe
              src={getOfficeEmbedUrl(sourceUrl)}
              className="w-full h-[600px] border-0"
              title={`${resource.title} - Office Online Önizleme`}
            />
          </CardContent>
        </Card>
      )
    }

    if (fileType === 'pdf') {
      return (
        <Card>
          <CardContent className="p-0">
            <iframe
              src={sourceUrl}
              className="w-full h-[600px] border-0"
              title={`${resource.title} - PDF Önizleme`}
            />
          </CardContent>
        </Card>
      )
    }

    // Google Docs Viewer fallback
    return (
      <Card>
        <CardContent className="p-0">
          <iframe
            src={getGoogleViewerUrl(sourceUrl)}
            className="w-full h-[600px] border-0"
            title={`${resource.title} - Google Viewer`}
          />
        </CardContent>
      </Card>
    )
  }

  // Desteklenmeyen dosya türü veya harici servisler için iframe
  const renderUnsupportedFile = () => {
    // TÜM HTTP/HTTPS linkleri için iframe kullan (Google Drive hariç - o zaten yukarıda işlendi)
    if ((sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) && !sourceUrl.includes('drive.google.com')) {
      return (
        <Card className="h-full">
          <CardContent className="p-0 h-full">
            <iframe
              src={sourceUrl}
              className="w-full h-full min-h-[600px] border-0"
              title={`${resource.title} - Web İçerik Önizlemesi`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </CardContent>
        </Card>
      )
    }

    // Gerçekten desteklenmeyen dosyalar için eski görünüm
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Önizleme Desteklenmiyor</h3>
            <p className="text-gray-600 mb-6">
              Bu dosya türü için önizleme mevcut değil. Dosyayı indirmek veya harici uygulamayla açmak için:
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button 
                onClick={() => window.open(rawUrl, '_blank')} 
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Yeni Sekmede Aç
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = rawUrl
                  link.download = fileName
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

  if (!sourceUrl) {
    return renderUnsupportedFile()
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b p-4 flex items-center justify-between">
        {/* Sol taraf - Sadece kaynak başlığı */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{resource.title}</h2>
        </div>
        
        {/* Orta - ELT Arena Logo + powered by Broos Media */}
        <div className="flex-1 flex justify-center items-center gap-3">
          <img 
            src="/elt-arena-logo.png" 
            alt="ELT Arena" 
            className="h-10 w-auto"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">powered by</span>
            <img 
              src="/broos-media.png" 
              alt="Broos Media" 
              className="h-5 w-auto"
            />
          </div>
        </div>

        {/* Sağ taraf - Aksiyon butonları */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Oyun, Video, Sunum ve Flashcards türlerinde tam ekran butonu, diğerlerinde indir butonu */}
          {(resource.type === 'game' || resource.type === 'video' || resource.type === 'book-presentation' || resource.type === 'flashcards') ? (
            <Button
              size="sm"
              variant="outline"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            >
              <Maximize className="h-4 w-4" />
              {isFullscreen ? "Çık" : "Tam Ekran"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const link = document.createElement('a')
                link.href = rawUrl
                link.download = fileName
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              title="İndir"
            >
              <Download className="h-4 w-4" />
              İndir
            </Button>
          )}

          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
              Kapat
            </Button>
          )}
        </div>
      </div>

      {/* Content - Tab'sız direkt önizleme */}
      <div className="flex-1 bg-white overflow-auto">
        {renderNativePreview()}
      </div>
    </div>
  )
}

// Metin dosyası görüntüleyici
function TextFileViewer({ sourceUrl, title }: { sourceUrl: string, title: string }) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(sourceUrl)
      .then(response => {
        if (!response.ok) throw new Error('Dosya yüklenemedi')
        return response.text()
      })
      .then(text => {
        setContent(text)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Metin dosyası yükleme hatası:', err)
        setError(true)
        setIsLoading(false)
      })
  }, [sourceUrl])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Dosya yükleniyor...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Metin dosyası yüklenemedi</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-50 p-4 rounded border text-sm overflow-auto max-h-96 whitespace-pre-wrap">
          {content}
        </pre>
      </CardContent>
    </Card>
  )
}
