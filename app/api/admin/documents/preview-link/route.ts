import { NextRequest, NextResponse } from 'next/server'
import { isEmbeddable, toEmbedUrl, getUrlType } from '@/lib/embed-utils'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL gereklidir' },
        { status: 400 }
      )
    }

    // URL format validasyonu
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Geçerli bir URL formatı değil' },
        { status: 400 }
      )
    }

    // Protokol kontrolü
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      return NextResponse.json(
        { error: 'Sadece HTTP/HTTPS linkleri desteklenir' },
        { status: 400 }
      )
    }

    // Güvenlik kontrolleri (opsiyonel)
    const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0']
    if (suspiciousDomains.some(domain => validUrl.hostname.includes(domain))) {
      return NextResponse.json(
        { error: 'Bu domain desteklenmemektedir' },
        { status: 400 }
      )
    }

    // URL tipini belirle
    const urlType = getUrlType(url)
    const embedUrl = toEmbedUrl(url)
    const embeddable = isEmbeddable(url)

    // Otomatik başlık önerisi
    let suggestedTitle = ''
    try {
      if (url.includes('drive.google.com')) {
        suggestedTitle = 'Google Drive Dosyası'
      } else if (url.includes('docs.google.com/document')) {
        suggestedTitle = 'Google Docs Belgesi'
      } else if (url.includes('docs.google.com/spreadsheets')) {
        suggestedTitle = 'Google Sheets Tablosu'
      } else if (url.includes('docs.google.com/presentation')) {
        suggestedTitle = 'Google Slides Sunumu'
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        suggestedTitle = 'YouTube Video'
      } else if (url.includes('vimeo.com')) {
        suggestedTitle = 'Vimeo Video'
      } else if (url.includes('onedrive.live.com') || url.includes('sharepoint.com')) {
        suggestedTitle = 'OneDrive Dosyası'
      } else if (url.includes('dropbox.com')) {
        suggestedTitle = 'Dropbox Dosyası'
      } else if (url.endsWith('.pdf')) {
        suggestedTitle = 'PDF Belgesi'
      } else {
        // Domain'den başlık önerisi
        const domain = validUrl.hostname.replace('www.', '')
        suggestedTitle = `${domain} - Web İçeriği`
      }
    } catch (error) {
      console.error('Title suggestion error:', error)
      suggestedTitle = 'Harici Bağlantı'
    }

    return NextResponse.json({
      url: validUrl.toString(),
      embedUrl,
      urlType,
      embeddable,
      suggestedTitle,
      domain: validUrl.hostname,
      isValid: true
    })

  } catch (error) {
    console.error('Link preview error:', error)
    return NextResponse.json(
      { error: 'Link önizleme sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
