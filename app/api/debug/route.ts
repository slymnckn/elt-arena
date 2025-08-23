import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/postgresql'

export async function GET() {
  try {
    // Database bağlantısını test et
    const connectionTest = await query('SELECT 1 as connected')
    
    // Tabloların varlığını kontrol et
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('grades', 'units', 'resources')
      ORDER BY table_name
    `)
    
    // Her tablodaki satır sayısını kontrol et
    const gradeCount = await query('SELECT COUNT(*) as count FROM grades')
    const unitCount = await query('SELECT COUNT(*) as count FROM units') 
    const resourceCount = await query('SELECT COUNT(*) as count FROM resources')
    
    // Örnek grades verisi
    const sampleGrades = await query('SELECT id, title, category FROM grades LIMIT 5')
    
    return NextResponse.json({
      status: 'success',
      connection: connectionTest.rows[0],
      tables: tablesResult.rows,
      counts: {
        grades: gradeCount.rows[0].count,
        units: unitCount.rows[0].count,
        resources: resourceCount.rows[0].count,
      },
      sampleGrades: sampleGrades.rows,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
