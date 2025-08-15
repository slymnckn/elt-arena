"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, Edit, Trash2, User, CheckCircle, XCircle, RefreshCw } from "lucide-react"
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
import { AnnouncementForm } from "./announcement-form"
import { type Announcement } from "@/lib/database"

interface AdminUser {
  id: number
  full_name: string
}

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem("admin_token")
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length !== 3) {
          console.error("Geçersiz JWT token formatı")
          return null
        }
        const decoded = JSON.parse(atob(parts[1]))
        return String(decoded.userId)
      } catch (e) {
        console.error("Token çözümlenirken hata:", e)
        return null
      }
    }
    return null
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/announcements")
      if (!response.ok) throw new Error("Fetch failed")
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      console.error("Duyurular getirilirken hata:", error)
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleFormSubmit = async (data: Omit<Announcement, "id" | "created_at" | "updated_at" | "creatorName">) => {
    setIsSubmitting(true)
    try {
      if (editingAnnouncement) {
        // Update existing announcement
        const response = await fetch("/api/admin/announcements", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingAnnouncement.id,
            ...data,
            updatedBy: currentUserId || undefined
          })
        })
        if (!response.ok) throw new Error("Update failed")
      } else {
        // Add new announcement
        const response = await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            createdBy: currentUserId || undefined
          })
        })
        if (!response.ok) throw new Error("Add failed")
      }
      await fetchAnnouncements()
      setIsFormOpen(false)
      setEditingAnnouncement(null)
    } catch (error) {
      console.error("Duyuru kaydedilirken hata:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/announcements?id=${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Delete failed")
      await fetchAnnouncements()
    } catch (error) {
      console.error("Duyuru silinirken hata:", error)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Duyuru Yönetimi</h2>
        <div className="flex items-center gap-2">
          <Button onClick={fetchAnnouncements} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setEditingAnnouncement(null)
              setIsFormOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Duyuru Ekle
          </Button>
        </div>
      </div>

      <Card className="mb-6 relative z-10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mevcut Duyurular ({announcements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Başlık</TableHead>
                  <TableHead className="w-[40%]">İçerik</TableHead>
                  <TableHead>Aktif</TableHead>
                  <TableHead>Tek Seferlik</TableHead>
                  <TableHead>Oluşturan</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Henüz duyuru bulunmuyor.
                    </TableCell>
                  </TableRow>
                ) : (
                  announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell className="text-sm text-gray-600 line-clamp-2">{announcement.content}</TableCell>
                      <TableCell>
                        {announcement.is_active ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {announcement.display_once_per_session ? (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <User className="h-4 w-4" />
                          <span>{announcement.creatorName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingAnnouncement(announcement)
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
                                Bu duyuruyu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white border hover:bg-gray-50">İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(announcement.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {isFormOpen && (
          <AnnouncementForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editingAnnouncement}
            isSubmitting={isSubmitting}
          />
        )}
    </div>
  )
}
