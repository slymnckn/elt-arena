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
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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

interface ContactInfo {
  id: number
  type: string
  title: string
  content: string
  icon: string | null
  created_at: string
  updated_at: string
}

const contactTypes = [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'email', label: 'E-posta', icon: '📧' }
]

export function AdminContactInfo() {
  const [contacts, setContacts] = useState<ContactInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(null)
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    content: '',
    icon: ''
  })

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/admin/contact-info')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast({
        title: "Hata",
        description: "İletişim bilgileri yüklenirken bir hata oluştu",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingContact ? `/api/admin/contact-info/${editingContact.id}` : '/api/admin/contact-info'
      const method = editingContact ? 'PUT' : 'POST'
      
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
          description: editingContact ? "İletişim bilgisi güncellendi" : "Yeni iletişim bilgisi eklendi"
        })
        fetchContacts()
        setDialogOpen(false)
        resetForm()
      } else {
        throw new Error('İşlem başarısız')
      }
    } catch (error) {
      console.error('Error saving contact:', error)
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu iletişim bilgisini silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/contact-info/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "İletişim bilgisi silindi"
        })
        fetchContacts()
      } else {
        throw new Error('Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast({
        title: "Hata",
        description: "Silme işlemi sırasında bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (contact: ContactInfo) => {
    setEditingContact(contact)
    setFormData({
      type: contact.type,
      title: contact.title,
      content: contact.content,
      icon: contact.icon || ''
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingContact(null)
    setFormData({
      type: '',
      title: '',
      content: '',
      icon: ''
    })
  }

  const handleTypeChange = (type: string) => {
    const selectedType = contactTypes.find(t => t.value === type)
    setFormData({
      ...formData,
      type,
      title: selectedType?.label || '',
      icon: selectedType?.icon || ''
    })
  }

  if (loading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bize Ulaşın</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni İletişim Bilgisi
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="sm:max-w-[500px]"
            onPointerDownOutside={(e) => {
              const target = e.target as Element
              if (target.closest('[data-radix-select-content]')) {
                e.preventDefault()
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'İletişim Bilgisini Düzenle' : 'Yeni İletişim Bilgisi Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Tür</label>
                <Select value={formData.type} onValueChange={handleTypeChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="İletişim türünü seçin" />
                  </SelectTrigger>
                  <CustomSelectContent className="bg-white border shadow-2xl min-w-[200px] max-h-60 overflow-auto">
                    {contactTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span style={{fontFamily:'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif'}}>{type.icon || '☎️'}</span> {type.label}
                      </SelectItem>
                    ))}
                  </CustomSelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Başlık</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: E-posta"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">İçerik</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Örn: info@eltarena.com"
                  required
                  rows={2}
                />
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Icon</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Örn: 📧"
                  style={{fontFamily:'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif'}}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingContact ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {contact.icon} {contact.title}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {contactTypes.find(t => t.value === contact.type)?.label || contact.type}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(contact)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-2">{contact.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Henüz iletişim bilgisi eklenmemiş
        </div>
      )}
    </div>
  )
}
