"use client"

import { useState, useMemo, useEffect } from "react"
import { useData } from "@/context/data-context"
import type { Resource, ResourceType } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PlusCircle,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Download,
  Eye,
  RefreshCw,
  Search,
  Filter,
  X,
  SortAsc,
  SortDesc,
  User,
  Megaphone,
} from "lucide-react"
import { ResourceForm } from "./resource-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { ResourceViewer } from "./resource-viewer"

type SortOption = "title-asc" | "title-desc" | "type-asc" | "type-desc" | "date-asc" | "date-desc"
type FileStatusFilter = "all" | "with-file" | "without-file"

interface AdminUser {
  id: number
  username: string
  full_name?: string
}

export function AdminDashboard() {
  const { grades, loading, refreshGrades } = useData()
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all")
  const [fileStatusFilter, setFileStatusFilter] = useState<FileStatusFilter>("all")
  const [sortOption, setSortOption] = useState<SortOption>("title-asc")
  const [showFilters, setShowFilters] = useState(false)
  const [creatorFilter, setCreatorFilter] = useState<number | "all">("all") // Yeni kullanıcı filtresi
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]) // Admin kullanıcıları listesi

  // Mevcut kullanıcının ID'sini al
  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem("admin_token")
    if (token) {
      try {
        // JWT token formatını kontrol et (header.payload.signature)
        const parts = token.split('.')
        if (parts.length !== 3) {
          console.error('Geçersiz token formatı')
          return null
        }

        // Payload kısmını decode et
        const payload = JSON.parse(atob(parts[1]))
        return payload.userId as number
      } catch (e) {
        console.error("Token çözümlenirken hata:", e)
        return null
      }
    }
    return null
  }, [])

  useEffect(() => {
    if (!loading && grades.length > 0 && !selectedGradeId) {
      setSelectedGradeId(grades[0].id)
    }
  }, [grades, loading, selectedGradeId])

  useEffect(() => {
    const grade = grades.find((g) => g.id === selectedGradeId)
    if (grade && grade.units.length > 0 && !selectedUnitId) {
      setSelectedUnitId(grade.units[0].id)
    }
  }, [grades, selectedGradeId, selectedUnitId])

  // Admin kullanıcılarını yükle
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const users = await response.json()
          setAdminUsers(users)
        }
      } catch (error) {
        console.error('Admin users yüklenirken hata:', error)
      }
    }
    fetchAdminUsers()
  }, [])

  const handleFormSubmit = async (resourceData: Omit<Resource, "id" | "creatorName">) => {
    if (!selectedUnitId) return

    console.log('🔍 Admin Dashboard - Form submit:', { 
      selectedUnitId, 
      resourceData, 
      currentUserId,
      editingResource: editingResource?.id 
    })

    setIsSubmitting(true)
    try {
      if (editingResource) {
        // Update existing resource
        const updatePayload = {
          id: editingResource.id,
          ...resourceData,
          updatedBy: currentUserId?.toString()
        }
        console.log('📝 Update payload:', updatePayload)
        const response = await fetch("/api/admin/resources", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload)
        })
        if (!response.ok) throw new Error("Update failed")
      } else {
        // Add new resource
        const createPayload = {
          unitId: selectedUnitId,
          ...resourceData,
          createdBy: currentUserId?.toString()
        }
        console.log('📝 Create payload:', createPayload)
        const response = await fetch("/api/admin/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createPayload)
        })
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error Response:', errorText)
          throw new Error("Add failed")
        }
      }

      await refreshGrades()
      setIsFormOpen(false)
      setEditingResource(null)
    } catch (error) {
      console.error("Materyal kaydedilirken hata:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/admin/resources?id=${resourceId}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Delete failed")
      await refreshGrades()
    } catch (error) {
      console.error("Materyal silinirken hata:", error)
    }
  }

  const selectedGrade = useMemo(() => grades.find((g) => g.id === selectedGradeId), [grades, selectedGradeId])
  const units = useMemo(() => selectedGrade?.units || [], [selectedGrade])
  const selectedUnit = useMemo(() => units.find((u) => u.id === selectedUnitId), [units, selectedUnitId])
  const allResources = useMemo(() => selectedUnit?.resources || [], [selectedUnit])

  // Filtrelenmiş ve sıralanmış materyaller
  const filteredAndSortedResources = useMemo(() => {
    const baseResources = allResources.map((r) => ({
      ...r,
      gradeName: selectedGrade?.title || "",
      unitName: selectedUnit?.title || "",
      gradeId: selectedGradeId || "",
      unitId: selectedUnitId || 0,
    }))

    let filtered = baseResources

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Tür filtresi
    if (typeFilter !== "all") {
      filtered = filtered.filter((resource) => resource.type === typeFilter)
    }

    // Dosya durumu filtresi
    if (fileStatusFilter === "with-file") {
      filtered = filtered.filter((resource) => resource.fileUrl)
    } else if (fileStatusFilter === "without-file") {
      filtered = filtered.filter((resource) => !resource.fileUrl)
    }

    // Kullanıcı filtresi
    if (creatorFilter !== "all") {
      filtered = filtered.filter((resource) => resource.createdBy === creatorFilter.toString())
    }

    // Sıralama
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "title-asc":
          return a.title.localeCompare(b.title, "tr")
        case "title-desc":
          return b.title.localeCompare(a.title, "tr")
        case "type-asc":
          return a.type.localeCompare(b.type)
        case "type-desc":
          return b.type.localeCompare(a.type)
        case "date-asc":
          return a.id.localeCompare(b.id)
        case "date-desc":
          return b.id.localeCompare(a.id)
        default:
          return 0
      }
    })

    return sorted
  }, [
    allResources,
    selectedGrade,
    selectedUnit,
    selectedGradeId,
    selectedUnitId,
    searchTerm,
    typeFilter,
    fileStatusFilter,
    creatorFilter, // Yeni filtreyi ekle
    sortOption,
  ])

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setFileStatusFilter("all")
    setSortOption("title-asc")
    setCreatorFilter("all") // Kullanıcı filtresini temizle
  }

  const hasActiveFilters =
    searchTerm ||
    typeFilter !== "all" ||
    fileStatusFilter !== "all" ||
    sortOption !== "title-asc" ||
    creatorFilter !== "all" // Yeni filtreyi ekle

  const getResourceTypeLabel = (type: string) => {
    const labels = {
      "book-presentation": "Kitap Sunumları",
      game: "Oyunlar",
      summary: "Konu Özetleri",
      quiz: "Testler / Quizler",
      video: "Videolar",
      worksheet: "Çalışma Kağıtları",
      file: "Dosyalar",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getResourceTypeColor = (type: string) => {
    const colors = {
      "book-presentation": "bg-blue-100 text-blue-800",
      game: "bg-green-100 text-green-800",
      summary: "bg-purple-100 text-purple-800",
      quiz: "bg-orange-100 text-orange-800",
      video: "bg-red-100 text-red-800",
      worksheet: "bg-indigo-100 text-indigo-800",
      file: "bg-gray-100 text-gray-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    window.location.href = "/admin/login"
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-8 relative z-0">
        <div className="flex justify-end mb-6">
          <Button
            onClick={() => {
              setEditingResource(null)
              setIsFormOpen(true)
            }}
            disabled={!selectedGradeId || !selectedUnitId}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Materyal Ekle
          </Button>
        </div>

        {/* Sınıf ve Ünite Seçimi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-6 bg-white rounded-lg border shadow-sm relative z-50">
          <div>
            <label className="font-semibold text-slate-700 mb-2 block">Sınıf Seçin</label>
            <Select value={selectedGradeId || ""} onValueChange={(value) => setSelectedGradeId(value)}>
              <SelectTrigger className="relative z-50">
                <SelectValue placeholder="Sınıf seçin..." />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white border shadow-lg">
                {grades
                  .filter((grade) => !["evraklar", "elt-ekibi", "bize-ulasin"].includes(grade.id))
                  .map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 mb-2 block">Ünite Seçin</label>
            <Select
              value={selectedUnitId ? String(selectedUnitId) : ""}
              onValueChange={(value) => setSelectedUnitId(Number(value))}
              disabled={!units.length}
            >
              <SelectTrigger className="relative z-50">
                <SelectValue placeholder="Ünite seçin..." />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white border shadow-lg">
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={String(unit.id)}>
                    {unit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtreleme Paneli */}
        <Card className="mb-6 relative z-10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtreleme ve Arama
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredAndSortedResources.length} / {allResources.length}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Temizle
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  {showFilters ? "Gizle" : "Göster"}
                </Button>
              </div>
            </div>
          </CardHeader>

          {showFilters && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Arama */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Arama</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Başlık, açıklama, sınıf..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Materyal Türü */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Materyal Türü</label>
                    <Select value={typeFilter} onValueChange={(value: ResourceType | "all") => setTypeFilter(value)}>
                      <SelectTrigger className="relative z-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[90] bg-white border shadow-lg">
                        <SelectItem value="all">Tüm Türler</SelectItem>
                        <SelectItem value="book-presentation">Kitap Sunumları</SelectItem>
                        <SelectItem value="game">Oyunlar</SelectItem>
                        <SelectItem value="summary">Konu Özetleri</SelectItem>
                        <SelectItem value="quiz">Testler / Quizler</SelectItem>
                        <SelectItem value="video">Videolar</SelectItem>
                        <SelectItem value="worksheet">Çalışma Kağıtları</SelectItem>
                        <SelectItem value="file">Dosyalar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dosya Durumu */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Dosya Durumu</label>
                    <Select
                      value={fileStatusFilter}
                      onValueChange={(value: FileStatusFilter) => setFileStatusFilter(value)}
                    >
                      <SelectTrigger className="relative z-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[90] bg-white border shadow-lg">
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="with-file">Dosyası Olan</SelectItem>
                        <SelectItem value="without-file">Dosyası Olmayan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Oluşturan Kullanıcı */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Oluşturan Kullanıcı</label>
                    <Select
                      value={creatorFilter === "all" ? "all" : String(creatorFilter)}
                      onValueChange={(value) => setCreatorFilter(value === "all" ? "all" : Number(value))}
                    >
                      <SelectTrigger className="relative z-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[90] bg-white border shadow-lg" style={{ position: 'fixed', zIndex: 99999 }}>
                        <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                        {adminUsers.map((user) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.full_name || user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sıralama */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Sıralama</label>
                    <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                      <SelectTrigger className="relative z-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[90] bg-white border shadow-lg">
                        <SelectItem value="title-asc">
                          <div className="flex items-center gap-2">
                            <SortAsc className="h-4 w-4" />
                            Başlık (A-Z)
                          </div>
                        </SelectItem>
                        <SelectItem value="title-desc">
                          <div className="flex items-center gap-2">
                            <SortDesc className="h-4 w-4" />
                            Başlık (Z-A)
                          </div>
                        </SelectItem>
                        <SelectItem value="type-asc">Tür (A-Z)</SelectItem>
                        <SelectItem value="type-desc">Tür (Z-A)</SelectItem>
                        <SelectItem value="date-asc">Eski → Yeni</SelectItem>
                        <SelectItem value="date-desc">Yeni → Eski</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Aktif Filtreler Gösterimi */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <span className="text-sm font-medium text-slate-600">Aktif Filtreler:</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="gap-1">
                        Arama: "{searchTerm}"
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                      </Badge>
                    )}
                    {typeFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Tür: {getResourceTypeLabel(typeFilter)}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setTypeFilter("all")} />
                      </Badge>
                    )}
                    {fileStatusFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Dosya: {fileStatusFilter === "with-file" ? "Var" : "Yok"}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFileStatusFilter("all")} />
                      </Badge>
                    )}
                    {creatorFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Oluşturan: {adminUsers.find((u) => u.id === creatorFilter)?.full_name || adminUsers.find((u) => u.id === creatorFilter)?.username || "Bilinmiyor"}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setCreatorFilter("all")} />
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Materyaller Tablosu */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Materyaller ({filteredAndSortedResources.length})</h3>
              {selectedUnit && (
                <span className="text-sm text-gray-600">
                  {selectedGrade?.title} - {selectedUnit.title}
                </span>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Materyal Başlığı</TableHead>
                <TableHead>Türü</TableHead>
                <TableHead>Oluşturan</TableHead>
                <TableHead>Dosya</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{resource.title}</div>
                      {resource.description && <div className="text-sm text-gray-500 mt-1">{resource.description}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getResourceTypeColor(resource.type)}>{getResourceTypeLabel(resource.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <User className="h-4 w-4" />
                      <span>{resource.createdBy || 'Admin'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {resource.fileUrl && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <FileText className="h-4 w-4" />
                          <span>Bulutta</span>
                        </div>
                      )}
                      {/* Önizle butonu */}
                      {(resource.link || resource.previewLink || resource.fileUrl) && (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedResource(resource)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Önizle
                        </Button>
                      )}
                      {/* İndir butonu sadece sunumlar için */}
                      {resource.type === "book-presentation" && resource.downloadLink && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(resource.downloadLink, "_blank")}>
                          <Download className="h-3 w-3 mr-1" />
                          İndir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingResource(resource)
                        setIsFormOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="z-[200] bg-white border shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu materyali kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white border hover:bg-gray-50">İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(resource.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAndSortedResources.length === 0 && (
            <div className="text-center py-12">
              {hasActiveFilters ? (
                <div>
                  <p className="text-slate-500 mb-4">Filtrelere uygun materyal bulunamadı.</p>
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Filtreleri Temizle
                  </Button>
                </div>
              ) : (
                <p className="text-slate-500">Bu ünite için gösterilecek materyal bulunmuyor.</p>
              )}
            </div>
          )}
        </div>

        {isFormOpen && (
          <ResourceForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editingResource}
            isSubmitting={isSubmitting}
          />
        )}

        {selectedResource && (
          <div>
            <ResourceViewer resource={selectedResource} onClose={() => setSelectedResource(null)} />
          </div>
        )}
      </div>
  )
}
