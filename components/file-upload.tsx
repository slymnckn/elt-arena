"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, File, FileText, Video, Music, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadFileViaApi } from "@/lib/upload-client"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  file: File
  url: string
  path: string
  type: string
  preview?: string
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
  uploadType?: string
}

const getFileIcon = (type: string, fileName = "") => {
  const lowerType = type.toLowerCase()
  const lowerName = fileName.toLowerCase()

  // Resim dosyaları
  if (lowerType.startsWith("image/")) {
    return <ImageIcon className="h-8 w-8 text-blue-500" />
  }

  // Video dosyaları
  if (lowerType.startsWith("video/")) {
    return <Video className="h-8 w-8 text-red-500" />
  }

  // Ses dosyaları
  if (lowerType.startsWith("audio/")) {
    return <Music className="h-8 w-8 text-green-500" />
  }

  // PDF dosyaları
  if (lowerType.includes("pdf")) {
    return <FileText className="h-8 w-8 text-red-600" />
  }

  // Word dosyaları
  if (lowerType.includes("word") || lowerType.includes("document") || lowerName.match(/\.(doc|docx)$/)) {
    return <FileText className="h-8 w-8 text-blue-600" />
  }

  // Excel dosyaları
  if (lowerType.includes("sheet") || lowerType.includes("excel") || lowerName.match(/\.(xls|xlsx)$/)) {
    return <FileText className="h-8 w-8 text-green-600" />
  }

  // PowerPoint dosyaları
  if (lowerType.includes("book-presentation") || lowerType.includes("powerpoint") || lowerName.match(/\.(ppt|pptx)$/)) {
    return <FileText className="h-8 w-8 text-orange-600" />
  }

  // Varsayılan dosya ikonu
  return <File className="h-8 w-8 text-gray-500" />
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileUpload({ onFilesUploaded, maxFiles = 5, acceptedTypes, className, uploadType = "materials" }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const uploadToSupabase = async (file: File): Promise<{ url: string; path: string } | null> => {
    const fileId = `${file.name}-${Date.now()}`
    setUploadError(null)

    try {
      // Progress simülasyonu
      for (let progress = 0; progress <= 90; progress += 10) {
        setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Gerçek yükleme
      const result = await uploadFileViaApi(file, uploadType || "materials")

      if (!result) {
        throw new Error("Dosya yüklenemedi. Sunucu hatası veya geçersiz yanıt.")
      }

      setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }))

      // Progress'i temizle
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
      }, 1000)

      return result
    } catch (error: any) {
      console.error("Dosya yükleme hatası:", error)
      setUploadError(error.message || "Dosya yüklenirken bir hata oluştu.")
      toast({
        title: "Yükleme Hatası",
        description: error.message || "Dosya yüklenirken bir sorun oluştu.",
        variant: "destructive",
      })
      setUploadProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[fileId]
        return newProgress
      })
      return null
    }
  }

  const handleFiles = async (fileList: FileList) => {
    const newFiles: UploadedFile[] = []
    setUploadError(null)

    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i]

      // Dosya türü kontrolü - eğer acceptedTypes boşsa tüm dosyaları kabul et
      if (acceptedTypes && acceptedTypes.length > 0) {
        const isAccepted = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            // "image/*" gibi joker karakterli tipler için
            const baseType = type.slice(0, -2) // "image/"
            return file.type.startsWith(baseType)
          }
          // "image/jpeg" gibi spesifik tipler için
          return file.type === type
        })

        if (!isAccepted) {
          toast({
            title: "Geçersiz Dosya Türü",
            description: `${file.name} dosyası kabul edilmiyor. Desteklenen türler: ${acceptedTypes.join(", ")}`,
            variant: "destructive",
          })
          continue
        }
      }

      const uploadResult = await uploadToSupabase(file)

      if (uploadResult) {
        let preview: string | undefined

        // Resim dosyaları için önizleme oluştur
        if (file.type.startsWith("image/")) {
          preview = uploadResult.url
        }

        newFiles.push({
          file,
          url: uploadResult.url,
          path: uploadResult.path,
          type: file.type,
          preview,
        })
      }
    }

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesUploaded(updatedFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles)
    }
    // Input'u sıfırla ki aynı dosya tekrar seçilebilsin
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesUploaded(updatedFiles)
    setUploadError(null)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dosya yükleme alanı */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">Dosyaları yükleyin</p>
        <p className="text-sm text-gray-500">Maksimum {maxFiles} dosya yükleyebilirsiniz</p>
        {acceptedTypes && acceptedTypes.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">Desteklenen formatlar: {acceptedTypes.join(", ")}</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept={acceptedTypes?.join(",")}
      />

      {/* Yükleme hatası mesajı */}
      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Hata!</strong>
          <span className="block sm:inline"> {uploadError}</span>
        </div>
      )}

      {/* Yüklenen dosyalar listesi */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Yüklenen Dosyalar ({files.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((uploadedFile, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview || "/placeholder.svg"}
                    alt={uploadedFile.file.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                ) : (
                  getFileIcon(uploadedFile.type, uploadedFile.file.name)
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.file.size)}</p>
                  <p className="text-xs text-green-600">✓ Yüklendi</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yükleme progress'i */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Yükleniyor...</h4>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 truncate">{fileId.split("-")[0]}</span>
                <span className="text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
