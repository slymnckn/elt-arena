import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Users, 
  Gamepad2, 
  FileText, 
  Video, 
  Download,
  Star,
  ArrowRight,
  GraduationCap,
  School,
  Building,
  Globe
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-blue-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/elt-arena-logo.png" 
                alt="ELT Arena Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-800">ELT Arena</h1>
                <p className="text-xs text-slate-600">İngilizce Öğretmenlerinin Buluşma Noktası</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="https://broosmedia.com/" target="_blank" rel="noopener noreferrer">
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 hover:bg-slate-100 transition-colors cursor-pointer">
                  <img 
                    src="/broos-media.png" 
                    alt="Broos Media" 
                    className="h-4 w-auto"
                  />
                  <span className="text-xs text-slate-600">tarafından geliştirilmiştir</span>
                </div>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="hidden md:flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Platforma Giriş
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 border-blue-200">
              ✨ Türkiye'nin En Kapsamlı İngilizce Eğitim Platformu
            </Badge>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              İngilizce Öğretmenlerinin
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block">
                Buluşma Noktası
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Binlerce materyal, çalışma kağıdı ve eğitim kaynağına tek platformdan ulaşın. 
              Derslerinizi daha etkili hale getirin.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-12">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-900">5000+</div>
                <div className="text-sm text-slate-600">Materyal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-900">500+</div>
                <div className="text-sm text-slate-600">Öğretmen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-900">⭐ 4.9</div>
                <div className="text-sm text-slate-600">Değerlendirme</div>
              </div>
            </div>
            
            {/* CTA Button */}
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Platforma Giriş Yap
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Grade Levels Quick Access */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tüm Seviyeleri Kapsıyor</h2>
            <p className="text-slate-600">İhtiyacınız olan sınıf seviyesini seçin ve doğrudan o bölüme geçin</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link href="/dashboard?grade=2">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-blue-300">
                <CardContent className="p-6 text-center">
                  <School className="h-12 w-12 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-slate-900 mb-1">İlkokul</h3>
                  <p className="text-sm text-slate-600">2-4. Sınıflar</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dashboard?grade=5">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-green-300">
                <CardContent className="p-6 text-center">
                  <Building className="h-12 w-12 mx-auto mb-3 text-green-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-slate-900 mb-1">Ortaokul</h3>
                  <p className="text-sm text-slate-600">5-8. Sınıflar</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dashboard?grade=9">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-purple-300">
                <CardContent className="p-6 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto mb-3 text-purple-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-slate-900 mb-1">Lise</h3>
                  <p className="text-sm text-slate-600">9-12. Sınıflar</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dashboard?grade=5-yd">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-orange-300">
                <CardContent className="p-6 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-3 text-orange-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-slate-900 mb-1">Yabancı Dil</h3>
                  <p className="text-sm text-slate-600">A1-C2 Seviye</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Öne Çıkan Özellikler
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Derslerinizi daha etkili hale getiren modern araçlar ve zengin içerik kütüphanesi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-slate-900">Zengin İçerik Kütüphanesi</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li>• Kitap sunumları</li>
                  <li>• Çalışma kağıtları</li>
                  <li>• Video dersler</li>
                  <li>• PDF materyaller</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader>
                <Gamepad2 className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-slate-900">İnteraktif Oyunlar</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li>• Kelime oyunları</li>
                  <li>• Quiz'ler ve testler</li>
                  <li>• Etkileşimli aktiviteler</li>
                  <li>• Öğrenme oyunları</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-slate-900">Öğretmen Topluluğu</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li>• Materyal paylaşımı</li>
                  <li>• Deneyim alışverişi</li>
                  <li>• Profesyonel network</li>
                  <li>• İşbirliği imkanları</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader>
                <Download className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle className="text-slate-900">Kolay İndirme</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li>• Tek tıkla indirme</li>
                  <li>• Çoklu format desteği</li>
                  <li>• Hızlı erişim</li>
                  <li>• Güvenli depolama</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader>
                <Video className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle className="text-slate-900">Multimedya İçerik</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li>• Video dersler</li>
                  <li>• Ses kayıtları</li>
                  <li>• İnteraktif sunumlar</li>
                  <li>• Görsel materyaller</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader>
                <FileText className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle className="text-slate-900">Organize Edilmiş</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li>• Sınıfa göre ayrılmış</li>
                  <li>• Konulara göre düzenli</li>
                  <li>• Arama özellikleri</li>
                  <li>• Kategori filtreleri</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Öğretmenlerimizin Yorumları</h2>
            <p className="text-slate-600">Platformumuzu kullanan öğretmenler ne diyor?</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-slate-700 mb-4">"Derslerim çok daha etkili oldu! Öğrenciler materyalleri çok beğeniyor."</p>
                <div className="text-sm text-slate-600">
                  <strong>Ayşe Öğretmen</strong> - İstanbul
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-slate-700 mb-4">"Aradığım tüm materyaller tek yerde. Zaman kazanıyorum!"</p>
                <div className="text-sm text-slate-600">
                  <strong>Mehmet Hoca</strong> - Ankara
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-slate-700 mb-4">"Öğrencilerimle oyunlar oynayarak öğreniyoruz. Harika bir platform!"</p>
                <div className="text-sm text-slate-600">
                  <strong>Fatma Hanım</strong> - İzmir
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hemen Başlayın!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Binlerce materyale anında erişim sağlayın ve derslerinizi daha etkili hale getirin
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center gap-2 text-blue-100">
                <Star className="h-5 w-5 fill-current" />
                <span>Ücretsiz erişim</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Star className="h-5 w-5 fill-current" />
                <span>Anında kullanım</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Star className="h-5 w-5 fill-current" />
                <span>7/24 erişim</span>
              </div>
            </div>
            
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Şimdi Platforma Giriş Yap
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img 
                src="/elt-arena-logo.png" 
                alt="ELT Arena Logo" 
                className="h-8 w-auto"
              />
              <div>
                <div className="font-semibold">ELT Arena</div>
                <div className="text-xs text-slate-400">İngilizce Öğretmenlerinin Buluşma Noktası</div>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              © 2024 ELT Arena. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
