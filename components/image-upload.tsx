"use client"

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react"
import { cn, resolveFileUrl } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  currentImage?: string
  uploadType?: 'announcements' | 'team-members' | 'general'
  className?: string
  maxSize?: number // MB
}

export function ImageUpload({ 
  onImageUploaded, 
  currentImage, 
  uploadType = 'general',
  className,
  maxSize = 5
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Hata",
        description: "Lütfen sadece resim dosyası seçin",
        variant: "destructive"
      })
      return
    }

    // Dosya boyutu kontrolü
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Hata", 
        description: `Dosya boyutu ${maxSize}MB'den küçük olmalıdır`,
        variant: "destructive"
      })
      return
    }

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', uploadType)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadProgress(100)

      // Preview'ı güncelle
      setPreviewImage(result.url)
      
      // Parent component'e URL'i gönder
      onImageUploaded(result.url)

      toast({
        title: "Başarılı",
        description: "Resim başarıyla yüklendi",
      })

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : 'Yükleme başarısız',
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file && file.type.startsWith('image/')) {
      uploadFile(file)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {!previewImage && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          {!isUploading ? (
            <>
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Resim Seç
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                veya buraya sürükle bırak
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF - Max {maxSize}MB
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Yükleniyor...</p>
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {previewImage && (
        <div className="relative">
          <div className="relative inline-block">
            <img
              src={resolveFileUrl(previewImage)}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Değiştir
            </Button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}
