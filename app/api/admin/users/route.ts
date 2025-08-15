import { type NextRequest, NextResponse } from "next/server"
import { getAdminUsersForFilter } from "@/lib/database"

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const users = await getAdminUsersForFilter()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 })
  }
}
