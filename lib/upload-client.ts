/**
 * Local File Storage Upload Client
 * Uploads files to /public/uploads/ directory via /api/storage/upload endpoint
 */
export async function uploadFileViaApi(file: File, type: string = "materials"): Promise<{ url: string; path: string } | null> {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    console.log(`🔄 Uploading ${file.name} to local storage (${type})...`)

    const response = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.details || "Upload failed")
    }
    
    const result = await response.json()
    console.log(`✅ Upload successful:`, result)
    
    return {
      url: result.url,
      path: result.path
    }
  } catch (err: any) {
    console.error("❌ Upload client error:", err)
    return null
  }
}
