import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements, getActiveAnnouncements } from '@/lib/database'
import { query } from '@/lib/postgresql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    const announcements = activeOnly 
      ? await getActiveAnnouncements()
      : await getAnnouncements()
      
    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Announcements API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, type, is_active, image_url, created_by } = await request.json()
    
    if (!title || !content || !created_by) {
      return NextResponse.json(
        { error: 'Başlık, içerik ve oluşturan kişi alanları gereklidir' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO announcements (title, content, type, is_active, image_url, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, content, type || 'announcement', is_active || false, image_url || null, created_by]
    )
    
    return NextResponse.json({
      success: true,
      announcement: result.rows[0]
    })
    
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { error: 'Duyuru oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
