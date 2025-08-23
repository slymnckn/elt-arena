/**
 * URL'leri iframe içinde görüntülenebilir formata dönüştürür
 * Google Drive, PDF, YouTube gibi özel durumları handle eder
 */

export function toEmbedUrl(url: string): string {
  if (!url) return url;
  
  console.log('🔗 Converting URL:', url);

  // 1) Google Drive özel durumları
  if (url.includes("drive.google.com")) {
    // .../file/d/FILE_ID/... formatı
    const fileIdMatch = url.match(/drive\.google\.com\/file\/d\/([^/\?]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      console.log('✅ Drive link converted (file/d/):', embedUrl);
      return embedUrl;
    }

    // ...open?id=FILE_ID... formatı
    const idMatch = url.match(/[?&]id=([^&]+)/);
    if (idMatch) {
      const fileId = idMatch[1];
      const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      console.log('✅ Drive link converted (open?id):', embedUrl);
      return embedUrl;
    }

    // Eğer zaten /preview ile bitiyorsa olduğu gibi bırak
    if (url.includes('/preview')) {
      console.log('✅ Drive preview URL already formatted:', url);
      return url;
    }
  }

  // 2) Google Docs, Sheets, Slides için embed parametresi
  if (url.includes("docs.google.com") || url.includes("sheets.google.com") || url.includes("slides.google.com")) {
    let embedUrl = url;
    
    // /edit kısmını /preview ile değiştir
    if (url.includes('/edit')) {
      embedUrl = url.replace('/edit', '/preview');
    }
    
    // embedded=true parametresini ekle
    const separator = embedUrl.includes('?') ? '&' : '?';
    embedUrl = `${embedUrl}${separator}embedded=true`;
    
    console.log('✅ Google Workspace converted:', embedUrl);
    return embedUrl;
  }

  // 3) OneDrive linkleri
  if (url.includes("onedrive.live.com") || url.includes("sharepoint.com") || url.includes("1drv.ms")) {
    let embedUrl = url;
    
    // view parametresini embed ile değiştir
    if (url.includes('view.aspx')) {
      embedUrl = url.replace('view.aspx', 'embed.aspx');
    } else if (url.includes('/view')) {
      embedUrl = url.replace('/view', '/embed');
    }
    
    console.log('✅ OneDrive converted:', embedUrl);
    return embedUrl;
  }

  // 4) Direkt PDF linkleri için Google Viewer
  if (url.endsWith(".pdf") || url.includes(".pdf?") || url.includes(".pdf&")) {
    const embedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    console.log('✅ PDF converted to Google Viewer:', embedUrl);
    return embedUrl;
  }

  // 5) Office dosyaları: Lokal veya korunmuş linkler için dönüştürme yapma (Google Viewer genelde erişemiyor)
  //    Eğer zaten Google servis linki değilse orijinal URL'i döndürüp komponent tarafında basit fallback gösterilecek.
  if (url.match(/\.(ppt|pptx|doc|docx|xls|xlsx)(\?|&|$)/i)) {
    console.log('ℹ️ Office document left as-is (no Google Viewer conversion):', url);
    return url;
  }

  // 7) YouTube linkleri için embed
  if (url.includes("youtube.com/watch") || url.includes("youtu.be/")) {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log('✅ YouTube converted:', embedUrl);
      return embedUrl;
    }
  }

  // 8) Vimeo linkleri
  if (url.includes("vimeo.com/")) {
    const videoIdMatch = url.match(/vimeo\.com\/(\d+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      console.log('✅ Vimeo converted:', embedUrl);
      return embedUrl;
    }
  }

  // 8) Dropbox linkleri
  if (url.includes("dropbox.com")) {
    let embedUrl = url;
    if (url.includes('?dl=0')) {
      embedUrl = url.replace('?dl=0', '?raw=1');
    } else if (!url.includes('raw=1')) {
      const separator = url.includes('?') ? '&' : '?';
      embedUrl = `${url}${separator}raw=1`;
    }
    console.log('✅ Dropbox converted:', embedUrl);
    return embedUrl;
  }

  // 9) Fallback: Orijinal URL'i döndür
  console.log('ℹ️ Using original URL (no conversion needed):', url);
  return url;
}

/**
 * YouTube video ID'sini URL'den çıkarır
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * URL tipine göre iframe için özel props döndürür
 */
export function getIframeProps(url: string) {
  const embedUrl = toEmbedUrl(url);
  
  // Google Drive için özel ayarlar
  if (url.includes("drive.google.com")) {
    return {
      src: embedUrl,
      allow: "autoplay",
      sandbox: "allow-same-origin allow-scripts allow-popups allow-forms",
      referrerPolicy: "no-referrer-when-downgrade" as const
    };
  }
  
  // YouTube için özel ayarlar
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return {
      src: embedUrl,
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      allowFullScreen: true
    };
  }
  
  // Vimeo için özel ayarlar
  if (url.includes("vimeo.com")) {
    return {
      src: embedUrl,
      allow: "autoplay; fullscreen; picture-in-picture",
      allowFullScreen: true
    };
  }
  
  // Google Workspace için özel ayarlar
  if (url.includes("docs.google.com") || url.includes("sheets.google.com") || url.includes("slides.google.com")) {
    return {
      src: embedUrl,
      allow: "autoplay"
    };
  }
  
  // Genel ayarlar
  return {
    src: embedUrl,
    allow: "autoplay"
  };
}

/**
 * URL'nin embed edilebilir olup olmadığını kontrol eder
 */
export function isEmbeddable(url: string): boolean {
  if (!url) return false;
  
  // Bilinen embed edilebilir servisler
  const embeddableServices = [
    'drive.google.com',
    'docs.google.com',
    'sheets.google.com', 
    'slides.google.com',
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'onedrive.live.com',
    'sharepoint.com',
    '1drv.ms',
    'dropbox.com'
  ];
  
  // Sadece PDF uzantısını doğrudan iframe ile dene (Office dosyaları için özel fallback göstereceğiz)
  const embeddableExtensions = ['.pdf'];
  
  return embeddableServices.some(service => url.includes(service)) ||
         embeddableExtensions.some(ext => url.toLowerCase().includes(ext));
}

/**
 * URL'den dosya tipini tahmin eder
 */
export function getUrlType(url: string): 'video' | 'document' | 'presentation' | 'spreadsheet' | 'pdf' | 'image' | 'other' {
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
    return 'video';
  }
  
  if (url.includes('sheets.google.com') || url.includes('.xlsx') || url.includes('.xls')) {
    return 'spreadsheet';
  }
  
  if (url.includes('slides.google.com') || url.includes('.pptx') || url.includes('.ppt')) {
    return 'presentation';
  }
  
  if (url.includes('docs.google.com') || url.includes('.docx') || url.includes('.doc')) {
    return 'document';
  }
  
  if (url.includes('.pdf')) {
    return 'pdf';
  }
  
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|&|$)/i)) {
    return 'image';
  }
  
  return 'other';
}
