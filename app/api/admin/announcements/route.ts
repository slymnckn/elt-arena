import { NextRequest, NextResponse } from "next/server"
import { getAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/database"

// GET - Tüm duyuruları getir
export async function GET() {
  try {
    const announcements = await getAnnouncements()
    return NextResponse.json(announcements)
  } catch (error) {
    console.error("Announcements API GET error:", error)
    return NextResponse.json({ error: "Duyurular alınamadı" }, { status: 500 })
  }
}

// POST - Yeni duyuru ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { createdBy, ...announcementData } = data
    
    const newAnnouncement = await addAnnouncement(announcementData, createdBy)
    
    if (!newAnnouncement) {
      return NextResponse.json({ error: "Duyuru eklenemedi" }, { status: 400 })
    }
    
    return NextResponse.json(newAnnouncement, { status: 201 })
  } catch (error) {
    console.error("Announcements API POST error:", error)
    return NextResponse.json({ error: "Duyuru eklenemedi" }, { status: 500 })
  }
}

// PUT - Duyuru güncelle
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, updatedBy, ...announcementData } = data
    
    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 })
    }
    
    const updatedAnnouncement = await updateAnnouncement(parseInt(id), announcementData, updatedBy)
    
    if (!updatedAnnouncement) {
      return NextResponse.json({ error: "Duyuru güncellenemedi" }, { status: 400 })
    }
    
    return NextResponse.json(updatedAnnouncement)
  } catch (error) {
    console.error("Announcements API PUT error:", error)
    return NextResponse.json({ error: "Duyuru güncellenemedi" }, { status: 500 })
  }
}

// DELETE - Duyuru sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 })
    }
    
    const success = await deleteAnnouncement(parseInt(id))
    
    if (!success) {
      return NextResponse.json({ error: "Duyuru silinemedi" }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Announcements API DELETE error:", error)
    return NextResponse.json({ error: "Duyuru silinemedi" }, { status: 500 })
  }
}
