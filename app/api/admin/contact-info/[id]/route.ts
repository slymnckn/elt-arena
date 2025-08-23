import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgresql'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { type, title, content, icon, order_index } = body
    const resolvedParams = await params
    const id = resolvedParams.id

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Tür, başlık ve içerik alanları zorunludur' },
        { status: 400 }
      )
    }

    const result = await query(
      `UPDATE contact_info 
       SET type = $1, title = $2, content = $3, icon = $4, order_index = $5, updated_at = NOW()
       WHERE id = $6 
       RETURNING *`,
      [type, title, content, icon || null, order_index || 0, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'İletişim bilgisi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating contact info:', error)
    return NextResponse.json(
      { error: 'İletişim bilgisi güncellenirken hata oluştu' },
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
      'DELETE FROM contact_info WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'İletişim bilgisi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'İletişim bilgisi başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting contact info:', error)
    return NextResponse.json(
      { error: 'İletişim bilgisi silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
