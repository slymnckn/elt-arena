"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"

// Custom SelectContent Portal olmadan
const CustomSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    className={cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    )}
    position={position}
    style={{ position: 'fixed', zIndex: 99999 }}
    {...props}
  >
    <SelectPrimitive.ScrollUpButton />
    <SelectPrimitive.Viewport
      className={cn(
        "p-1",
        position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
      )}
    >
      {children}
    </SelectPrimitive.Viewport>
    <SelectPrimitive.ScrollDownButton />
  </SelectPrimitive.Content>
))

import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import type { Resource, ResourceType, GameCategory } from "@/lib/data"

interface UploadedFile {
  file: File
  url: string
  path: string
  type: string
  preview?: string
}

interface ResourceFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Resource, "id">) => void
  initialData?: Resource | null
  isSubmitting?: boolean
}

  const getResourceTypeFromFile = (file: File): ResourceType => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const name = file.name.toLowerCase();
    
    // Check if it's a presentation file
    if (extension === 'pptx' || extension === 'ppt' || name.includes('sunum') || name.includes('book-presentation')) {
      return 'book-presentation';
    }
    
    // Check if it's a quiz/test file
    if (name.includes('test') || name.includes('quiz') || name.includes('sınav')) {
      return 'quiz';
    }
    
    // Check if it's a worksheet file
    if (name.includes('worksheet') || name.includes('çalışma') || name.includes('etkinlik')) {
      return 'worksheet';
    }
    
    // Check if it's a video file
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
      return 'video';
    }
    
    // Check if it's a summary/document file
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension) || name.includes('özet') || name.includes('summary')) {
      return 'summary';
    }
    
    // Check if it's a game file
    if (name.includes('oyun') || name.includes('game')) {
      return 'game';
    }
    
    // Default to file type
    return 'file';
  };

