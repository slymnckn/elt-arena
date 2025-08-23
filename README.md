# ELT Arena

**İngilizce Öğretmenlerinin Buluşma Noktası**

Modern, kapsamlı ve kullanıcı dostu İngilizce öğretim materyalleri platformu.

## ✨ Özellikler

- 📚 **Kapsamlı Materyal Kütüphanesi**: İlkokul, Ortaokul, Lise ve Yabancı Dil kategorilerinde 800+ eğitim materyali
- 🎯 **Sınıf Bazlı Organizasyon**: Her sınıf seviyesi için özel düzenlenmiş üniteler ve konular
- 🎮 **Çoklu Materyal Türü**: Sunumlar, oyunlar, özet materyalleri, sınavlar, videolar ve kelime çalışmaları
- 👨‍💼 **Admin Paneli**: Materyal ve duyuru yönetimi için tam kontrol paneli
- 📱 **Responsive Tasarım**: Mobil ve masaüstü uyumlu modern arayüz
- 🔒 **Güvenli Sistem**: JWT tabanlı kimlik doğrulama ve yetkilendirme

## 🛠 Teknoloji Stack

- **Frontend**: Next.js 15.2.4, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Veritabanı**: PostgreSQL 15 (Docker)
- **UI Components**: Shadcn/ui
- **Authentication**: JWT + bcryptjs
- **File Storage**: Local storage system

## 🚀 Kurulum

> **📖 Detaylı development setup için:** [DEVELOPMENT.md](./DEVELOPMENT.md) dosyasını inceleyin.

### ⚡ Hızlı Başlangıç

1. **Proje klonlama**
   \`\`\`powershell
   git clone <repository-url>
   cd elt-arena
   \`\`\`

2. **Bağımlılıkları yükle**
   \`\`\`powershell
   pnpm install
   \`\`\`

3. **PostgreSQL başlat**
   \`\`\`powershell
   docker run -d --name elt-arena-postgres `
     -e POSTGRES_PASSWORD=postgres123 `
     -e POSTGRES_DB=elt_arena `
     -p 5432:5432 `
     postgres:15
   \`\`\`

4. **Environment setup**
   \`\`\`powershell
   Copy-Item .env.example .env.local
   # .env.local dosyasını düzenle
   \`\`\`

5. **Database setup**
   \`\`\`powershell
   # Ana tabloları ve verileri yükle (detaylar için DEVELOPMENT.md)
   Get-Content scripts/01-create-tables-fixed.sql -Raw -Encoding UTF8 | docker exec -i elt-arena-postgres psql -U postgres -d elt_arena
   Get-Content scripts/02-seed-data.sql -Raw -Encoding UTF8 | docker exec -i elt-arena-postgres psql -U postgres -d elt_arena
   \`\`\`

6. **Uygulamayı başlat**
   \`\`\`powershell
   pnpm dev
   \`\`\`

## 📁 Proje Yapısı

\`\`\`
elt-arena/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── admin/             # Admin paneli
│   └── layout.tsx         # Root layout
├── components/            # React bileşenleri
├── context/              # React context
├── hooks/                # Custom hooks
├── lib/                  # Utilities & database
├── public/               # Static dosyalar
├── scripts/              # Database scripts
└── styles/               # Global styles
\`\`\`

## 🔧 Veritabanı

- **Grades**: Sınıf seviyeleri (2-12 + Yabancı Dil)
- **Units**: Ünite organizasyonu
- **Resources**: Eğitim materyalleri
- **Admin Users**: Yönetici hesapları
- **Announcements**: Duyuru sistemi
- **Files**: Dosya yönetimi

## 👨‍💼 Admin Paneli

- **URL**: \`http://localhost:3000/admin\`
- **Varsayılan Giriş**: \`admin\` / \`admin123\`
- **Özellikler**:
  - Materyal yönetimi
  - Duyuru sistemi
  - Kullanıcı istatistikleri

## 📱 API Endpoints

- \`GET /api/grades\` - Tüm sınıflar ve materyaller
- \`GET /api/announcements\` - Aktif duyurular
- \`POST /api/admin/login\` - Admin girişi
- \`POST /api/files/upload\` - Dosya yükleme

## 🎯 Kullanım

1. **Ana Sayfa**: Sınıf kategorilerini görüntüle
2. **Kategori Seçimi**: İlkokul, Ortaokul, Lise veya Yabancı Dil
3. **Sınıf Seçimi**: İstenen sınıf seviyesini seç
4. **Ünite Gezinme**: Ünite listesini incele
5. **Materyal Türleri**: Sunum, oyun, özet, sınav, video, kelime
6. **Materyal İndirme**: Kaynakları indir ve kullan

## 💡 Katkıda Bulunma

Bu proje Broos Media tarafından eğitim sistemi için geliştirilmiştir. Katkılarınızı bekliyoruz!

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

## 🛟 Destek

Herhangi bir sorun için GitHub Issues'ı kullanın.

## 🚀 Production Deployment

Production ortamında çalıştırmak için [Deployment Guide](deployment/README.md) dosyasını inceleyin.

### Hızlı Production Kurulumu
```bash
git clone https://github.com/slymnckn/elt-arena.git /var/www/elt-arena
cd /var/www/elt-arena
chmod +x deployment/install.sh
sudo ./deployment/install.sh
```

### Sistem Gereksinimleri
- Ubuntu 20.04/22.04 LTS
- Node.js 18+ LTS
- PostgreSQL 14+
- Nginx
- Minimum 2GB RAM, 20GB disk

### Environment Setup
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/elt_arena
JWT_SECRET=your-secure-secret
NEXTAUTH_URL=https://eltarena.com
```

---

**Geliştirici**: Broos Media 
**Versiyon**: 1.0.0  
**Son Güncellenme**: Ağustos 2025
