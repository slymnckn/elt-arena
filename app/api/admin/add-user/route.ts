import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/postgresql'

export async function POST(req: NextRequest) {
  try {
    // Authorization header'ından token'ı al
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Token'ı doğrula
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-change-this-in-production-32-chars-minimum')
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Sadece admin kullanıcısı yeni kullanıcı ekleyebilir
    if (decoded.username !== 'admin') {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const { username, password, full_name } = await req.json()

    // Gerekli alanları kontrol et
    if (!username || !password) {
      return NextResponse.json({ 
        message: 'Kullanıcı adı ve şifre zorunludur' 
      }, { status: 400 })
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json({ 
        message: 'Şifre en az 6 karakter olmalıdır' 
      }, { status: 400 })
    }

    // Kullanıcının zaten var olup olmadığını kontrol et
    const existingUserQuery = 'SELECT id FROM admin_users WHERE username = $1'
    const existingUserResult = await query(existingUserQuery, [username])

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({ 
        message: 'Bu kullanıcı adı zaten kullanılıyor' 
      }, { status: 400 })
    }

    // E-posta kontrolü yok (tablo yapısında email sütunu yok)

    // Şifreyi hash'le
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Yeni kullanıcıyı veritabanına ekle
    const insertQuery = `
      INSERT INTO admin_users (username, password_hash, full_name, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, username, full_name, is_active, created_at, updated_at
    `
    
    const insertResult = await query(insertQuery, [
      username,
      hashedPassword,
      full_name || username, // full_name not null, so use username as fallback
      true // is_active = true
    ])

    if (insertResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Kullanıcı eklenirken veritabanı hatası oluştu' 
      }, { status: 500 })
    }

    const newUser = insertResult.rows[0]

    return NextResponse.json({
      message: 'Kullanıcı başarıyla eklendi',
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Add user error:', error)
    return NextResponse.json({ 
      message: 'Sunucu hatası oluştu' 
    }, { status: 500 })
  }
}