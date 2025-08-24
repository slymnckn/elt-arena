import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Dosya URL'lerini çözer - production safe
 * @param url - Çözülecek URL
 * @returns Tam URL
 */
export function resolveFileUrl(url: string): string {
  if (!url) return ''
  
  // Zaten tam URL ise aynen döndür
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Base URL'i al (environment variable'dan veya window'dan)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  
  // uploads/ ile başlıyorsa - hem static hem de API endpoint desteği
  if (url.startsWith('uploads/')) {
    // Production modda veya Docker'da API endpoint kullan
    if (process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV === 'true' || process.env.NEXT_PUBLIC_DOCKER_ENV === 'true') {
      return `${baseUrl}/api/storage/serve?file=${encodeURIComponent(url.replace('uploads/', ''))}`
    }
    // Development modda doğrudan static serving
    return `${baseUrl}/${url}`
  }
  
  // / ile başlıyorsa
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`
  }
  
  // Diğer durumlarda https:// ekle
  return `https://${url}`
}
