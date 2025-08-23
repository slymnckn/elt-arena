"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { UserPlus, Edit, Trash2, Eye, EyeOff, RefreshCw, Search, Users } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AdminUser {
  id: string
  username: string
  full_name?: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ 
    username: "", 
    password: "", 
    email: "", 
    full_name: "" 
  })
  const [editId, setEditId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Mevcut kullanıcının admin olup olmadığını kontrol et
  const isAdmin = useMemo(() => {
    if (typeof window === "undefined") return false
    const token = localStorage.getItem("admin_token")
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length !== 3) return false
        const payload = JSON.parse(atob(parts[1]))
        const result = payload.username === 'admin'
        console.log('🔐 Admin check:', { username: payload.username, isAdmin: result })
        return result
      } catch (e) {
        console.error('Token decode error:', e)
        return false
      }
    }
    console.log('❌ No admin token found')
    return false
  }, [])

  // Token'ı al
  const getToken = () => {
    return localStorage.getItem("admin_token")
  }

  // Kullanıcıları yükle
  const loadUsers = async () => {
    setLoading(true)
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Hata",
          description: "Oturum bulunamadı",
          variant: "destructive"
        })
        return
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('👥 Admin users loaded:', data)
        setUsers(data)
      } else {
        const errorData = await response.json()
        console.error('❌ API error:', errorData)
        toast({
          title: "Hata",
          description: errorData.error || "Kullanıcılar yüklenirken hata oluştu",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Load users error:", error)
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenirken bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Kullanıcı sil
  const handleDelete = async (id: string, username: string) => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Hata",
          description: "Oturum bulunamadı",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`/api/admin/users/${id}`, { 
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== id))
        toast({
          title: "Başarılı",
          description: `${username} kullanıcısı silindi`
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Hata",
          description: errorData.error || "Kullanıcı silinirken hata oluştu",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Delete user error:", error)
      toast({
        title: "Hata",
        description: "Kullanıcı silinirken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  // Düzenleme için form aç
  const handleEdit = (user: AdminUser) => {
    setEditId(user.id)
    setFormData({ 
      username: user.username, 
      password: "", 
      email: user.email || "", 
      full_name: user.full_name || "" 
    })
    setShowForm(true)
  }

  // Form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Hata",
          description: "Oturum bulunamadı",
          variant: "destructive"
        })
        return
      }

      if (editId) {
        // Kullanıcı güncelle
        const updateData: any = {
          username: formData.username,
          email: formData.email || null,
          full_name: formData.full_name || formData.username
        }

        // Şifre varsa ekle
        if (formData.password) {
          updateData.password = formData.password
        }

        const response = await fetch(`/api/admin/users/${editId}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        })

        if (response.ok) {
          const updatedUser = await response.json()
          setUsers(users.map(u => u.id === editId ? updatedUser : u))
          toast({
            title: "Başarılı",
            description: "Kullanıcı bilgileri güncellendi"
          })
        } else {
          const errorData = await response.json()
          toast({
            title: "Hata",
            description: errorData.error || "Kullanıcı güncellenirken hata oluştu",
            variant: "destructive"
          })
        }
      } else {
        // Yeni kullanıcı ekle
        if (!formData.username || !formData.password) {
          toast({
            title: "Hata",
            description: "Kullanıcı adı ve şifre zorunludur",
            variant: "destructive"
          })
          return
        }

        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const newUser = await response.json()
          setUsers([newUser, ...users])
          toast({
            title: "Başarılı",
            description: "Yeni kullanıcı eklendi"
          })
        } else {
          const errorData = await response.json()
          toast({
            title: "Hata",
            description: errorData.error || "Kullanıcı eklenirken hata oluştu",
            variant: "destructive"
          })
        }
      }

      setShowForm(false)
      setEditId(null)
      setFormData({ username: "", password: "", email: "", full_name: "" })
    } catch (error) {
      console.error("Form submit error:", error)
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Form temizle
  const resetForm = () => {
    setShowForm(false)
    setEditId(null)
    setFormData({ username: "", password: "", email: "", full_name: "" })
    setShowPassword(false)
  }

  // Filtrelenmiş kullanıcılar
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    return users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [users, searchTerm])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Erişim Reddedildi</h3>
            <p className="text-gray-600">Bu sayfayı görüntülemek için admin yetkisi gereklidir.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Kullanıcı Yönetimi
          </h2>
          <p className="text-slate-600 mt-1">
            Admin paneli kullanıcılarını yönetin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadUsers}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditId(null); setFormData({ username: "", password: "", email: "", full_name: "" }) }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Kullanıcı Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border shadow-lg">
              <form onSubmit={handleFormSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editId ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
                  </DialogTitle>
                  <DialogDescription>
                    {editId ? "Kullanıcı bilgilerini güncelleyin" : "Admin paneli için yeni kullanıcı oluşturun"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Kullanıcı Adı <span className="text-red-500">*</span></Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="ornek.kullanici"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Ad Soyad</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Örnek Kullanıcı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Şifre {editId && <span className="text-gray-500 text-sm">(boş bırakılırsa değişmez)</span>}
                      {!editId && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Güçlü bir şifre girin"
                        required={!editId}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {!editId && (
                      <p className="text-xs text-gray-500">
                        En az 6 karakter uzunluğunda olmalıdır
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter className="gap-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Kaydediliyor..." : (editId ? "Güncelle" : "Ekle")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Arama */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kullanıcı adı, ad soyad veya e-posta ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kullanıcı Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kullanıcılar ({filteredUsers.length})</span>
            {searchTerm && (
              <Badge variant="secondary">
                {filteredUsers.length} / {users.length} sonuç
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {searchTerm ? "Kullanıcı bulunamadı" : "Henüz kullanıcı eklenmemiş"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? "Arama kriterlerinize uygun kullanıcı bulunamadı" 
                  : "Admin paneline ilk kullanıcıyı ekleyin"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  İlk Kullanıcıyı Ekle
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı Adı</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.full_name || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white border shadow-lg">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  <strong>{user.username}</strong> kullanıcısını silmek istediğinize emin misiniz? 
                                  Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user.id, user.username)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
