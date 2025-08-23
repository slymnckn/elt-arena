import { type NextRequest, NextResponse } from "next/server"
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// GET /api/storage/serve?file=<relativePath> - Universal File Serving Endpoint
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const fileParam = searchParams.get("file")
    const download = searchParams.get("download") === "true"
    
    if (!fileParam) {
      return NextResponse.json({ 
        error: "File parameter is required" 
      }, { status: 400 })
    }

    // Security: Remove path traversal attempts
    const safePath = fileParam
      .replace(/\.\./g, '')
      .replace(/^\/+/, '')
    
    // Construct full file path
    const fullPath = path.join(process.cwd(), 'public', 'uploads', safePath)
    
    // Additional security check
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!path.resolve(fullPath).startsWith(path.resolve(uploadsDir))) {
      return NextResponse.json({ 
        error: "Access denied" 
      }, { status: 403 })
    }
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ 
        error: "File not found" 
      }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(fullPath)
    
    // Get MIME type
    const ext = path.extname(fullPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.txt': 'text/plain',
      '.zip': 'application/zip'
    }
    
    const contentType = mimeTypes[ext] || 'application/octet-stream'
    const fileName = path.basename(fullPath)
    
    // Set headers
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600',
    }
    
    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${fileName}"`
    } else {
      headers['Content-Disposition'] = `inline; filename="${fileName}"`
    }
    
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      status: 200,
      headers,
    })
    
  } catch (error) {
    console.error('File serving error:', error)
    return NextResponse.json({ 
      error: "Failed to serve file"
    }, { status: 500 })
  }
}
