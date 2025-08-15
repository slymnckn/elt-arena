// Güvenli clipboard kopyalama utility fonksiyonu
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern browsers için Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback için execCommand kullan
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('Clipboard kopyalama başarısız:', err);
    return false;
  }
}

// Kullanım örneği:
// const success = await copyToClipboard("Kopyalanacak metin");
// if (success) {
//   toast.success("Kopyalandı!");
// } else {
//   toast.error("Kopyalama başarısız!");
// }
