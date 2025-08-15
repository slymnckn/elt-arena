"use client"

import { useState, useMemo } from "react"
import { AdminDashboard as OriginalAdminDashboard } from "./admin-dashboard"
import { AdminTeamMembers } from "./admin-team-members"
import { AdminContactInfo } from "./admin-contact-info"
import { AdminDocuments } from "./admin-documents"
import { AdminAnnouncements } from "./admin-announcements"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, RefreshCw, Home, UserPlus } from "lucide-react"

type AdminSection = "resources" | "team" | "contact" | "documents" | "announcements"

export function AdminDashboardTabs() {
  const [activeTab, setActiveTab] = useState<AdminSection>("resources")

  // Mevcut kullanıcının admin olup olmadığını kontrol et
  const isAdmin = useMemo(() => {
    if (typeof window === "undefined") return false
    const token = localStorage.getItem("admin_token")
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length !== 3) return false
        const payload = JSON.parse(atob(parts[1]))
        return payload.username === 'admin'
      } catch (e) {
        return false
      }
    }
    return false
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    window.location.href = "/admin/login"
  }

  const handleAddUser = () => {
    window.location.href = "/admin/add-user"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-white to-slate-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <img 
                    src="/elt-arena-logo.png" 
                    alt="ELT Arena Logo" 
                    className="h-12 w-auto object-contain drop-shadow-sm"
                  />
                </div>
                <div className="border-l border-slate-200 pl-6">
                  <h1 className="text-xl font-semibold text-slate-700 mb-1">Admin Paneli</h1>
                  <p className="text-sm text-slate-500">Yönetim ve Kontrol Merkezi</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={handleAddUser}
                    className="hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Kullanıcı Ekle
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = "/"}
                  className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                >
                  <Home className="mr-2 h-4 w-4" />
                  ELT Arena
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AdminSection)}>
          <div className="bg-white rounded-lg p-2 shadow-sm border mb-6">
            <TabsList className="grid w-full grid-cols-5 bg-slate-50 h-12 rounded-lg p-1">
              <TabsTrigger 
                value="resources" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50"
              >
                <span className="text-base">📚</span>
                <span className="hidden sm:inline">Materyaller</span>
                <span className="sm:hidden">Materyal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="announcements"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50"
              >
                <span className="text-base">📢</span>
                <span className="hidden sm:inline">Duyurular</span>
                <span className="sm:hidden">Duyuru</span>
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50"
              >
                <span className="text-base">📄</span>
                <span className="hidden sm:inline">Evraklar</span>
                <span className="sm:hidden">Evrak</span>
              </TabsTrigger>
              <TabsTrigger 
                value="team"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50"
              >
                <span className="text-base">👥</span>
                <span className="hidden sm:inline">ELT Arena Ekibi</span>
                <span className="sm:hidden">Ekip</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contact"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50"
              >
                <span className="text-base">📞</span>
                <span className="hidden sm:inline">Bize Ulaşın</span>
                <span className="sm:hidden">İletişim</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <OriginalAdminDashboard />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="announcements" className="mt-6">
            <AdminAnnouncements />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <AdminDocuments />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <AdminTeamMembers />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <AdminContactInfo />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
