"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Upload } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { toast } from "@/hooks/use-toast"

interface TeamMember {
  id: number
  name: string
  position: string
  bio: string
  photo_url: string | null
  email: string | null
  created_at: string
  updated_at: string
}

interface UploadedFile {
  file: File
  url: string
  path: string
  type: string
  preview?: string
}

export function AdminTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    email: '',
    photo_url: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/admin/team-members')
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast({
        title: "Hata",
        description: "Ekip üyeleri yüklenirken bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    if (files.length > 0) {
      const firstFile = files[0]
      setFormData({ ...formData, photo_url: firstFile.url })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Yüklenen dosya varsa onun URL'ini kullan
      const submitData = {
        ...formData,
        photo_url: uploadedFiles.length > 0 ? uploadedFiles[0].url : formData.photo_url
      }
      
      const url = editingMember ? `/api/admin/team-members/${editingMember.id}` : '/api/admin/team-members'
      const method = editingMember ? 'PUT' : 'POST'
      
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
          description: editingMember ? "Ekip üyesi güncellendi" : "Yeni ekip üyesi eklendi"
        })
        fetchTeamMembers()
        setDialogOpen(false)
        resetForm()
      } else {
        throw new Error('İşlem başarısız')
      }
    } catch (error) {
      console.error('Error saving team member:', error)
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ekip üyesini silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/team-members/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Ekip üyesi silindi"
        })
        fetchTeamMembers()
      } else {
        throw new Error('Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Error deleting team member:', error)
      toast({
        title: "Hata",
        description: "Silme işlemi sırasında bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      email: member.email || '',
      photo_url: member.photo_url || ''
    })
    setUploadedFiles([])
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingMember(null)
    setFormData({
      name: '',
      position: '',
      bio: '',
      email: '',
      photo_url: ''
    })
    setUploadedFiles([])
  }

  if (loading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ELT Arena Ekibi</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ekip Üyesi
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Ekip Üyesini Düzenle' : 'Yeni Ekip Üyesi Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Ad Soyad</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Ahmet Yılmaz"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Pozisyon</label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Örn: İçerik Geliştirme Uzmanı"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">E-posta</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@eltarena.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fotoğraf</label>
                <div className="space-y-3">
                  <FileUpload
                    onFilesUploaded={handleFilesUploaded}
                    maxFiles={1}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Upload className="h-4 w-4" />
                      <span>✓ {uploadedFiles[0].file.name} yüklendi</span>
                    </div>
                  )}
                  {formData.photo_url && uploadedFiles.length === 0 && (
                    <div className="text-xs text-gray-500">
                      Mevcut fotoğraf: {formData.photo_url}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    JPG, PNG, WebP veya GIF formatında fotoğraf yükleyebilirsiniz
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Biyografi</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Kısa biyografi..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingMember ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {member.position}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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

      {teamMembers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Henüz ekip üyesi eklenmemiş
        </div>
      )}
    </div>
  )
}
