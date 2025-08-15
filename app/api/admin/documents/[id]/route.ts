import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgresql'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, document_type, file_url, file_name, file_size, order_index } = body
    const id = params.id

    if (!title || !document_type || !file_url || !file_name) {
      return NextResponse.json(
        { error: 'Başlık, evrak türü, dosya URL ve dosya adı alanları zorunludur' },
        { status: 400 }
      )
    }

    const result = await query(
      `UPDATE documents 
       SET title = $1, description = $2, document_type = $3, file_url = $4, file_name = $5, file_size = $6, order_index = $7, updated_at = NOW()
       WHERE id = $8 
       RETURNING *`,
      [title, description || null, document_type, file_url, file_name, file_size || null, order_index || 0, id]
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

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
