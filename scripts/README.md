# Database Scripts

Bu klasörde ELT Arena projesi için veritabanı kurulum scriptleri bulunmaktadır.

## Dosyalar

### `database-schema.sql`
- **Amaç**: Tam veritabanı şeması ve otomatik veri üretimi
- **İçerik**: Tablolar, indexler, constraint'ler, trigger'lar ve 816 örnek kaynak
- **Kullanım**: `Get-Content scripts/database-schema.sql -Encoding UTF8 | docker exec -i elt-arena-postgres psql -U postgres -d elt_arena`

### `setup-database.js`
- **Amaç**: UTF-8 encoding ile temel sınıf verilerini insert eder
- **İçerik**: 13 sınıf, 26 ünite ve temel kayıtları ekler
- **Kullanım**: `node scripts/setup-database.js`

### `add-sample-resources.js`
- **Amaç**: Mevcut ünitelere örnek eğitim materyalleri ekler
- **İçerik**: Her ünite için 3 farklı tipte materyal (sunum, oyun, özet)
- **Kullanım**: `node scripts/add-sample-resources.js`

## Kurulum Sırası

1. PostgreSQL container'ı çalıştır
2. `database-schema.sql` ile şemayı oluştur (tam veri seti için)
3. Veya `setup-database.js` ile temel verileri ekle
4. `add-sample-resources.js` ile ek materyaller ekle

## Not

Tüm scriptler UTF-8 encoding ile Türkçe karakter desteği sağlar.
