"use client"
import { Button } from "@/components/ui/button"
import { X, Maximize } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Resource } from "@/lib/data"
import { useEffect, useState } from "react"

interface ResourceViewerProps {
  resource: Resource
  onClose: () => void
}

export function ResourceViewer({ resource, onClose }: ResourceViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          exitFullscreen()
        } else {
          onClose()
        }
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose, isFullscreen])

  // Fullscreen değişikliklerini dinle
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const enterFullscreen = () => {
    const element = document.getElementById("resource-viewer-container")
    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        ;(element as any).webkitRequestFullscreen()
      } else if ((element as any).msRequestFullscreen) {
        ;(element as any).msRequestFullscreen()
      }
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      ;(document as any).webkitExitFullscreen()
    } else if ((document as any).msExitFullscreen) {
      ;(document as any).msExitFullscreen()
    }
  }

  // YouTube URL'sini embed formatına çevir
  const convertToEmbedUrl = (url: string) => {
    // YouTube URL'leri
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }

    // Vimeo URL'leri
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0]
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`
    }

    // Dailymotion URL'leri
    if (url.includes("dailymotion.com/video/")) {
      const videoId = url.split("video/")[1]?.split("?")[0]
      return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1`
    }

    // Twitch URL'leri
    if (url.includes("twitch.tv/videos/")) {
      const videoId = url.split("videos/")[1]?.split("?")[0]
      return `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}&autoplay=true`
    }

    // Diğer video platformları için genel embed denemesi
    if (url.includes("embed") || url.includes("player")) {
      return url
    }

    // Eğer hiçbiri değilse orijinal URL'yi döndür
    return url
  }

  const getResourceContent = () => {
    const { type, link, previewLink, fileUrl } = resource

    // Dosya URL'si varsa dosya türüne göre görüntüle
    if (fileUrl) {
      const fileName = fileUrl.split("/").pop()?.toLowerCase() || ""
      const fileExtension = fileName.split(".").pop() || ""

      // PDF dosyaları
      if (fileExtension === "pdf" || fileUrl.includes("pdf")) {
        return <iframe src={fileUrl} title={resource.title} className="w-full h-full" frameBorder="0" allowFullScreen />
      }

      // Microsoft Office dosyaları - Word, Excel, PowerPoint
      if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExtension)) {
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
        return (
          <iframe
            src={officeViewerUrl}
            title={resource.title}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          />
        )
      }

      // Google Docs formatları
      if (["odt", "ods", "odp"].includes(fileExtension)) {
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
        return (
          <iframe
            src={googleViewerUrl}
            title={resource.title}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          />
        )
      }

      // Video dosyaları
      if (["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v", "3gp"].includes(fileExtension)) {
        return (
          <video controls autoPlay className="w-full h-full object-contain">
            <source src={fileUrl} type="video/mp4" />
            Tarayıcınız video etiketini desteklemiyor.
          </video>
        )
      }

      // Resim dosyaları
      if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff"].includes(fileExtension)) {
        return <img src={fileUrl || "/placeholder.svg"} alt={resource.title} className="w-full h-full object-contain" />
      }

      // Ses dosyaları
      if (["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(fileExtension)) {
        return (
          <div className="flex items-center justify-center h-full">
            <audio controls className="w-full max-w-md">
              <source src={fileUrl} />
              Tarayıcınız ses etiketini desteklemiyor.
            </audio>
          </div>
        )
      }

      // Metin dosyaları
      if (["txt", "rtf", "csv"].includes(fileExtension)) {
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
        return (
          <iframe
            src={googleViewerUrl}
            title={resource.title}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          />
        )
      }

      // Diğer tüm dosya türleri için önce Google Viewer dene, sonra Office Viewer
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`

      return (
        <div className="w-full h-full">
          <iframe
            src={googleViewerUrl}
            title={resource.title}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            onError={() => {
              // Google Viewer başarısız olursa Office Viewer'ı dene
              const iframe = document.querySelector('iframe[src*="docs.google.com"]') as HTMLIFrameElement
              if (iframe) {
                iframe.src = officeViewerUrl
              }
            }}
          />
        </div>
      )
    }

    // Sunumlar için önizleme linki varsa onu kullan
    if (type === "book-presentation" && previewLink) {
      return (
        <iframe src={previewLink} title={resource.title} className="w-full h-full" frameBorder="0" allowFullScreen />
      )
    }

    // Video türü için özel işlem
    if (type === "video" && link) {
      // Önce video platformu kontrolü yap
      if (
        link.includes("youtube.com") ||
        link.includes("youtu.be") ||
        link.includes("vimeo.com") ||
        link.includes("dailymotion.com") ||
        link.includes("twitch.tv")
      ) {
        const embedUrl = convertToEmbedUrl(link)
        return (
          <iframe
            src={embedUrl}
            title={resource.title}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        )
      }

      // Direkt video dosyası ise
      return (
        <video controls autoPlay className="w-full h-full object-contain">
          <source src={link} type="video/mp4" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>
      )
    }

    // Ana link varsa onu kullan (özellikle oyunlar için)
    if (link) {
      return (
        <iframe
          src={link}
          title={resource.title}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      )
    }

    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white text-lg">İçerik bulunamadı.</p>
      </div>
    )
  }

  return (
    <div
      id="resource-viewer-container"
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm ${isFullscreen ? "bg-black" : ""}`}
    >
      {/* Backdrop - tıklanınca kapat (sadece fullscreen değilken) */}
      {!isFullscreen && <div className="absolute inset-0" onClick={onClose} />}

      {/* Modal Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header - fullscreen'de gizle */}
        {!isFullscreen && (
          <div className="flex-shrink-0 bg-white/90 p-4 flex items-center justify-between border-b relative z-10">
            {/* Sol taraf - Başlık */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800">{resource.title}</h2>
            </div>

            {/* Orta - Broos Media Logo */}
            <div className="flex-1 flex justify-center">
              <Link
                href="https://broosmedia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/broos-media.png" 
                  alt="Broos Media Logo"
                  width={80}
                  height={26}
                  sizes="80px"
                  style={{ 
                    width: '80px',
                    height: 'auto',
                  }}
                  priority
                />
              </Link>
            </div>

            {/* Sağ taraf - Butonlar */}
            <div className="flex-1 flex justify-end gap-2">
              {/* Tam ekran butonu */}
              <Button
                variant="ghost"
                size="icon"
                onClick={enterFullscreen}
                className="h-8 w-8 rounded-full hover:bg-slate-200 transition-colors"
                title="Tam Ekran"
              >
                <Maximize className="h-5 w-5 text-slate-600" />
                <span className="sr-only">Tam Ekran</span>
              </Button>

              {/* Kapat butonu */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
                <span className="sr-only">Kapat</span>
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`flex-grow relative z-10 ${isFullscreen ? "p-0" : "p-2"}`}>{getResourceContent()}</div>

        {/* Fullscreen'de ESC tuşu bilgisi */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm z-20">
            ESC tuşuna basarak çıkabilirsiniz
          </div>
        )}
      </div>
    </div>
  )
}
