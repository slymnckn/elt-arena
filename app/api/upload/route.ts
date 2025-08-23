import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'general'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Dosya tipi kontrolü
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `File type ${file.type} not allowed` 
      }, { status: 400 })
    }

    // Dosya adını temizle ve unique yap
    const timestamp = Date.now()
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${cleanName}`
    
    // Upload klasörünü oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads', type)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadDir, fileName)
    
    await writeFile(filePath, buffer)
    
    // Public URL'i oluştur
    const publicUrl = `/uploads/${type}/${fileName}`
    
    console.log(`✅ File uploaded: ${publicUrl}`)
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: file.size,
      type: file.type
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed' 
    }, { status: 500 })
  }
}
