import { NextResponse, NextRequest } from 'next/server'
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
    const { name, position, bio, email, photo_url } = await request.json()
    
    if (!name || !position) {
      return NextResponse.json(
        { error: 'İsim ve pozisyon alanları gereklidir' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO team_members (name, position, bio, email, photo_url) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, position, bio || null, email || null, photo_url || null]
    )
    
    return NextResponse.json({
      success: true,
      member: result.rows[0]
    })
    
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: 'Ekip üyesi oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
