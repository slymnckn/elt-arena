import { type NextRequest, NextResponse } from "next/server"
import { updateAdminUser, deleteAdminUser } from "@/lib/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// PUT /api/admin/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Sadece admin kullanıcısı işlem yapabilir
    if (decoded.username !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const data = await request.json()
    const { id } = params

    // Şifre varsa hash'le
    if (data.password) {
      const saltRounds = 10
      data.password_hash = await bcrypt.hash(data.password, saltRounds)
      delete data.password // password field'ını kaldır, password_hash kullan
    }

    const updatedUser = await updateAdminUser(id, data)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating admin user:", error)
    return NextResponse.json({ error: "Failed to update admin user" }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Sadece admin kullanıcısı işlem yapabilir
    if (decoded.username !== 'admin') {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { id } = params

    // Admin kullanıcısının kendisini silmesini engelle
    if (decoded.userId?.toString() === id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const deletedUser = await deleteAdminUser(id)
    return NextResponse.json(deletedUser)
  } catch (error) {
    console.error("Error deleting admin user:", error)
    return NextResponse.json({ error: "Failed to delete admin user" }, { status: 500 })
  }
}