export function ResourceForm({ isOpen, onClose, onSubmit, initialData, isSubmitting = false }: ResourceFormProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<ResourceType>("book-presentation")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [previewLink, setPreviewLink] = useState("")
  const [downloadLink, setDownloadLink] = useState("")
  const [gameCategory, setGameCategory] = useState<GameCategory>("Fortune Match")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [activeTab, setActiveTab] = useState("manual") // Değişiklik burada: Varsayılan olarak 'manual'

  // Oyun kategorileri
  const gameCategories: GameCategory[] = [
    "Fortune Match",
    "Tower Game", 
    "Wordwall",
    "Baamboozle",
    "Words of Wisdom",
    "Kahoot!"
  ]

  useEffect(() => {
    console.log('🔍 ResourceForm useEffect:', { initialData, isOpen })
    
    if (initialData) {
      console.log('📝 Initial data fields:', {
        title: initialData.title,
        type: initialData.type,
        description: initialData.description,
        link: initialData.link,
        previewLink: initialData.previewLink,
        downloadLink: initialData.downloadLink,
        fileUrl: initialData.fileUrl
      })
      
      setTitle(initialData.title)
      setType(initialData.type)
      setDescription(initialData.description || "")
      setGameCategory(initialData.category || "Fortune Match") // Default kategori
      // Düzenleme modunda: varolan linkleri uygun alanlara doldur
      if (initialData.type === "book-presentation") {
        setPreviewLink(initialData.previewLink || "")
        setDownloadLink(initialData.downloadLink || "")
        setLink("") // book-presentation'da link alanını boş bırak
      } else {
        setLink(initialData.link || "")
        setPreviewLink("") // Diğer türlerde preview/download linklerini boş bırak
        setDownloadLink("")
      }
      setUploadedFiles([])
      setActiveTab("manual")
    } else {
      setTitle("")
      setType("book-presentation")
      setDescription("")
      setLink("")
      setPreviewLink("")
      setDownloadLink("")
      setGameCategory("Fortune Match") // Default kategori
      setUploadedFiles([])
      setActiveTab("manual") // Değişiklik burada: Yeni materyal eklerken de 'manual'
    }
  }, [initialData, isOpen])

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files)

    if (files.length > 0) {
      const firstFile = files[0]

      // Başlık otomatik doldur
      if (!title) {
        setTitle(firstFile.file.name.replace(/\.[^/.]+$/, ""))
      }

      // Dosya türünü otomatik algıla
      const detectedType = getResourceTypeFromFile(firstFile.file)
      setType(detectedType)

      // Sunum dosyaları için hem önizleme hem indirme linkini ayarla
      if (detectedType === "book-presentation") {
        setPreviewLink(firstFile.url)
        setDownloadLink(firstFile.url)
      } else {
        setLink(firstFile.url)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let resourceData: Omit<Resource, "id">

    if (activeTab === "upload" && uploadedFiles.length > 0) {
      // Dosya yükleme sekmesinden gelen veriler
      const firstFile = uploadedFiles[0]
      resourceData = {
        title: title || firstFile.file.name.replace(/\.[^/.]+$/, ""),
        type,
        description: description || `${firstFile.file.name} - Local Storage'a yüklendi`,
        fileUrl: firstFile.url,
        ...(type === "game" && { category: gameCategory }), // Oyun türü için kategori ekle
        ...(type === "book-presentation"
          ? {
              previewLink: firstFile.url,
              downloadLink: firstFile.url,
            }
          : {
              link: firstFile.url,
            }),
      }
    } else {
      // Manuel giriş sekmesinden gelen veriler
      if (type === "book-presentation") {
        // Kitap sunumlarında önizleme ve indirme linkleri ayrı
        resourceData = {
          title,
          type,
          description: description || undefined,
          previewLink: previewLink.trim() || undefined,
          downloadLink: downloadLink.trim() || undefined,
        }
      } else {
        // Diğer türlerde sadece link kullanılır
        resourceData = {
          title,
          type,
          description: description || undefined,
          link: link.trim() || undefined,
          ...(type === "game" && { category: gameCategory }), // Oyun türü için kategori ekle
        }
      }
    }

    console.log('📋 ResourceForm - Form state:', {
      title,
      type,
      description,
      link,
      previewLink,
      downloadLink,
      activeTab
    })
    console.log('📋 ResourceForm - Final data:', resourceData)
    onSubmit(resourceData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl"
        onPointerDownOutside={(e) => {
          // Select dropdown'larının dışına tıklandığında dialog kapanmasını engelle
          const target = e.target as Element
          if (target.closest('[data-radix-select-content]')) {
            e.preventDefault()
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {initialData ? "Materyali Düzenle" : "Yeni Materyal Ekle"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {initialData ? "Mevcut materyali düzenlemek için formu doldurun." : "Yeni bir materyal eklemek için aşağıdaki formu doldurun."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="manual">🔗 Manuel Link</TabsTrigger> {/* Sıra değişti */}
                <TabsTrigger value="upload">📁 Dosya Yükle</TabsTrigger> {/* Sıra değişti */}
              </TabsList>

              <TabsContent value="manual" className="space-y-6 mt-0">
                {" "}
                {/* Bu içerik artık ilk açılacak */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right font-medium">
                    Başlık
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right font-medium">
                    Tür
                  </Label>
                  <div className="col-span-3 relative">
                    <Select 
                      value={type} 
                      onValueChange={(value: ResourceType) => {
                        console.log('Select değeri değişti:', value)
                        setType(value)
                      }}
                      onOpenChange={(open) => {
                        console.log('Select açık durumu:', open)
                      }}
                    >
                      <SelectTrigger 
                        className="w-full"
                        onClick={() => console.log('SelectTrigger tıklandı')}
                      >
                        <SelectValue placeholder="Materyal türü seçin" />
                      </SelectTrigger>
                      <CustomSelectContent 
                        className="bg-white border shadow-2xl min-w-[200px] max-h-60 overflow-auto"
                      >
                        <SelectItem value="book-presentation">📚 Kitap Sunumları</SelectItem>
                        <SelectItem value="summary">📄 Konu Özetleri</SelectItem>
                        <SelectItem value="game">🎮 Oyunlar</SelectItem>
                        <SelectItem value="quiz">📝 Testler / Quizler</SelectItem>
                        <SelectItem value="worksheet">📋 Çalışma Kağıtları</SelectItem>
                        <SelectItem value="video">🎥 Videolar</SelectItem>
                        <SelectItem value="file">📁 Dosyalar</SelectItem>
                      </CustomSelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2 font-medium">
                    Açıklama
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="Materyal hakkında kısa açıklama..."
                    rows={3}
                  />
                </div>
                
                {/* Oyun türü seçiliyse kategori seçimi göster */}
                {type === "game" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gameCategory" className="text-right font-medium">
                      Oyun Kategorisi
                    </Label>
                    <div className="col-span-3 relative">
                      <Select 
                        value={gameCategory} 
                        onValueChange={(value: GameCategory) => setGameCategory(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <CustomSelectContent className="bg-white border shadow-2xl min-w-[200px] max-h-60 overflow-auto">
                          <SelectItem value="Fortune Match">🎰 Fortune Match</SelectItem>
                          <SelectItem value="Tower Game">🏗️ Tower Game</SelectItem>
                          <SelectItem value="Wordwall">🧱 Wordwall</SelectItem>
                          <SelectItem value="Baamboozle">💥 Baamboozle</SelectItem>
                          <SelectItem value="Words of Wisdom">📚 Words of Wisdom</SelectItem>
                          <SelectItem value="Kahoot!">🎮 Kahoot!</SelectItem>
                        </CustomSelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {type === "book-presentation" ? (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="previewLink" className="text-right font-medium">
                        Önizleme Linki
                      </Label>
                      <Input
                        id="previewLink"
                        value={previewLink}
                        onChange={(e) => setPreviewLink(e.target.value)}
                        className="col-span-3"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="downloadLink" className="text-right font-medium">
                        İndirme Linki
                      </Label>
                      <Input
                        id="downloadLink"
                        value={downloadLink}
                        onChange={(e) => setDownloadLink(e.target.value)}
                        className="col-span-3"
                        placeholder="https://..."
                      />
                    </div>
                    <p className="text-sm text-gray-500 col-start-2 col-span-3">
                      Önizleme linki popup'ta açılır, indirme linki yeni sekmede açılır.
                    </p>
                  </>
                ) : (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="link" className="text-right font-medium">
                      Link
                    </Label>
                    <Input
                      id="link"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="col-span-3"
                      placeholder="https://..."
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upload" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
                      Dosya Yükle (Tüm formatlar desteklenir)
                    </Label>
                    <FileUpload
                      onFilesUploaded={handleFilesUploaded}
                      maxFiles={1}
                      acceptedTypes={[]} // Tüm dosya türlerini kabul et
                      className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Desteklenen formatlar: PDF, Word, Excel, PowerPoint, Video, Resim ve daha fazlası
                    </p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="upload-title" className="text-right font-medium">
                          Başlık
                        </Label>
                        <Input
                          id="upload-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="col-span-3"
                          placeholder="Otomatik dolduruldu..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="upload-type" className="text-right font-medium">
                          Materyal Türü
                        </Label>
                        <div className="col-span-3 relative">
                          <Select 
                            value={type} 
                            onValueChange={(value: ResourceType) => setType(value)}
                            onOpenChange={(open) => console.log('Upload Select açık durumu:', open)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Materyal türü seçin" />
                            </SelectTrigger>
                            <CustomSelectContent 
                              className="bg-white border shadow-2xl min-w-[200px] max-h-60 overflow-auto"
                            >
                              <SelectItem value="book-presentation">📚 Kitap Sunumları</SelectItem>
                              <SelectItem value="summary">📄 Konu Özetleri</SelectItem>
                              <SelectItem value="game">🎮 Oyunlar</SelectItem>
                              <SelectItem value="quiz">📝 Testler / Quizler</SelectItem>
                              <SelectItem value="worksheet">📋 Çalışma Kağıtları</SelectItem>
                              <SelectItem value="video">🎥 Videolar</SelectItem>
                              <SelectItem value="file">📁 Dosyalar</SelectItem>
                            </CustomSelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="upload-description" className="text-right pt-2 font-medium">
                          Açıklama
                        </Label>
                        <Textarea
                          id="upload-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="col-span-3"
                          placeholder="Materyal hakkında kısa açıklama..."
                          rows={3}
                        />
                      </div>

                      {/* Upload sekmesinde de oyun türü seçiliyse kategori seçimi göster */}
                      {type === "game" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="upload-gameCategory" className="text-right font-medium">
                            Oyun Kategorisi
                          </Label>
                          <div className="col-span-3 relative">
                            <Select 
                              value={gameCategory} 
                              onValueChange={(value: GameCategory) => setGameCategory(value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Kategori seçin" />
                              </SelectTrigger>
                              <CustomSelectContent className="bg-white border shadow-2xl min-w-[200px] max-h-60 overflow-auto">
                                <SelectItem value="Fortune Match">🎰 Fortune Match</SelectItem>
                                <SelectItem value="Tower Game">🏗️ Tower Game</SelectItem>
                                <SelectItem value="Wordwall">🧱 Wordwall</SelectItem>
                                <SelectItem value="Baamboozle">💥 Baamboozle</SelectItem>
                                <SelectItem value="Words of Wisdom">📚 Words of Wisdom</SelectItem>
                                <SelectItem value="Kahoot!">🎮 Kahoot!</SelectItem>
                              </CustomSelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                İptal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={(activeTab === "upload" && uploadedFiles.length === 0) || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
