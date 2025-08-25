import { type NextRequest, NextResponse } from "next/server"
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// GET /api/uploads/[...path] - File Serving Endpoint
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params
    const download = req.nextUrl.searchParams.get("download") === "true"
    const filePath = pathArray.join('/')
    
    console.log('🔍 File Serve Debug:', {
      url: req.url,
      pathArray,
      filePath,
      download
    })
    
    if (!filePath) {
      console.log('❌ File path is missing')
      return NextResponse.json({ 
        error: "File path is required" 
      }, { status: 400 })
    }

    // Security: Remove path traversal attempts
    const safePath = filePath
      .replace(/\.\./g, '')
      .replace(/^\/+/, '')
    
    // Construct full file path - relative to public/uploads
    const fullPath = path.join('./public/uploads', safePath)
    
    // Additional security check
    const uploadsDir = path.resolve('./public/uploads')
    if (!path.resolve(fullPath).startsWith(uploadsDir)) {
      return NextResponse.json({ 
        error: "Access denied" 
      }, { status: 403 })
    }

    console.log('📂 Full file path:', fullPath)

    if (!existsSync(fullPath)) {
      console.log('❌ File not found:', fullPath)
      return NextResponse.json({ 
        error: "File not found",
        path: fullPath 
      }, { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(fullPath)
    
    // Determine content type based on file extension
    const ext = path.extname(safePath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }
    
    contentType = mimeTypes[ext] || contentType

    console.log('📄 Serving file:', {
      path: safePath,
      size: fileBuffer.length,
      contentType,
      download
    })

    // Create response with proper headers
    const response = new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    })

    // Set download headers if requested
    if (download) {
      const fileName = path.basename(safePath)
      response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`)
    } else {
      // For preview, set inline disposition
      response.headers.set('Content-Disposition', 'inline')
    }

    return response

  } catch (error) {
    console.error('❌ File serve error:', error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
