import { NextRequest, NextResponse } from 'next/server'
import { getGrades } from '@/lib/database'

export async function GET() {
  try {
    const grades = await getGrades()
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
