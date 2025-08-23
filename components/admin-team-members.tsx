"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { toast } from "@/hooks/use-toast"
import { resolveFileUrl } from "@/lib/utils"

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

export function AdminTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    email: '',
    photo_url: ''
  })

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team-members')
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

  const handleImageUploaded = (imageUrl: string) => {
    setFormData({ ...formData, photo_url: imageUrl })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const url = editingMember ? `/api/admin/team-members/${editingMember.id}` : '/api/team-members'
      const method = editingMember ? 'PUT' : 'POST'
      
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
          description: editingMember ? "Ekip üyesi güncellendi" : "Yeni ekip üyesi eklendi"
        })
        fetchTeamMembers()
        setDialogOpen(false)
        resetForm()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Error submitting:', error)
      toast({
        title: "Hata", 
        description: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ekip üyesini silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/team-members/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Ekip üyesi silindi"
        })
        fetchTeamMembers()
      }
    } catch (error) {
      console.error('Error deleting:', error)
      toast({
        title: "Hata",
        description: "Silme işlemi başarısız",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      bio: '',
      email: '',
      photo_url: ''
    })
    setEditingMember(null)
  }

  const openAddDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (member: TeamMember) => {
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio || '',
      email: member.email || '',
      photo_url: member.photo_url || ''
    })
    setEditingMember(member)
    setDialogOpen(true)
  }

  if (loading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ekip Üyeleri</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Ekip Üyesi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Ekip Üyesi Düzenle' : 'Yeni Ekip Üyesi'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Profil Fotoğrafı</label>
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  currentImage={formData.photo_url}
                  uploadType="team-members"
                  maxSize={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">İsim *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="İsim Soyisim"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Pozisyon *</label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="İngilizce Öğretmeni"
                  required
                />
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
                <label className="text-sm font-medium">Biyografi</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Kısa biyografi..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Kaydediliyor...' : (editingMember ? 'Güncelle' : 'Ekle')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {member.photo_url && (
                    <img
                      src={resolveFileUrl(member.photo_url)}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {member.position}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Henüz ekip üyesi eklenmemiş.</p>
          <Button className="mt-4" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            İlk Ekip Üyesini Ekle
          </Button>
        </div>
      )}
    </div>
  )
}
