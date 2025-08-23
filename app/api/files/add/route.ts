import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgresql"

// POST  /api/files/add
// Body: {
//   resourceId: string,
//   originalName: string,
//   fileName: string,
//   filePath: string,
//   fileSize: number,
//   fileType: string
// }
export async function POST(req: NextRequest) {
  try {
    const { resourceId, originalName, fileName, filePath, fileSize, fileType } = await req.json()

    if (!resourceId || !originalName || !fileName || !filePath) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO files (id, resource_id, original_name, file_name, file_path, file_size, file_type, bucket_name, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [resourceId, originalName, fileName, filePath, fileSize || 0, fileType || 'application/octet-stream', 'materials']
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API /files/add error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
