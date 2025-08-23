import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgresql'

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM contact_info ORDER BY order_index ASC, id ASC',
      []
    )
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: 'İletişim bilgileri getirilirken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, content, icon, order_index } = body

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Tür, başlık ve içerik alanları zorunludur' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO contact_info (type, title, content, icon, order_index) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [type, title, content, icon || null, order_index || 0]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating contact info:', error)
    return NextResponse.json(
      { error: 'İletişim bilgisi eklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
