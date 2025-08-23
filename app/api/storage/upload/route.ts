import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Allowed file types for security
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword', 'application/vnd.ms-powerpoint', 'application/vnd.ms-excel',
  'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav',
  'application/zip', 'application/x-rar-compressed'
]

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// POST  /api/storage/upload - Local File Storage Endpoint
// Body: FormData  { file: <File>, type?: <string> }
export async function POST(req: NextRequest) {
  try {
    // ----- 1. Parse form data -----
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string || "materials"
    
    if (!file) {
      return NextResponse.json({ 
        error: "No file provided" 
      }, { status: 400 })
    }

    // ----- 2. Validate file size -----
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // ----- 3. Validate file type -----
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `File type '${file.type}' not allowed` 
      }, { status: 400 })
    }

    // ----- 4. Determine upload directory based on type -----
    const allowedTypes = ["materials", "announcements", "images", "documents", "videos", "audio", "team-members"]
    const uploadType = allowedTypes.includes(type) ? type : "materials"
    
    console.log(`📁 Local Storage Upload: ${file.name} (${file.type}) → ${uploadType}/`)

    // ----- 5. Create safe filename -----
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).slice(2, 9)
    const fileName = `${timestamp}_${randomId}_${cleanName}`
    
    // ----- 6. Ensure upload directory exists -----
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', uploadType)
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
      console.log(`📂 Created directory: ${uploadsDir}`)
    }

    const filePath = path.join(uploadsDir, fileName)

    // ----- 7. Write file to local storage -----
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    
    console.log(`✅ File saved: ${filePath}`)

    // ----- 8. Return public URL -----
    const publicUrl = `/uploads/${uploadType}/${fileName}`
    
    return NextResponse.json({ 
      success: true,
      url: publicUrl, 
      path: `${uploadType}/${fileName}`,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    })
    
  } catch (err: any) {
    console.error("❌ Local storage upload error:", err)
    
    return NextResponse.json({ 
      error: "File upload failed", 
      details: err.message || "Unknown error"
    }, { status: 500 })
  }
}
