import { NextRequest, NextResponse } from "next/server"
import { addResource, updateResource, deleteResource } from "@/lib/database"

// POST - Yeni resource ekle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("🔍 API POST data:", JSON.stringify(data, null, 2))
    
    const { unitId, createdBy, ...resourceData } = data
    
    if (!unitId) {
      console.log("❌ Unit ID eksik:", unitId)
      return NextResponse.json({ error: "Unit ID gerekli" }, { status: 400 })
    }
    
    if (!resourceData.title) {
      console.log("❌ Title eksik:", resourceData.title)
      return NextResponse.json({ error: "Title gerekli" }, { status: 400 })
    }
    
    if (!resourceData.type) {
      console.log("❌ Type eksik:", resourceData.type)
      return NextResponse.json({ error: "Type gerekli" }, { status: 400 })
    }
    
    console.log("📝 Resource ekleniyor:", { 
      unitId: parseInt(unitId), 
      resourceData: {
        ...resourceData,
        link: resourceData.link || null,
        previewLink: resourceData.previewLink || null,
        downloadLink: resourceData.downloadLink || null
      }, 
      createdBy 
    })
    
    const newResource = await addResource(parseInt(unitId), resourceData, createdBy)
    
    if (!newResource) {
      console.log("❌ addResource null döndü")
      return NextResponse.json({ error: "Resource eklenemedi - database hatası" }, { status: 400 })
    }
    
    console.log("✅ Resource başarıyla eklendi:", newResource)
    return NextResponse.json(newResource, { status: 201 })
  } catch (error) {
    console.error("Resources API POST error:", error)
    return NextResponse.json({ 
      error: "Resource eklenemedi", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

// PUT - Resource güncelle
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, updatedBy, ...resourceData } = data
    
    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 })
    }
    
    const updatedResource = await updateResource(id, resourceData)
    
    if (!updatedResource) {
      return NextResponse.json({ error: "Resource güncellenemedi" }, { status: 400 })
    }
    
    return NextResponse.json(updatedResource)
  } catch (error) {
    console.error("Resources API PUT error:", error)
    return NextResponse.json({ error: "Resource güncellenemedi" }, { status: 500 })
  }
}

// DELETE - Resource sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "ID gerekli" }, { status: 400 })
    }
    
    const success = await deleteResource(id)
    
    if (!success) {
      return NextResponse.json({ error: "Resource silinemedi" }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Resources API DELETE error:", error)
    return NextResponse.json({ error: "Resource silinemedi" }, { status: 500 })
  }
}
