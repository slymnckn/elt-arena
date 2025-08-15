"use client"

import { useState, useMemo, useEffect } from "react"
import { useData } from "@/context/data-context"
import type { Grade, Resource, ResourceType } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResourceViewer } from "@/components/resource-viewer"
import {
  BookOpen,
  Gamepad2,
  FileText,
  Video,
  PencilRuler,
  School,
  Languages,
  ArrowLeft,
  BookOpenCheck,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

const categoryIcons = {
  İlkokul: <School className="h-5 w-5 mr-2" />,
  Ortaokul: <School className="h-5 w-5 mr-2" />,
  Lise: <School className="h-5 w-5 mr-2" />,
  "Yabancı Dil": <Languages className="h-5 w-5 mr-2" />,
  Evraklar: <FileText className="h-5 w-5 mr-2" />,
  "ELT Arena Ekibi": <School className="h-5 w-5 mr-2" />,
  "Bize Ulaşın": <BookOpen className="h-5 w-5 mr-2" />,
}

// Kategori sıralaması
const categoryOrder = ["İlkokul", "Ortaokul", "Lise", "Yabancı Dil", "Evraklar", "ELT Arena Ekibi", "Bize Ulaşın"]

const resourceIcons = {
  "book-presentation": <BookOpen className="h-6 w-6 mr-3 text-blue-500" />,
  game: <Gamepad2 className="h-6 w-6 mr-3 text-green-500" />,
  summary: <FileText className="h-6 w-6 mr-3 text-purple-500" />,
  quiz: <PencilRuler className="h-6 w-6 mr-3 text-orange-500" />,
  video: <Video className="h-6 w-6 mr-3 text-red-500" />,
  worksheet: <BookOpenCheck className="h-6 w-6 mr-3 text-indigo-500" />,
  file: <FileText className="h-6 w-6 mr-3 text-gray-500" />,
}

const resourceTypeNames = {
  "book-presentation": "Kitap Sunumları",
  game: "Oyunlar", 
  summary: "Konu Özetleri",
  quiz: "Testler / Quizler",
  video: "Videolar",
  worksheet: "Çalışma Kağıtları",
  file: "Dosyalar",
}

// Özel kategori görüntüleme bileşenleri
function DocumentsView() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Evrak kategorileri tanımla
  const documentCategories = [
    { id: 'planlar', name: 'PLANLAR', icon: '📋', color: 'bg-blue-500' },
    { id: 'zumre-tutanaklari', name: 'ZÜMRE TUTANAKLARI', icon: '📝', color: 'bg-green-500' },
    { id: 'sok-tutanaklari', name: 'ŞÖK TUTANAKLARI', icon: '📊', color: 'bg-purple-500' },
    { id: 'veli-toplanti-tutanaklari', name: 'VELİ TOPLANTI TUTANAKLARI', icon: '👥', color: 'bg-orange-500' },
    { id: 'dyk-planlari', name: 'DYK PLANLARI', icon: '⚡', color: 'bg-red-500' },
    { id: 'hazir-bulunusluk-sinavlari', name: 'HAZIR BULUNUŞLUK SINAVLARI', icon: '📋', color: 'bg-indigo-500' }
  ]

  useEffect(() => {
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        setDocuments(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>
  }

  // Kategori seçimi olmadığında kategori listesi göster
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-800">📄 Evraklar</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentCategories.map((category) => {
            const categoryDocuments = documents.filter(doc => 
              doc.document_type === category.id || 
              doc.category === category.id
            )
            
            return (
              <Card 
                key={category.id} 
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-${category.color.replace('bg-', '')}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`${category.color} text-white p-2 rounded-lg`}>
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{category.name}</h3>
                      <p className="text-sm text-slate-500 font-normal">
                        {categoryDocuments.length} evrak
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Kategoriye gitmek için tıklayın</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Seçili kategori evraklarını göster
  const selectedCategoryData = documentCategories.find(cat => cat.id === selectedCategory)
  const filteredDocuments = documents.filter(doc => 
    doc.document_type === selectedCategory || 
    doc.category === selectedCategory
  )

  return (
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
          <div className={`${selectedCategoryData?.color} text-white p-2 rounded-lg`}>
            <span className="text-lg">{selectedCategoryData?.icon}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedCategoryData?.name}
            </h2>
            <p className="text-slate-500">{filteredDocuments.length} evrak</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {doc.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doc.description && (
                <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
              )}
              <div className="flex justify-between items-center">
                <Badge variant="secondary">{doc.document_type || selectedCategoryData?.name}</Badge>
                <Button
                  size="sm"
                  onClick={() => window.open(doc.file_url, '_blank')}
                  disabled={!doc.file_url}
                >
                  İndir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredDocuments.length === 0 && (
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
  )
}

function TeamMembersView() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/team-members')
      .then(res => res.json())
      .then(data => {
        setMembers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">👥 ELT Arena Ekibi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle>{member.name}</CardTitle>
              <Badge variant="secondary">{member.position}</Badge>
            </CardHeader>
            <CardContent>
              {member.photo_url && (
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              {member.bio && (
                <p className="text-sm text-gray-600 mb-2">{member.bio}</p>
              )}
              {member.email && (
                <p className="text-sm text-blue-600">{member.email}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {members.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-slate-500">Henüz ekip üyesi eklenmemiş.</p>
        </div>
      )}
    </div>
  )
}

function ContactInfoView() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/contact-info')
      .then(res => res.json())
      .then(data => {
        setContacts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleContactClick = (contact: any) => {
    let url = contact.content
    
    // URL formatını kontrol et ve düzelt
    if (contact.type === 'instagram') {
      if (!url.startsWith('http')) {
        // Instagram kullanıcı adı veya profil linki ise
        if (url.startsWith('@')) {
          url = `https://instagram.com/${url.substring(1)}`
        } else if (url.includes('instagram.com')) {
          url = url.startsWith('http') ? url : `https://${url}`
        } else {
          url = `https://instagram.com/${url}`
        }
      }
    } else if (contact.type === 'facebook') {
      if (!url.startsWith('http')) {
        if (url.includes('facebook.com')) {
          url = url.startsWith('http') ? url : `https://${url}`
        } else {
          url = `https://facebook.com/${url}`
        }
      }
    } else if (contact.type === 'email') {
      if (!url.startsWith('mailto:')) {
        url = `mailto:${url}`
      }
    }
    
    window.open(url, '_blank')
  }

  if (loading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800">📞 Bize Ulaşın</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((contact) => (
          <Card 
            key={contact.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => handleContactClick(contact)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {contact.icon} {contact.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-blue-600 hover:text-blue-800">
                {contact.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {contacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-slate-500">Henüz iletişim bilgisi eklenmemiş.</p>
        </div>
      )}
    </div>
  )
}

export function EducationDashboard() {
  const { grades, loading, refreshGrades } = useData()
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  // Açık kategorileri takip etmek için state - İlk kategoriyi default olarak aç
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && grades.length > 0 && !selectedGradeId) {
      // İlk sınıfı seç ve o kategorisini aç
      const firstGrade = grades[0]
      setSelectedGradeId(firstGrade.id)
      setOpenCategories(new Set([firstGrade.category]))
    }
  }, [grades, loading, selectedGradeId])

  const selectedGrade = useMemo(() => grades.find((g) => g.id === selectedGradeId), [grades, selectedGradeId])
  const selectedUnit = useMemo(
    () => selectedGrade?.units.find((u) => u.id === selectedUnitId),
    [selectedGrade, selectedUnitId],
  )

  const groupedGrades = useMemo(() => {
    const grouped = grades.reduce(
      (acc, grade) => {
        let category = grade.category
        // Kategori ismini aynen kullan
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(grade)
        return acc
      },
      {} as Record<string, Grade[]>,
    )

    // Her kategorideki sınıfları sırala
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => {
        const aNum = Number.parseInt(a.id.replace(/[^0-9]/g, ""))
        const bNum = Number.parseInt(b.id.replace(/[^0-9]/g, ""))
        return aNum - bNum
      })
    })

    return grouped
  }, [grades])

  // Seçili ünite ve kaynak türüne göre materyalleri filtrele
  const filteredResources = useMemo(() => {
    if (!selectedUnit || !selectedResourceType) return []
    return selectedUnit.resources.filter((resource) => resource.type === selectedResourceType)
  }, [selectedUnit, selectedResourceType])

  // Seçili ünitedeki kaynak türlerini grupla
  const resourceTypeGroups = useMemo(() => {
    if (!selectedUnit) return {}

    const groups: Record<ResourceType, Resource[]> = {
      'book-presentation': [],
      game: [],
      summary: [],
      quiz: [],
      video: [],
      worksheet: [],
      file: [],
    }

    selectedUnit.resources.forEach((resource) => {
      groups[resource.type].push(resource)
    })

    // Boş olmayan grupları döndür
    return Object.fromEntries(Object.entries(groups).filter(([, resources]) => resources.length > 0)) as Record<
      ResourceType,
      Resource[]
    >
  }, [selectedUnit])

  const handleBackToGrade = () => {
    setSelectedUnitId(null)
    setSelectedResourceType(null)
  }

  const handleBackToUnit = () => {
    setSelectedResourceType(null)
  }

  const handleUnitClick = (unitId: number) => {
    setSelectedUnitId(unitId)
    setSelectedResourceType(null)
  }

  const handleResourceTypeClick = (type: ResourceType) => {
    setSelectedResourceType(type)
  }

  const handleGradeClick = (gradeId: string) => {
    setSelectedGradeId(gradeId)
    setSelectedUnitId(null)
    setSelectedResourceType(null)
  }

  const toggleCategory = (category: string) => {
    const newOpenCategories = new Set(openCategories)
    if (newOpenCategories.has(category)) {
      newOpenCategories.delete(category)
    } else {
      newOpenCategories.add(category)
    }
    setOpenCategories(newOpenCategories)
  }

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full font-sans">
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex-shrink-0 overflow-y-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-2" />
                <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-8 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full font-sans">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex-shrink-0 overflow-y-auto flex flex-col">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            {" "}
            {/* mb azaltıldı */}
            <div className="flex items-center gap-2">
              <img 
                src="/elt-arena-logo.png" 
                alt="ELT Arena Logo" 
                className="h-16 w-auto"
                onError={(e) => {
                  // Fallback to text if logo fails to load
                  e.currentTarget.style.display = 'none';
                  const fallbackText = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallbackText) {
                    fallbackText.classList.remove('hidden');
                  }
                }}
              />
              <h1 className="text-2xl font-bold text-slate-800 hidden">ELT Arena</h1>
            </div>
          </div>
          {/* Slogan ayrı bir paragraf olarak eklendi */}
          <p className="text-sm text-slate-600 mb-6">İngilizce Öğretmenlerinin Buluşma Noktası</p>
          <nav className="space-y-2">
            {categoryOrder.map((category) => {
              const gradesInCategory = groupedGrades[category] || []
              if (gradesInCategory.length === 0) return null

              // Özel kategoriler için direkt tıklama davranışı
              const isSpecialCategory = ["Evraklar", "ELT Arena Ekibi", "Bize Ulaşın"].includes(category)
              const isOpen = openCategories.has(category)
              const hasSelectedGrade = gradesInCategory.some((grade) => grade.id === selectedGradeId)

              return (
                <div key={category}>
                  {/* Kategori Başlığı - Özel kategoriler için direkt grade seçimi */}
                  <button
                    onClick={() => {
                      if (isSpecialCategory) {
                        // Özel kategoriler için direkt grade'i seç
                        const specialGrade = gradesInCategory[0] // Bu kategorilerde sadece 1 grade olacak
                        if (specialGrade) {
                          handleGradeClick(specialGrade.id)
                        }
                      } else {
                        // Normal kategoriler için accordion davranışı
                        toggleCategory(category)
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors hover:bg-slate-100 ${
                      hasSelectedGrade ? "bg-slate-50" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{category}</span>
                    </div>
                    {/* Özel kategoriler için ok ikonu gösterme */}
                    {!isSpecialCategory && (
                      isOpen ? (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      )
                    )}
                  </button>

                  {/* Sınıflar Listesi - Sadece normal kategoriler için */}
                  {!isSpecialCategory && isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                      {gradesInCategory.map((grade) => (
                        <Button
                          key={grade.id}
                          variant={selectedGradeId === grade.id ? "secondary" : "ghost"}
                          className="w-full justify-start text-sm py-2 h-auto"
                          onClick={() => handleGradeClick(grade.id)}
                        >
                          {/* Yabancı Dil kategorisi altındaki sınıflar için sadece sınıf numarasını göster */}
                          {category === "Yabancı Dil" ? grade.title.replace(" (Yabancı Dil)", "") : grade.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">Türkçe Eğitim Portalı v1.0</p>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-8">
        {/* Kaynak listesi görünümü */}
        {selectedUnit && selectedResourceType ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" onClick={handleBackToUnit}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-3xl font-bold text-slate-800">
                  {selectedUnit.title} - {resourceTypeNames[selectedResourceType]}
                </h2>
                <p className="text-slate-600">{filteredResources.length} materyal bulundu</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {resourceIcons[resource.type]}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">{resource.title}</h3>
                      {resource.description && <p className="text-slate-600 text-sm mb-4">{resource.description}</p>}
                      {resource.fileUrl && <p className="text-xs text-green-600 mb-2">✓ Bulutta saklanıyor</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {resource.type === "book-presentation" ? (
                      <>
                        {resource.previewLink && (
                          <Button onClick={() => setSelectedResource(resource)} className="flex-1">
                            Önizleme
                          </Button>
                        )}
                        {resource.downloadLink && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(resource.downloadLink, "_blank")}
                            className="flex-1"
                          >
                            İndir
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button onClick={() => setSelectedResource(resource)} className="w-full">
                        Aç
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-slate-500">Bu kategoride materyal bulunmuyor.</p>
              </div>
            )}
          </div>
        ) : selectedUnit ? (
          /* Kaynak türü seçimi görünümü */
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" onClick={handleBackToGrade}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-3xl font-bold text-slate-800">{selectedUnit.title}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(resourceTypeGroups).map(([type, resources]) => (
                <button
                  key={type}
                  onClick={() => handleResourceTypeClick(type as ResourceType)}
                  className="p-6 bg-white hover:bg-sky-50 border border-slate-200 rounded-lg text-left transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center mb-3">
                    {resourceIcons[type as ResourceType]}
                    <h3 className="text-xl font-semibold text-slate-800">{resourceTypeNames[type as ResourceType]}</h3>
                  </div>
                  <p className="text-slate-600">{(resources as Resource[]).length} materyal</p>
                </button>
              ))}
            </div>

            {Object.keys(resourceTypeGroups).length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-slate-500">Bu ünite için henüz materyal eklenmemiş.</p>
              </div>
            )}
          </div>
        ) : selectedGrade ? (
          /* Özel kategoriler ve ünite görünümü */
          <div className="space-y-8">
            {selectedGrade.id === "evraklar" ? (
              <DocumentsView />
            ) : selectedGrade.id === "elt-ekibi" ? (
              <TeamMembersView />
            ) : selectedGrade.id === "bize-ulasin" ? (
              <ContactInfoView />
            ) : (
              /* Normal ünite seçimi görünümü */
              <>
                <h2 className="text-3xl font-bold text-slate-800">{selectedGrade.title} Üniteleri</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedGrade.units.map((unit) => {
                    const resourceCount = unit.resources.length
                    return (
                      <button
                        key={unit.id}
                        onClick={() => handleUnitClick(unit.id)}
                        className="p-6 bg-white hover:bg-sky-50 border border-slate-200 rounded-lg text-left transition-colors duration-200 shadow-sm hover:shadow-md"
                      >
                        <h3 className="text-xl font-semibold mb-2 text-slate-800">{unit.title}</h3>
                        <p className="text-slate-600">{resourceCount} materyal</p>
                      </button>
                    )
                  })}
                </div>

                {selectedGrade.units.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-xl text-slate-500">Bu sınıf için henüz ünite eklenmemiş.</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-slate-500">Lütfen bir sınıf seçiniz.</p>
          </div>
        )}
      </main>

      {selectedResource && (
        <div>
          <ResourceViewer resource={selectedResource} onClose={() => setSelectedResource(null)} />
        </div>
      )}
    </div>
  )
}
