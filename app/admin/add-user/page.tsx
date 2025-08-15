"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, UserPlus, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AddUserPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  // Admin yetkisi kontrolü
  useEffect(() => {
    const checkAdminAuth = () => {
      if (typeof window === "undefined") return

      const token = localStorage.getItem("admin_token")
      if (!token) {
        window.location.href = "/admin/login"
        return
      }

      try {
        const parts = token.split('.')
        if (parts.length !== 3) {
          window.location.href = "/admin/login"
          return
        }

        const payload = JSON.parse(atob(parts[1]))
        if (payload.username !== 'admin') {
          // Admin değilse ana panele yönlendir
          window.location.href = "/admin"
          return
        }

        setIsAuthorized(true)
      } catch (e) {
        window.location.href = "/admin/login"
      } finally {
        setChecking(false)
      }
    }

    checkAdminAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch('/api/admin/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Yeni kullanıcı başarıyla eklendi"
        })
        setFormData({
          username: '',
          password: '',
          full_name: ''
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Kullanıcı eklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Kullanıcı eklenirken bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    window.location.href = "/admin"
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yetki kontrolü yapılıyor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Redirect edilecek
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goBack}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Kullanıcı Ekle</h1>
            <p className="text-gray-600">Admin paneline yeni kullanıcı ekleyin</p>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Kullanıcı Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Kullanıcı Adı <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="ornek.kullanici"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Ad Soyad
                  </label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Örnek Kullanıcı"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Güçlü bir şifre girin"
                    required
                    className="w-full pr-10"
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
                <p className="text-xs text-gray-500 mt-1">
                  En az 6 karakter uzunluğunda olmalıdır
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.username || !formData.password}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Ekleniyor..." : "Kullanıcı Ekle"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}