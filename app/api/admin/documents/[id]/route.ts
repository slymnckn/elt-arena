import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgresql'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { title, description, document_type, file_url, file_name, file_size, order_index, source_type, external_url } = body
    const resolvedParams = await params
    const id = resolvedParams.id

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
          { error: 'Dosya evrakları için dosya URL ve dosya adı alanları zorunludur' },
          { status: 400 }
        )
      }
    } else if (sourceType === 'link') {
      if (!external_url) {
        return NextResponse.json(
          { error: 'Link evrakları için harici URL alanı zorunludur' },
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
      `UPDATE documents 
       SET title = $1, description = $2, document_type = $3, file_url = $4, file_name = $5, file_size = $6, order_index = $7, source_type = $8, external_url = $9, updated_at = NOW()
       WHERE id = $10 
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
        sourceType === 'link' ? external_url : null,
        id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evrak bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Evrak güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    const result = await query(
      'DELETE FROM documents WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evrak bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Evrak başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Evrak silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
