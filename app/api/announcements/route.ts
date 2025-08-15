import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements, getActiveAnnouncements } from '@/lib/database'

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
