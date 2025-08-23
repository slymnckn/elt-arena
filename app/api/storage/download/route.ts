import { type NextRequest, NextResponse } from "next/server"
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// GET /api/storage/download?file=<relativePath> - File Download Endpoint
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const fileParam = searchParams.get("file")
    
    if (!fileParam) {
      return NextResponse.json({ 
        error: "File parameter is required" 
      }, { status: 400 })
    }

    // Security: Remove any path traversal attempts
    const safePath = fileParam.replace(/\.\./g, '').replace(/^\/+/, '')
    
    // Construct full file path
    const fullPath = path.join(process.cwd(), 'public', 'uploads', safePath)
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ 
        error: "File not found" 
      }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(fullPath)
    
    // Get file extension to determine MIME type
    const ext = path.extname(fullPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav'
    }
    
    const contentType = mimeTypes[ext] || 'application/octet-stream'
    const fileName = path.basename(fullPath)
    
    // Return file with download headers
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ 
      error: "Failed to download file" 
    }, { status: 500 })
  }
}
