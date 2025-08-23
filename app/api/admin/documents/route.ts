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
    const { title, description, document_type, file_url, file_name, file_size, order_index } = body

    if (!title || !document_type || !file_url || !file_name) {
      return NextResponse.json(
        { error: 'Başlık, evrak türü, dosya URL ve dosya adı alanları zorunludur' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO documents (title, description, document_type, file_url, file_name, file_size, order_index) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [title, description || null, document_type, file_url, file_name, file_size || null, order_index || 0]
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
