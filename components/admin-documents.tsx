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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Edit, Plus, Download, FileText, ArrowLeft, ExternalLink, Globe, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { UniversalFilePreview } from "@/components/universal-file-preview"

interface Document {
  id: number
  title: string
  description: string | null
  file_url: string
  file_name: string
  file_size: number | null
  document_type: string
  order_index: number
  source_type: 'file' | 'link'
  external_url: string | null
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
  const [activeTab, setActiveTab] = useState<'file' | 'link'>('file')
  const [previewResource, setPreviewResource] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: '',
    file_url: '',
    file_name: '',
    file_size: 0,
    source_type: 'file' as 'file' | 'link',
    external_url: ''
  })
  const [uploadingFile, setUploadingFile] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkPreview, setLinkPreview] = useState<any | null>(null)
  const [linkPreviewLoading, setLinkPreviewLoading] = useState(false)

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

  // Link preview fonksiyonu
  const handleLinkPreview = async (url: string) => {
    if (!url) {
      setLinkPreview(null)
      return
    }

    setLinkPreviewLoading(true)
    try {
      const response = await fetch('/api/admin/documents/preview-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      if (response.ok) {
        const data = await response.json()
        setLinkPreview(data)
        
        // Otomatik başlık önerisi
        if (!formData.title && data.suggestedTitle) {
          setFormData({
            ...formData,
            title: data.suggestedTitle,
            source_type: 'link',
            external_url: data.url,
            file_url: data.embedUrl || data.url,
            file_name: 'External Link',
            file_size: 0
          })
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "Hata",
          description: errorData.error || "Link önizleme sırasında hata oluştu",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Link preview error:', error)
      toast({
        title: "Hata",
        description: "Link önizleme sırasında hata oluştu",
        variant: "destructive"
      })
    } finally {
      setLinkPreviewLoading(false)
    }
  }

  // URL değişikliği handler'ı
  const handleUrlChange = (url: string) => {
    setLinkUrl(url)
    
    // Debounced preview
    if (url) {
      const timeoutId = setTimeout(() => {
        handleLinkPreview(url)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } else {
      setLinkPreview(null)
    }
  }

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
      // Form data'yı source type'a göre hazırla
      const submitData = {
        ...formData,
        source_type: activeTab,
      }

      if (activeTab === 'link') {
        if (!linkPreview?.isValid) {
          throw new Error('Geçerli bir link URL\'si giriniz')
        }
        submitData.external_url = linkPreview.url || linkUrl
        submitData.file_url = linkPreview.url || linkUrl // API bunu kullanacak
        submitData.file_name = linkPreview.suggestedTitle || 'External Link'
        submitData.file_size = 0
      } else if (activeTab === 'file') {
        if (!formData.file_url) {
          throw new Error('Lütfen bir dosya yükleyiniz')
        }
      }

      const url = editingDocument ? `/api/admin/documents/${editingDocument.id}` : '/api/admin/documents'
      const method = editingDocument ? 'PUT' : 'POST'
      
      console.log('Submitting document with data:', submitData)
      console.log('API URL:', url, 'Method:', method)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error('Error saving document:', error)
      toast({
        title: "Hata",
        description: error.message || "Evrak eklenirken hata oluştu",
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
    setActiveTab(document.source_type || 'file')
    
    if (document.source_type === 'link') {
      setLinkUrl(document.external_url || '')
      if (document.external_url) {
        handleLinkPreview(document.external_url)
      }
    }
    
    setFormData({
      title: document.title,
      description: document.description || '',
      document_type: document.document_type,
      file_url: document.file_url,
      file_name: document.file_name,
      file_size: document.file_size || 0,
      source_type: document.source_type || 'file',
      external_url: document.external_url || ''
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingDocument(null)
    setActiveTab('file')
    setLinkUrl('')
    setLinkPreview(null)
    setPreviewResource(null)
    setFormData({
      title: '',
      description: '',
      document_type: '',
      file_url: '',
      file_name: '',
      file_size: 0,
      source_type: 'file',
      external_url: ''
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getDocumentIcon = (document: Document) => {
    if (document.source_type === 'link') {
      // Link türüne göre özel iconlar
      const url = document.external_url || document.file_url || ''
      if (url.includes('drive.google.com')) return <Globe className="h-5 w-5 text-blue-600" />
      if (url.includes('docs.google.com/document')) return <FileText className="h-5 w-5 text-blue-500" />
      if (url.includes('docs.google.com/spreadsheets')) return <FileText className="h-5 w-5 text-green-500" />
      if (url.includes('docs.google.com/presentation')) return <FileText className="h-5 w-5 text-orange-500" />
      if (url.includes('youtube.com') || url.includes('youtu.be')) return <Globe className="h-5 w-5 text-red-500" />
      if (url.includes('onedrive.live.com') || url.includes('sharepoint.com')) return <Globe className="h-5 w-5 text-blue-700" />
      return <ExternalLink className="h-5 w-5 text-purple-600" />
    }
    // Dosya için varsayılan icon
    return <FileText className="h-5 w-5 text-gray-600" />
  }

  const getDocumentUrl = (document: Document) => {
    if (document.source_type === 'link') {
      return document.external_url || document.file_url
    }
    return document.file_url
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
            className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
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
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'file' | 'link')} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Dosya Yükle
                  </TabsTrigger>
                  <TabsTrigger value="link" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Link Ekle
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Ortak alanlar */}
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

                {/* Tab içerikleri */}
                <TabsContent value="file">
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
                      {formData.file_name && formData.source_type === 'file' && (
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
                </TabsContent>

                <TabsContent value="link">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Link URL</label>
                      <Input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://docs.google.com/document/..."
                        required
                      />
                      {linkPreviewLoading && <p className="text-sm text-blue-600">Link kontrol ediliyor...</p>}
                      {linkPreview && (
                        <div className="space-y-2">
                          <p className="text-sm text-green-600">
                            ✓ {linkPreview.domain} - {linkPreview.urlType}
                          </p>
                          {linkPreview.suggestedTitle && (
                            <p className="text-xs text-gray-500">
                              Önerilen başlık: {linkPreview.suggestedTitle}
                            </p>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Google Drive, Google Docs, YouTube, PDF linkleri ve daha fazlası desteklenir
                      </p>
                    </div>

                    {/* Link Önizlemesi */}
                    {linkPreview && linkPreview.embeddable && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Önizleme</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPreviewResource({
                                title: formData.title || linkPreview.suggestedTitle,
                                previewLink: linkPreview.embedUrl,
                                link: linkPreview.url,
                                fileUrl: linkPreview.url,
                                type: 'file'
                              })
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Tam Önizleme
                          </Button>
                        </div>
                        <div className="h-48 border rounded overflow-hidden">
                          <iframe
                            src={linkPreview.embedUrl}
                            className="w-full h-full"
                            title="Link Önizlemesi"
                            frameBorder="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={
                      activeTab === 'file' ? !formData.file_url : 
                      activeTab === 'link' ? !linkPreview?.isValid : true
                    }
                  >
                    {editingDocument ? 'Güncelle' : 'Ekle'}
                  </Button>
                </div>
              </form>
            </Tabs>
            
            {/* Tam Ekran Önizleme Modal */}
            {previewResource && (
              <Dialog open={!!previewResource} onOpenChange={() => setPreviewResource(null)}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Önizleme: {previewResource.title}</DialogTitle>
                  </DialogHeader>
                  <div className="h-[70vh]">
                    <UniversalFilePreview 
                      resource={previewResource} 
                      onClose={() => setPreviewResource(null)}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
                            {getDocumentIcon(document)}
                            {document.title}
                            {document.source_type === 'link' && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Link
                              </Badge>
                            )}
                          </CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {docType?.icon} {docType?.label || document.document_type}
                          </Badge>
                          {document.source_type === 'link' && document.external_url && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {new URL(document.external_url).hostname}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPreviewResource({
                                title: document.title,
                                previewLink: document.source_type === 'link' ? document.external_url : document.file_url,
                                link: document.source_type === 'link' ? document.external_url : document.file_url,
                                fileUrl: document.source_type === 'link' ? document.external_url : document.file_url,
                                type: 'file'
                              })
                            }}
                            title="Önizle - Evrakı büyük ekranda görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = getDocumentUrl(document)
                              if (!url) {
                                alert('Dosya linki bulunamadı.')
                                return
                              }
                              
                              if (document.source_type === 'link') {
                                // Link evrakları için yeni sekmede aç
                                window.open(url, '_blank')
                              } else {
                                // Dosya evrakları için indir
                                let downloadUrl = url
                                if (!downloadUrl.startsWith('http://') && !downloadUrl.startsWith('https://')) {
                                  downloadUrl = 'https://' + downloadUrl
                                }
                                
                                try {
                                  new URL(downloadUrl)
                                  window.open(downloadUrl, '_blank')
                                } catch (error) {
                                  console.error('Geçersiz URL:', downloadUrl, error)
                                  alert('Geçersiz dosya linki. Lütfen yönetici ile iletişime geçin.')
                                }
                              }
                            }}
                            title={document.source_type === 'link' ? "Aç" : "İndir"}
                          >
                            {document.source_type === 'link' ? (
                              <ExternalLink className="h-4 w-4" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
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
