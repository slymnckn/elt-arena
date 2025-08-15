import { query, transaction } from "./postgresql"
import type { Grade, Resource, ResourceType } from "./data"
import type { Database } from "./postgresql"

// Yeni Announcement tipi
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"] & {
  creatorName?: string
  display_once_per_session?: boolean
}

/* -------------------------------------------------------
   1. READ OPERATIONS
------------------------------------------------------- */
export async function getGrades(): Promise<Grade[]> {
  try {
    const gradesResult = await query(
      "SELECT * FROM grades ORDER BY order_index ASC"
    )

    if (!gradesResult.rows.length) {
      console.log("Henüz sınıf verisi yok")
      return []
    }

    const unitsResult = await query(
      "SELECT * FROM units ORDER BY order_index ASC"
    )

    const resourcesResult = await query(
      `SELECT r.*, a.username as creator_name 
       FROM resources r 
       LEFT JOIN admin_users a ON r.created_by = a.id 
       ORDER BY r.created_at ASC`
    )

    return gradesResult.rows.map((grade: any) => ({
      id: grade.id,
      title: grade.title,
      category: grade.category,
      units: unitsResult.rows
        .filter((u: any) => u.grade_id === grade.id)
        .map((unit: any) => ({
          id: unit.id,
          title: unit.title,
          resources: resourcesResult.rows
            .filter((r: any) => r.unit_id === unit.id)
            .map((resource: any) => ({
              id: resource.id,
              title: resource.title,
              description: resource.description,
              type: resource.type as ResourceType,
              fileUrl: resource.file_url,
              createdBy: resource.creator_name || "Sistem",
              createdAt: resource.created_at,
            })),
        })),
    }))
  } catch (error) {
    console.error("Grades getirme hatası:", error)
    return []
  }
}

export async function getResources(unitId?: number, resourceType?: ResourceType) {
  try {
    let baseQuery = `
      SELECT r.*, a.username as creator_name 
      FROM resources r 
      LEFT JOIN admin_users a ON r.created_by = a.id
    `
    const queryParams: any[] = []
    const conditions: string[] = []

    if (unitId) {
      conditions.push(`r.unit_id = $${queryParams.length + 1}`)
      queryParams.push(unitId)
    }

    if (resourceType) {
      conditions.push(`r.type = $${queryParams.length + 1}`)
      queryParams.push(resourceType)
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ')
    }

    baseQuery += ' ORDER BY r.created_at ASC'

    const result = await query(baseQuery, queryParams)

    return result.rows.map((resource: any) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type as ResourceType,
      fileUrl: resource.file_url,
      createdBy: resource.creator_name || "Sistem",
      createdAt: resource.created_at,
      unitId: resource.unit_id,
    }))
  } catch (error) {
    console.error("Resources getirme hatası:", error)
    return []
  }
}

// Duyuruları getir (admin paneli için)
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const result = await query(
      `SELECT a.*, ad.username as creator_name 
       FROM announcements a 
       LEFT JOIN admin_users ad ON a.created_by = ad.id 
       ORDER BY a.created_at DESC`
    )

    return result.rows.map((announcement: any) => ({
      ...announcement,
      creatorName: announcement.creator_name || "Bilinmiyor",
    }))
  } catch (error) {
    console.error("Announcements getirme hatası:", error)
    return []
  }
}

// Aktif duyuruları getir (kullanıcı tarafı için)
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  try {
    const result = await query(
      `SELECT a.*, ad.username as creator_name 
       FROM announcements a 
       LEFT JOIN admin_users ad ON a.created_by = ad.id 
       WHERE a.is_active = true 
       ORDER BY a.created_at DESC`
    )

    return result.rows.map((announcement: any) => ({
      ...announcement,
      creatorName: announcement.creator_name || "Bilinmiyor",
    }))
  } catch (error) {
    console.error("Active announcements getirme hatası:", error)
    return []
  }
}

