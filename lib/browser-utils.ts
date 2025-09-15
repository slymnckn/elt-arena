/**
 * Browser uyumluluğu kontrolü ve eski tarayıcı desteği için yardımcı fonksiyonlar
 */

export interface BrowserInfo {
  name: string
  version: number
  isOldChrome: boolean
  isSupported: boolean
  userAgent: string
}

/**
 * Tarayıcı bilgilerini alır
 */
export const getBrowserInfo = (): BrowserInfo | null => {
  if (typeof window === 'undefined') return null
  
  const ua = navigator.userAgent.toLowerCase()
  
  let name = 'unknown'
  let version = 0
  
  // Chrome tespiti
  if (ua.includes('chrome') && !ua.includes('edg')) {
    name = 'chrome'
    const match = ua.match(/chrome\/(\d+)/)
    version = match ? parseInt(match[1]) : 0
  }
  // Firefox tespiti  
  else if (ua.includes('firefox')) {
    name = 'firefox'
    const match = ua.match(/firefox\/(\d+)/)
    version = match ? parseInt(match[1]) : 0
  }
  // Safari tespiti
  else if (ua.includes('safari') && !ua.includes('chrome')) {
    name = 'safari'
    const match = ua.match(/version\/(\d+)/)
    version = match ? parseInt(match[1]) : 0
  }
  // Edge tespiti
  else if (ua.includes('edg')) {
    name = 'edge'
    const match = ua.match(/edg\/(\d+)/)
    version = match ? parseInt(match[1]) : 0
  }
  
  return {
    name,
    version,
    isOldChrome: name === 'chrome' && version < 90,
    isSupported: checkBrowserSupport(name, version),
    userAgent: navigator.userAgent
  }
}

/**
 * Tarayıcı destekleniyor mu kontrol et
 */
const checkBrowserSupport = (name: string, version: number): boolean => {
  const minVersions = {
    chrome: 79,
    firefox: 70,
    safari: 12,
    edge: 79
  }
  
  return version >= (minVersions[name as keyof typeof minVersions] || 0)
}

/**
 * Modern JavaScript özelliklerinin desteklenip desteklenmediğini test eder
 */
export const checkModernFeatureSupport = () => {
  if (typeof window === 'undefined') return {
    optionalChaining: true,
    nullishCoalescing: true,
    classFields: true,
    asyncAwait: true,
    allSupported: true
  }
  
  const tests = {
    optionalChaining: () => {
      try {
        // eslint-disable-next-line no-new-func
        new Function('var a={}; return a?.x')()
        return true
      } catch {
        return false
      }
    },
    
    nullishCoalescing: () => {
      try {
        // eslint-disable-next-line no-new-func
        new Function('var x=null; return x ?? 42')()
        return true
      } catch {
        return false
      }
    },
    
    classFields: () => {
      try {
        // eslint-disable-next-line no-new-func
        new Function('class A{x=1}; return new A()')()
        return true
      } catch {
        return false
      }
    },
    
    asyncAwait: () => {
      try {
        // eslint-disable-next-line no-new-func
        new Function('async function f(){await 1}; return f')()
        return true
      } catch {
        return false
      }
    }
  }
  
  const results = {
    optionalChaining: tests.optionalChaining(),
    nullishCoalescing: tests.nullishCoalescing(),
    classFields: tests.classFields(),
    asyncAwait: tests.asyncAwait()
  }
  
  return {
    ...results,
    allSupported: Object.values(results).every(result => result)
  }
}

/**
 * Eski tarayıcı için polyfill yükleme bilgisi göster
 */
export const showLegacyBrowserWarning = () => {
  if (typeof window === 'undefined') return
  
  const browserInfo = getBrowserInfo()
  const featureSupport = checkModernFeatureSupport()
  
  if (browserInfo && (!browserInfo.isSupported || !featureSupport.allSupported)) {
    console.warn('Eski tarayıcı tespit edildi:', {
      browser: `${browserInfo.name} ${browserInfo.version}`,
      features: featureSupport,
      userAgent: browserInfo.userAgent
    })
    
    // Kullanıcı bilgilendirmesi (opsiyonel)
    const shouldShowWarning = localStorage.getItem('hideBrowserWarning') !== 'true'
    
    if (shouldShowWarning && browserInfo.version > 0 && browserInfo.version < 85) {
      setTimeout(() => {
        if (confirm('Bu platform daha iyi performans için güncel bir tarayıcı önerir. Devam etmek istiyor musunuz?')) {
          localStorage.setItem('hideBrowserWarning', 'true')
        }
      }, 1000)
    }
  }
}

/**
 * Chunk loading hatalarını yakala ve yeniden yükleme öner
 */
export const handleChunkLoadError = () => {
  if (typeof window === 'undefined') return
  
  window.addEventListener('error', (event) => {
    // ChunkLoadError yakalama
    if (
      event.message?.includes('Loading chunk') ||
      event.message?.includes('ChunkLoadError') ||
      event.filename?.includes('_next/static')
    ) {
      console.error('Chunk yükleme hatası tespit edildi:', event)
      
      // 2 saniye bekleyip sayfayı yenile
      setTimeout(() => {
        if (confirm('Platform yüklenirken bir hata oluştu. Sayfayı yenilemek istiyor musunuz?')) {
          window.location.reload()
        }
      }, 2000)
    }
  })
  
  // Promise rejection hatalarını da yakala
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.toString().includes('Loading chunk')) {
      console.error('Chunk promise hatası:', event.reason)
      event.preventDefault() // Hatayı suppress et
    }
  })
}

/**
 * Sayfa yüklendiğinde çalıştırılacak başlangıç kontrolleri
 */
export const initBrowserCompatibility = () => {
  if (typeof window === 'undefined') return
  
  // Tarayıcı uyumluluk kontrolleri
  showLegacyBrowserWarning()
  
  // Chunk hatalarını yakalama
  handleChunkLoadError()
  
  // Console'a debug bilgisi
  const browserInfo = getBrowserInfo()
  const features = checkModernFeatureSupport()
  
  console.log('ELT Arena - Tarayıcı Uyumluluk Raporu:', {
    browser: browserInfo,
    features: features,
    timestamp: new Date().toISOString()
  })
}
