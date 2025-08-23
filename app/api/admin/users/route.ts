import { type NextRequest, NextResponse } from "next/server"
import { getAllAdminUsers, addAdminUser } from "@/lib/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    // Authorization header'ından token'ı al
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Token'ı doğrula
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-change-this-in-production-32-chars-minimum')
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Sadece admin kullanıcısı listeyi görebilir
    if (decoded.username !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const users = await getAllAdminUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 })
  }
}

// POST /api/admin/users
export async function POST(request: NextRequest) {
  try {
    // Authorization header'ından token'ı al
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Token'ı doğrula
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-jwt-key-change-this-in-production-32-chars-minimum')
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Sadece admin kullanıcısı yeni kullanıcı ekleyebilir
    if (decoded.username !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const data = await request.json()
    const { username, password, email, full_name } = data

    // Gerekli alanları kontrol et
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Şifreyi hash'le
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const newUserData = {
      username,
      password: hashedPassword,
      email: email || null,
      full_name: full_name || username,
      is_active: true
    }

    const created = await addAdminUser(newUserData)
    
    // Şifreyi response'dan çıkar
    const { password: _, ...safeUser } = created
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}
