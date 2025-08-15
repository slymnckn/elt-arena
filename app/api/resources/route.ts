import { type NextRequest, NextResponse } from "next/server"
import { 
  getResources, 
  addResource, 
  updateResource, 
  deleteResource 
} from "@/lib/database"

// GET /api/resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unitId = searchParams.get('unitId')
    const resourceType = searchParams.get('resourceType')

    const resources = await getResources(
      unitId ? parseInt(unitId) : undefined,
      resourceType as any
    )

    return NextResponse.json(resources)
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}

// POST /api/resources
export async function POST(request: NextRequest) {
  try {
    const { unitId, resourceData, createdBy } = await request.json()

    if (!unitId || !resourceData) {
      return NextResponse.json({ error: "Unit ID and resource data are required" }, { status: 400 })
    }

    const resource = await addResource(unitId, resourceData, createdBy)
    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 })
  }
}

// PUT /api/resources
export async function PUT(request: NextRequest) {
  try {
    const { id, resourceData } = await request.json()

    if (!id || !resourceData) {
      return NextResponse.json({ error: "Resource ID and data are required" }, { status: 400 })
    }

    const resource = await updateResource(id, resourceData)
    return NextResponse.json(resource)
  } catch (error) {
    console.error("Error updating resource:", error)
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 })
  }
}

// DELETE /api/resources
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "Resource ID is required" }, { status: 400 })
    }

    await deleteResource(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 })
  }
}
