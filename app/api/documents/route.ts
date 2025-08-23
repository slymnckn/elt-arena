import { NextResponse } from 'next/server'
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
