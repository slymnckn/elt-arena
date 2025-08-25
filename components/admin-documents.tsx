"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as SelectPrimitive from "@radix-ui/react-select"
import React from "react"
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
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Download, FileText, ArrowLeft } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Document {
  id: number
  title: string
  description: string | null
  file_url: string
  file_name: string
  file_size: number | null
  document_type: string
  order_index: number
  created_at: string
  updated_at: string
}

const documentTypes = [
  { value: 'planlar', label: 'Planlar', icon: '📋' },
  { value: 'zumre-tutanaklari', label: 'Zümre Tutanakları', icon: '📝' },
  { value: 'sok-tutanaklari', label: 'ŞÖK Tutanakları', icon: '📊' },
  { value: 'veli-toplanti-tutanaklari', label: 'Veli Toplantı Tutanakları', icon: '👥' },
  { value: 'dyk-planlari', label: 'DYK Planları', icon: '⚡' },
  { value: 'hazir-bulunusluk-sinavlari', label: 'Hazır Bulunuşluk Sınavları', icon: '📋' },
  { value: 'other', label: 'Diğer', icon: '📁' }
]

export function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: '',
    file_url: '',
    file_name: '',
    file_size: 0
  })
  const [uploadingFile, setUploadingFile] = useState(false)

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/admin/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: "Hata",
        description: "Evraklar yüklenirken bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'document')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({
          ...formData,
          file_url: data.url,
          file_name: file.name,
          file_size: file.size
        })
        toast({
          title: "Başarılı",
          description: "Dosya yüklendi"
        })
      } else {
        throw new Error('Dosya yükleme başarısız')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Hata",
        description: "Dosya yükleme sırasında bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingDocument ? `/api/admin/documents/${editingDocument.id}` : '/api/admin/documents'
      const method = editingDocument ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: editingDocument ? "Evrak güncellendi" : "Yeni evrak eklendi"
        })
        fetchDocuments()
        setDialogOpen(false)
        resetForm()
      } else {
        throw new Error('İşlem başarısız')
      }
    } catch (error) {
      console.error('Error saving document:', error)
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu evrakı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/documents/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Evrak silindi"
        })
        fetchDocuments()
      } else {
        throw new Error('Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: "Hata",
        description: "Silme işlemi sırasında bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (document: Document) => {
    setEditingDocument(document)
    setFormData({
      title: document.title,
      description: document.description || '',
      document_type: document.document_type,
      file_url: document.file_url,
      file_name: document.file_name,
      file_size: document.file_size || 0
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingDocument(null)
    setFormData({
      title: '',
      description: '',
      document_type: '',
      file_url: '',
      file_name: '',
      file_size: 0
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getCategoryColor = (categoryValue: string) => {
    const colors = {
      'planlar': '#3b82f6',
      'zumre-tutanaklari': '#10b981',
      'sok-tutanaklari': '#8b5cf6',
      'veli-toplanti-tutanaklari': '#f97316',
      'dyk-planlari': '#ef4444',
      'hazir-bulunusluk-sinavlari': '#6366f1',
      'other': '#6b7280'
    }
    return colors[categoryValue as keyof typeof colors] || '#6b7280'
  }

  if (loading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Evraklar</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Evrak
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="sm:max-w-[600px]"
            onPointerDownOutside={(e) => {
              const target = e.target as Element
              if (target.closest('[data-radix-select-content]')) {
                e.preventDefault()
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? 'Evrakı Düzenle' : 'Yeni Evrak Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Başlık</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: Gizlilik Politikası"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Açıklama</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Evrak hakkında kısa açıklama..."
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Evrak Türü</label>
                <Select 
                  value={formData.document_type} 
                  onValueChange={(value) => setFormData({ ...formData, document_type: value })} 
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Evrak türünü seçin" />
                  </SelectTrigger>
                  <CustomSelectContent className="bg-white border shadow-2xl min-w-[200px] max-h-60 overflow-auto">
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </CustomSelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Dosya</label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileUpload(file)
                      }
                    }}
                    disabled={uploadingFile}
                  />
                  {uploadingFile && <p className="text-sm text-blue-600">Dosya yükleniyor...</p>}
                  {formData.file_name && (
                    <p className="text-sm text-green-600">
                      ✓ {formData.file_name} {formatFileSize(formData.file_size)}
                    </p>
                  )}
                  {!editingDocument && (
                    <p className="text-xs text-gray-500">
                      PDF, Word, Excel, PowerPoint dosyaları desteklenir
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={!formData.file_url}>
                  {editingDocument ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kategori seçimi olmadığında kategori listesi göster */}
      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentTypes.map((category) => {
            const categoryDocuments = documents.filter(doc => doc.document_type === category.value)
            
            return (
              <Card 
                key={category.value} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4"
                onClick={() => setSelectedCategory(category.value)}
                style={{ borderLeftColor: getCategoryColor(category.value) }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg text-white" style={{ backgroundColor: getCategoryColor(category.value) }}>
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{category.label}</h3>
                      <p className="text-sm text-slate-500 font-normal">
                        {categoryDocuments.length} evrak
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Kategoriye gitmek için tıklayın</span>
                    <div className="text-slate-400">→</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Seçili kategori evraklarını göster */
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSelectedCategory(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              {(() => {
                const selectedCategoryData = documentTypes.find(cat => cat.value === selectedCategory)
                const filteredDocuments = documents.filter(doc => doc.document_type === selectedCategory)
                return (
                  <>
                    <div className="p-2 rounded-lg text-white" style={{ backgroundColor: getCategoryColor(selectedCategory!) }}>
                      <span className="text-lg">{selectedCategoryData?.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        {selectedCategoryData?.label}
                      </h2>
                      <p className="text-slate-500">
                        {filteredDocuments.length} evrak
                      </p>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents
              .filter(doc => doc.document_type === selectedCategory)
              .map((document) => {
                const docType = documentTypes.find(t => t.value === document.document_type)
                return (
                  <Card key={document.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {document.title}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {docType?.icon} {docType?.label || document.document_type}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              let link = document.file_url
                              if (!link) {
                                alert('Dosya linki bulunamadı.')
                                return
                              }
                              
                              // URL formatını düzelt (protokol eksikse ekle)
                              if (!link.startsWith('http://') && !link.startsWith('https://')) {
                                link = 'https://' + link
                              }
                              
                              try {
                                new URL(link)
                                window.open(link, '_blank')
                              } catch (error) {
                                console.error('Geçersiz URL:', link, error)
                                alert('Geçersiz dosya linki. Lütfen yönetici ile iletişime geçin.')
                              }
                            }}
                            title="İndir"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(document)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(document.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {document.description && (
                        <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                      )}
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Dosya: {document.file_name}</p>
                        {document.file_size && <p>Boyut: {formatFileSize(document.file_size)}</p>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
          
          {documents.filter(doc => doc.document_type === selectedCategory).length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-slate-500">Bu kategoride henüz evrak bulunmuyor.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSelectedCategory(null)}
              >
                Kategorilere Geri Dön
              </Button>
            </div>
          )}
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Henüz evrak eklenmemiş
        </div>
      )}
    </div>
  )
}
