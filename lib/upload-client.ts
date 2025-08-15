export async function uploadFileViaApi(file: File): Promise<{ url: string; path: string } | null> {
  try {
    const body = new FormData()
    body.append("file", file)

    const res = await fetch("/api/storage/upload", {
      method: "POST",
      body,
    })
    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error ?? "upload failed")
    }
    return (await res.json()) as { url: string; path: string }
  } catch (err) {
    console.error("uploadFileViaApi error:", err)
    return null
  }
}
