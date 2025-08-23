import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgresql'

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM team_members ORDER BY order_index ASC, id ASC',
      []
    )
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Ekip üyeleri getirilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, position, bio, email, photo_url, order_index } = body

    if (!name || !position) {
      return NextResponse.json(
        { error: 'Ad soyad ve pozisyon alanları zorunludur' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO team_members (name, position, bio, email, photo_url, order_index) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, position, bio || null, email || null, photo_url || null, order_index || 0]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: 'Ekip üyesi eklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
