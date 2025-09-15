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
  
  let chunkErrorCount = 0
  const maxRetries = 3
  
  window.addEventListener('error', (event) => {
    // ChunkLoadError yakalama
    if (
      event.message?.includes('Loading chunk') ||
      event.message?.includes('ChunkLoadError') ||
      event.message?.includes('Loading CSS chunk') ||
      event.filename?.includes('_next/static') ||
      event.filename?.includes('chunks/')
    ) {
      chunkErrorCount++
      console.error('Chunk yükleme hatası tespit edildi:', event)
      
      if (chunkErrorCount >= maxRetries) {
        alert('Platform yükleme hatası oluştu. Sayfa yenilenecek.')
        window.location.reload()
        return
      }
      
      // İlk hatada 2 saniye bekle, sonra sayfayı yenile
      setTimeout(() => {
        if (confirm('Platform yüklenirken hata oluştu. Sayfayı yenilemek istiyor musunuz?')) {
          window.location.reload()
        }
      }, 2000)
    }
  })
  
  // Promise rejection hatalarını da yakala
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || ''
    if (reason.includes('Loading chunk') || reason.includes('ChunkLoadError')) {
      console.error('Chunk promise hatası:', event.reason)
      chunkErrorCount++
      
      if (chunkErrorCount >= maxRetries) {
        alert('Yükleme hatası tekrarlandı. Sayfa yenilenecek.')
        window.location.reload()
        return
      }
      
      event.preventDefault() // Hatayı suppress et
    }
  })
  
  // Loading timeout için window focus kontrolü
  let focusTimeout: NodeJS.Timeout
  const resetFocusTimeout = () => {
    clearTimeout(focusTimeout)
    focusTimeout = setTimeout(() => {
      if (document.readyState !== 'complete') {
        console.warn('Sayfa yükleme 30 saniyede tamamlanmadı')
        if (confirm('Platform yükleme süresi uzuyor. Yenilemek istiyor musunuz?')) {
          window.location.reload()
        }
      }
    }, 30000)
  }
  
  window.addEventListener('focus', resetFocusTimeout)
  window.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      resetFocusTimeout()
    }
  })
  
  resetFocusTimeout()
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
  
  // Loading state monitoring
  const monitorLoadingState = () => {
    let loadingTimeout: NodeJS.Timeout
    
    const checkLoadingState = () => {
      if (document.readyState === 'complete') {
        clearTimeout(loadingTimeout)
        return
      }
      
      // 20 saniye sonra loading uyarısı göster
      loadingTimeout = setTimeout(() => {
        if (document.readyState !== 'complete') {
          console.warn('Platform yükleme süresi normalden uzun')
          
          // Loading elementi varsa güncelleyelim
          const loadingElement = document.querySelector('[data-loading="true"]')
          if (loadingElement) {
            loadingElement.innerHTML = `
              <div style="text-align: center; padding: 20px;">
                <div style="margin-bottom: 15px;">
                  <div style="border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
                <h3 style="color: #333; margin-bottom: 10px;">Platform yükleniyor...</h3>
                <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Yükleme normalden uzun sürüyor. Eski tarayıcılarda bu durum yaşanabilir.</p>
                <button onclick="window.location.reload()" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                  Sayfayı Yenile
                </button>
              </div>
            `
          }
        }
      }, 20000)
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkLoadingState)
    } else {
      checkLoadingState()
    }
  }
  
  monitorLoadingState()
  
  // Console'a debug bilgisi
  const browserInfo = getBrowserInfo()
  const features = checkModernFeatureSupport()
  
  console.log('ELT Arena - Tarayıcı Uyumluluk Raporu:', {
    browser: browserInfo,
    features: features,
    timestamp: new Date().toISOString(),
    readyState: document.readyState
  })
}
