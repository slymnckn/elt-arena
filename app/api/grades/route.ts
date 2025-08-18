import { NextRequest, NextResponse } from 'next/server'
import { getGrades } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Grades API: Starting request...')
    console.log('🔍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL || '[NOT SET]',
      DATABASE_HOST: process.env.DATABASE_HOST || '[NOT SET]'
    })
    const grades = await getGrades()
    console.log('🔍 Grades API: Query result:', { 
      count: grades?.length || 0, 
      sample: grades?.slice(0, 2) || [] 
    })
    return NextResponse.json(grades, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Grades API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grades' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
}
