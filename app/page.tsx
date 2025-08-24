import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight,
  GraduationCap
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
    </div>
  )
}
