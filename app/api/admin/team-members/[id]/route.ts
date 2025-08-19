import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgresql'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { name, position, bio, email, photo_url, order_index } = body
    const resolvedParams = await params
    const id = resolvedParams.id

    if (!name || !position) {
      return NextResponse.json(
        { error: 'Ad soyad ve pozisyon alanları zorunludur' },
        { status: 400 }
      )
    }

    const result = await query(
      `UPDATE team_members 
       SET name = $1, position = $2, bio = $3, email = $4, photo_url = $5, order_index = $6, updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [name, position, bio || null, email || null, photo_url || null, order_index || 0, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ekip üyesi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Ekip üyesi güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ DELETE team member request received')
    const resolvedParams = await params
    const id = resolvedParams.id
    console.log('🗑️ Deleting team member with ID:', id)

    const result = await query(
      'DELETE FROM team_members WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ekip üyesi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Ekip üyesi başarıyla silindi' })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Ekip üyesi silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
