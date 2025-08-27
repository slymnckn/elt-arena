import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgresql'

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM documents ORDER BY order_index ASC, id ASC',
      []
    )
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Evraklar getirilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, document_type, file_url, file_name, file_size, order_index, source_type, external_url } = body

    // Source type validation
    const sourceType = source_type || 'file'
    
    if (!title || !document_type) {
      return NextResponse.json(
        { error: 'Başlık ve evrak türü alanları zorunludur' },
        { status: 400 }
      )
    }

    // Source type'a göre validasyon
    if (sourceType === 'file') {
      if (!file_url || !file_name) {
        return NextResponse.json(
          { error: 'Dosya yükleme için dosya URL ve dosya adı alanları zorunludur' },
          { status: 400 }
        )
      }
    } else if (sourceType === 'link') {
      if (!external_url) {
        return NextResponse.json(
          { error: 'Link ekleme için harici URL alanı zorunludur' },
          { status: 400 }
        )
      }
      // Link için URL validasyonu
      try {
        new URL(external_url)
      } catch {
        return NextResponse.json(
          { error: 'Geçerli bir URL formatı değil' },
          { status: 400 }
        )
      }
    }

    const result = await query(
      `INSERT INTO documents (title, description, document_type, file_url, file_name, file_size, order_index, source_type, external_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        title, 
        description || null, 
        document_type, 
        sourceType === 'link' ? external_url : file_url,
        sourceType === 'link' ? 'External Link' : file_name,
        sourceType === 'link' ? null : (file_size || null),
        order_index || 0,
        sourceType,
        sourceType === 'link' ? external_url : null
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Evrak eklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
