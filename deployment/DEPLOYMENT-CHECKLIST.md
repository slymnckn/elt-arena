# ELT Arena - Production Deployment Checklist

## 📋 SİSTEM YÖNETİCİSİ İÇİN KONTROL LİSTESİ

### ✅ KURULUM AŞAMASI

#### 1. Repository Clone
```bash
git clone https://github.com/slymnckn/elt-arena.git /var/www/elt-arena
cd /var/www/elt-arena
```

#### 2. Otomatik Kurulum
```bash
chmod +x deployment/install.sh
sudo ./deployment/install.sh
```

#### 3. Environment Konfigürasyonu
```bash
cp .env.example .env.local
nano .env.local
```

**Environment Değerleri:**
- [ ] `DATABASE_URL`: PostgreSQL bağlantı string'i ayarlandı
- [ ] `JWT_SECRET`: Güçlü secret key oluşturuldu (32+ karakter)
- [ ] `NEXTAUTH_URL`: Domain adresi ayarlandı
- [ ] `NODE_ENV=production` ayarlandı

#### 4. Database Setup
```bash
# PostgreSQL kullanıcı ve database oluştur
sudo -u postgres createuser --interactive  # elt_arena_user
sudo -u postgres createdb elt_arena
sudo -u postgres psql -c "ALTER USER elt_arena_user WITH PASSWORD 'güçlü_şifre';"

# Schema ve seed data import
sudo -u postgres psql elt_arena < scripts/database-schema.sql
sudo -u postgres psql elt_arena < scripts/seed-data.sql
```

#### 5. Uygulama Build
```bash
npm ci
npm run build
```

#### 6. PM2 Servis
```bash
pm2 start deployment/ecosystem.config.js
pm2 startup
pm2 save
```

#### 7. Nginx Setup
```bash
# Konfigürasyonu kopyala ve domain'i güncelle
cp deployment/nginx.conf /etc/nginx/sites-available/elt-arena
nano /etc/nginx/sites-available/elt-arena  # Domain adını değiştir

# Site'ı aktif et
ln -s /etc/nginx/sites-available/elt-arena /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### 8. SSL Sertifikası
```bash
certbot --nginx -d eltarena.com -d www.eltarena.com
```

### ✅ TEST AŞAMASI

#### Servis Kontrolü
- [ ] PM2 status: `pm2 status` - elt-arena running
- [ ] Nginx status: `systemctl status nginx` - active
- [ ] PostgreSQL status: `systemctl status postgresql` - active

#### Bağlantı Testleri
- [ ] HTTP erişim: http://eltarena.com → HTTPS'e yönlendiriliyor
- [ ] HTTPS erişim: https://eltarena.com → Site açılıyor
- [ ] Admin panel: https://eltarena.com/admin/login → Giriş ekranı görünüyor

#### Fonksiyonel Testler
- [ ] Admin giriş yapılabiliyor (admin/admin123)
- [ ] Admin paneli açılıyor
- [ ] Duyuru ekleme çalışıyor
- [ ] Dosya yükleme çalışıyor
- [ ] Kullanıcı ekleme çalışıyor

### ✅ GÜVENLİK AŞAMASI

#### Firewall
```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
```

#### Güvenlik Kontrolleri
- [ ] SSL sertifikası geçerli
- [ ] Admin şifresi değiştirildi
- [ ] Database şifresi güçlü
- [ ] JWT secret güçlü ve unique

#### Backup Strategy
```bash
# Otomatik backup setup
crontab -e
# Add: 0 2 * * * sudo -u postgres pg_dump elt_arena > /home/backups/elt_arena_$(date +\%Y\%m\%d).sql
```

### ✅ MONİTORİNG AŞAMASI

#### Log Kontrolü
- [ ] PM2 logs temiz: `pm2 logs elt-arena`
- [ ] Nginx logs temiz: `tail -f /var/log/nginx/error.log`
- [ ] PostgreSQL logs temiz

#### Performance
- [ ] Site hızı tatmin edici
- [ ] Memory kullanımı normal: `free -h`
- [ ] Disk kullanımı normal: `df -h`

### ✅ DOKÜMANTASYON

#### Teslim Bilgileri
- [ ] Site URL'si: https://________________
- [ ] Admin panel URL'si: https://________________/admin/login
- [ ] Admin kullanıcı adı: admin
- [ ] Admin şifresi: ________________ (değiştirilmişse)

#### Backup Bilgileri
- [ ] Database backup lokasyonu: /home/backups/
- [ ] Backup frequency: Günlük 02:00
- [ ] Backup retention: 30 gün

#### Monitoring Bilgileri
- [ ] PM2 process name: elt-arena
- [ ] Log locations: /var/log/elt-arena/
- [ ] SSL certificate expiry: 90 gün otomatik yenileme

### 🚨 SORUN GİDERME

#### Yaygın Sorunlar ve Çözümleri

**Site açılmıyor:**
```bash
pm2 status  # Servis çalışıyor mu?
nginx -t    # Nginx config doğru mu?
systemctl status nginx  # Nginx çalışıyor mu?
```

**Database bağlantısı hatası:**
```bash
sudo -u postgres psql elt_arena -c "SELECT version();"  # DB erişilebilir mi?
```

**SSL problemi:**
```bash
certbot certificates  # Sertifika durumu
nginx -t  # SSL config doğru mu?
```

### 📞 DESTEK İLETİŞİM

Kurulum sırasında sorun yaşanırsa:
- Email: support@broosmedia.com  
- Tel: +90 545 245 1143
- GitHub Issues: https://github.com/slymnckn/elt-arena/issues

---

**✅ Bu checklist'i doldurarak kurulumun tamamlandığını onaylayın.**

**Kurulum Tarihi:** ________________  
**Sistem Yöneticisi:** ________________  
**İmza:** ________________
