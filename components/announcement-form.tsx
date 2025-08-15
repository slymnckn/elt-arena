"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload } from "@/components/file-upload" // FileUpload import edildi
import type { Announcement } from "@/lib/database"

interface UploadedFile {
  file: File
  url: string
  path: string
  type: string
  preview?: string
}

interface AnnouncementFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Announcement, "id" | "created_at" | "updated_at" | "creatorName">) => void
  initialData?: Announcement | null
  isSubmitting?: boolean
}

export function AnnouncementForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState<string>("") // string | null yerine string olarak tutulup null'a çevrilecek
  const [content, setContent] = useState<string>("") // string | null yerine string olarak tutulup null'a çevrilecek
  const [isActive, setIsActive] = useState(true)
  const [displayOncePerSession, setDisplayOncePerSession] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null) // Yeni state

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "") // null ise boş string olarak ayarla
      setContent(initialData.content || "") // null ise boş string olarak ayarla
      setIsActive(initialData.is_active)
      setDisplayOncePerSession(initialData.display_once_per_session)
      setImageUrl(initialData.image_url || null) // initialData'dan image_url'i al
    } else {
      setTitle("")
      setContent("")
      setIsActive(true)
      setDisplayOncePerSession(false)
      setImageUrl(null) // Yeni duyuru için sıfırla
    }
  }, [initialData, isOpen])

  const handleFilesUploaded = (files: UploadedFile[]) => {
    if (files.length > 0) {
      setImageUrl(files[0].url) // Yüklenen ilk dosyanın URL'sini kaydet
    } else {
      setImageUrl(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title: title || "", 
      content: content || "", 
      is_active: isActive,
      display_once_per_session: displayOncePerSession,
      image_url: imageUrl,
      created_by: null, // Form'dan created_by gönderme, API'da handle edilecek
    })
  }

  return (
    // Custom backdrop kaldırıldı, Dialog kendi backdrop'ını yönetir
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        // Manuel konumlandırma ve backdropFilter kaldırıldı, shadcn'in varsayılanına güvenildi
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {initialData ? "Duyuruyu Düzenle" : "Yeni Duyuru Ekle"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {initialData ? "Mevcut duyuruyu düzenleyin." : "Yeni bir duyuru oluşturun."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right font-medium">
                Başlık
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                // required kaldırıldı
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2 font-medium">
                İçerik
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3"
                placeholder="Duyuru içeriğini buraya yazın..."
                rows={6}
                // required kaldırıldı
              />
            </div>

            {/* Görsel Yükleme Alanı */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="image" className="text-right pt-2 font-medium">
                Görsel
              </Label>
              <div className="col-span-3">
                <FileUpload
                  onFilesUploaded={handleFilesUploaded}
                  maxFiles={1}
                  acceptedTypes={["image/*"]} // Sadece resim dosyalarını kabul et
                  className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-purple-50"
                />
                {imageUrl && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Yüklenen görsel"
                      className="h-16 w-16 object-cover rounded"
                    />
                    <span>Görsel yüklendi.</span>
                    <Button variant="ghost" size="sm" onClick={() => setImageUrl(null)}>
                      Kaldır
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Duyuru için isteğe bağlı bir görsel yükleyin.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1" />
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                />
                <Label htmlFor="isActive" className="font-medium">
                  Aktif Duyuru
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1" />
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="displayOncePerSession"
                  checked={displayOncePerSession}
                  onCheckedChange={(checked) => setDisplayOncePerSession(Boolean(checked))}
                />
                <Label htmlFor="displayOncePerSession" className="font-medium">
                  Oturum Başına Bir Kez Göster
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                İptal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
