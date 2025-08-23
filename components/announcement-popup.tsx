"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Announcement } from "@/lib/database"
import Image from "next/image"
import { resolveFileUrl } from "@/lib/utils"

// Benzersiz kullanıcı ID'si oluştur veya mevcut olanı al
function getUserId(): string {
  if (typeof window === 'undefined') return '' // Server-side safety
  
  const key = 'elt_arena_user_id'
  let userId = localStorage.getItem(key)
  
  if (!userId) {
    // Benzersiz ID oluştur (timestamp + random)
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(key, userId)
  }
  
  return userId
}

// Duyurunun daha önce görülüp görülmediğini kontrol et
function hasUserSeenAnnouncement(userId: string, announcementId: number): boolean {
  if (typeof window === 'undefined') return true // Server-side safety
  
  try {
    const key = `seen_announcements_${userId}`
    const seenAnnouncements = JSON.parse(localStorage.getItem(key) || '[]')
    return seenAnnouncements.includes(announcementId)
  } catch (error) {
    console.error('LocalStorage okuma hatası:', error)
    return true // Hata durumunda gösterme
  }
}

// Duyuruyu görüldü olarak işaretle
function markAnnouncementAsSeen(userId: string, announcementId: number): void {
  if (typeof window === 'undefined') return // Server-side safety
  
  try {
    const key = `seen_announcements_${userId}`
    const seenAnnouncements = JSON.parse(localStorage.getItem(key) || '[]')
    
    if (!seenAnnouncements.includes(announcementId)) {
      seenAnnouncements.push(announcementId)
      localStorage.setItem(key, JSON.stringify(seenAnnouncements))
    }
  } catch (error) {
    console.error('LocalStorage yazma hatası:', error)
  }
}

// Debug için - tüm görülen duyuruları temizle
function clearSeenAnnouncements(): void {
  if (typeof window === 'undefined') return
  
  try {
    const userId = getUserId()
    const key = `seen_announcements_${userId}`
    localStorage.removeItem(key)
    console.log('🧹 Görülen duyurular temizlendi')
  } catch (error) {
    console.error('LocalStorage temizleme hatası:', error)
  }
}

// Global olarak debug fonksiyonunu dışa aktar
if (typeof window !== 'undefined') {
  (window as any).clearSeenAnnouncements = clearSeenAnnouncements
}

export function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Client-side'da userId'yi al
    const currentUserId = getUserId()
    setUserId(currentUserId)
  }, [])

  useEffect(() => {
    if (!userId) return // UserId henüz yüklenmedi

    const fetchAndShowAnnouncement = async () => {
      try {
        const response = await fetch('/api/announcements?active=true')
        if (!response.ok) throw new Error('Failed to fetch announcements')
        const activeAnnouncements = await response.json()

        if (activeAnnouncements.length > 0) {
          const latestAnnouncement = activeAnnouncements[0]

          // Kullanıcı bu duyuruyu daha önce gördü mü kontrol et
          if (hasUserSeenAnnouncement(userId, latestAnnouncement.id)) {
            console.log('📢 Duyuru daha önce görüldü, gösterilmiyor:', latestAnnouncement.id)
            return
          }

          setAnnouncement(latestAnnouncement)
          setIsOpen(true)
          console.log('📢 Duyuru gösteriliyor:', latestAnnouncement)
        }
      } catch (error) {
        console.error("Duyurular getirilirken hata:", error)
      }
    }

    fetchAndShowAnnouncement()
  }, [userId])

  const handleClose = () => {
    if (announcement && userId) {
      // Duyuruyu görüldü olarak işaretle
      markAnnouncementAsSeen(userId, announcement.id)
      console.log('📝 Duyuru görüldü olarak işaretlendi:', announcement.id)
    }
    
    setIsOpen(false)
    setAnnouncement(null)
  }

  if (!announcement || !isOpen) {
    return null
  }

  console.log('🔍 Popup Debug - Render ediliyor:', { isOpen, announcement })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl w-[90vw] max-h-[80vh] bg-white p-4">
        {/* Accessibility için gizli başlık */}
        <DialogTitle className="sr-only">Duyuru</DialogTitle>
        <DialogDescription className="sr-only">Duyuru görseli</DialogDescription>
        
        {/* Kırmızı X butonu */}
        <Button
          onClick={handleClose}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white z-10"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Sadece görsel göster */}
        {announcement.image_url && (
          <div className="w-full">
            <Image
              src={resolveFileUrl(announcement.image_url)}
              alt="Duyuru Görseli"
              width={800}
              height={600}
              className="rounded-md object-contain w-full h-auto max-h-[600px]"
            />
          </div>
        )}
        
        {/* Görsel yoksa boş alan */}
        {!announcement.image_url && (
          <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
            <p className="text-gray-500">Görsel bulunamadı</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
