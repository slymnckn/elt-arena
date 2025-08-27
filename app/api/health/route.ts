import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basit health check - uygulama çalışıyor mu?
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Application health check failed'
      },
      { status: 500 }
    )
  }
}