/* -------------------------------------------------------
   2. CRUD FOR RESOURCES
------------------------------------------------------- */
export async function addResource(
  unitId: number,
  data: Omit<Resource, "id" | "creatorName">,
  createdBy?: string
): Promise<Resource | null> {
  try {
    // UUID generate et
    const resourceId = crypto.randomUUID()
    
    const result = await query(
      `INSERT INTO resources (id, unit_id, title, description, type, file_url, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [resourceId, unitId, data.title, data.description, data.type, data.fileUrl, createdBy ? parseInt(createdBy) : null]
    )

    if (result.rows.length > 0) {
      const resource = result.rows[0]
      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type as ResourceType,
        fileUrl: resource.file_url,
        createdBy: resource.created_by || "Sistem",
        createdAt: resource.created_at,
      }
    }
    return null
  } catch (error) {
    console.error("Resource ekleme hatası:", error)
    return null
  }
}

export async function updateResource(
  id: string,
  data: Partial<Omit<Resource, "id" | "creatorName">>
): Promise<Resource | null> {
  try {
    const result = await query(
      `UPDATE resources 
       SET title = $2, description = $3, type = $4, file_url = $5, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, data.title, data.description, data.type, data.fileUrl]
    )

    if (result.rows.length > 0) {
      const resource = result.rows[0]
      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        type: resource.type as ResourceType,
        fileUrl: resource.file_url,
        createdBy: "Sistem",
        createdAt: resource.created_at,
      }
    }
    return null
  } catch (error) {
    console.error("Resource güncelleme hatası:", error)
    return null
  }
}

export async function deleteResource(id: string): Promise<boolean> {
  try {
    await query("DELETE FROM resources WHERE id = $1", [id])
    return true
  } catch (error) {
    console.error("Resource silme hatası:", error)
    return false
  }
}

/* -------------------------------------------------------
   3. CRUD FOR ANNOUNCEMENTS
------------------------------------------------------- */
export async function addAnnouncement(
  data: Omit<Announcement, "id" | "created_at" | "updated_at" | "creatorName">,
  createdBy?: string
): Promise<Announcement | null> {
  try {
    const result = await query(
      `INSERT INTO announcements (title, content, image_url, is_active, created_by) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [data.title, data.content, data.image_url, data.is_active, createdBy]
    )

    if (result.rows.length > 0) {
      return { ...result.rows[0], creatorName: "Sistem" }
    }
    return null
  } catch (error) {
    console.error("Announcement ekleme hatası:", error)
    return null
  }
}

export async function updateAnnouncement(
  id: number,
  data: Partial<Omit<Announcement, "id" | "created_at" | "updated_at" | "creatorName">>,
  updatedBy?: string
): Promise<Announcement | null> {
  try {
    const result = await query(
      `UPDATE announcements 
       SET title = $2, content = $3, image_url = $4, is_active = $5, updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id, data.title, data.content, data.image_url, data.is_active]
    )

    if (result.rows.length > 0) {
      return { ...result.rows[0], creatorName: "Sistem" }
    }
    return null
  } catch (error) {
    console.error("Announcement güncelleme hatası:", error)
    return null
  }
}

export async function deleteAnnouncement(id: number): Promise<boolean> {
  try {
    await query("DELETE FROM announcements WHERE id = $1", [id])
    return true
  } catch (error) {
    console.error("Announcement silme hatası:", error)
    return false
  }
}

/* -------------------------------------------------------
   4. FILE HELPERS (Simple implementation)
------------------------------------------------------- */
export async function uploadFile(file: File): Promise<{ url: string; path: string } | null> {
  // Bu basit implementasyon - gerçek dosya yükleme için multer kullanılacak
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `/uploads/${fileName}`
  
  // Local storage veya başka bir sistem için placeholder
  return {
    url: filePath,
    path: filePath
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  // File system'den dosya silme placeholder
  console.log(`Dosya silinecek: ${filePath}`)
  return true
}

/* -------------------------------------------------------
   5. ADMIN HELPERS
------------------------------------------------------- */
export async function getAdminUsersForFilter(): Promise<{ id: string; username: string }[]> {
  try {
    const result = await query(
      "SELECT id, username FROM admin_users WHERE is_active = true ORDER BY username"
    )
    return result.rows
  } catch (error) {
    console.error("Admin users getirme hatası:", error)
    return []
  }
}
