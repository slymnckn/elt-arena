import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// POST  /api/storage/upload
// Body: FormData  { file: <File>, type?: <string> }
export async function POST(req: NextRequest) {
  try {
    // ----- 1. read the file -----
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string || "materials"
    
    if (!file) {
      return NextResponse.json({ error: "file field missing" }, { status: 400 })
    }

    // ----- 2. determine upload directory based on type -----
    const allowedTypes = ["materials", "announcements", "images", "documents", "videos", "audio"]
    const uploadType = allowedTypes.includes(type) ? type : "materials"

    // ----- 3. create unique name & path -----
    const ext = file.name.split(".").pop() ?? ""
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', uploadType)
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filePath = path.join(uploadsDir, fileName)

    // ----- 4. write file to local storage -----
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)

    // ----- 5. public URL -----
    const publicUrl = `/uploads/${uploadType}/${fileName}`
    return NextResponse.json({ url: publicUrl, path: `${uploadType}/${fileName}` })
  } catch (err) {
    console.error("api/storage/upload error:", err)
    return NextResponse.json({ error: "server error" }, { status: 500 })
  }
}
