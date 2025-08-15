# ELT Arena - Production Deployment Guide

## 🚀 Hızlı Kurulum

### Sistem Gereksinimleri
- Ubuntu 20.04/22.04 LTS
- Node.js 18+ LTS
- PostgreSQL 14+
- Nginx
- Minimum 2GB RAM, 20GB disk
- SSL sertifikası (Let's Encrypt önerilen)

### 1-Click Kurulum
```bash
# Repository'yi clone edin
git clone https://github.com/slymnckn/elt-arena.git /var/www/elt-arena
cd /var/www/elt-arena

# Kurulum scriptini çalıştırın
chmod +x deployment/install.sh
sudo ./deployment/install.sh
```

## 📋 Manuel Kurulum Adımları

### 1. Sistem Hazırlığı
```bash
# Sistem güncelleme
sudo apt update && sudo apt upgrade -y

# Gerekli paketler
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx postgresql postgresql-contrib
```

### 2. Node.js Kurulumu
```bash
# Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 process manager
sudo npm install -g pm2
```

### 3. PostgreSQL Kurulumu
```bash
# PostgreSQL servisini başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Database ve kullanıcı oluştur
sudo -u postgres createuser --interactive
# Kullanıcı adı: elt_arena_user
# Superuser: n
# Create databases: y
# Create roles: n

sudo -u postgres createdb elt_arena
sudo -u postgres psql -c "ALTER USER elt_arena_user WITH PASSWORD 'güçlü_şifre_123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE elt_arena TO elt_arena_user;"
```

### 4. Uygulama Kurulumu
```bash
# Uygulama dizini
sudo mkdir -p /var/www/elt-arena
sudo chown -R $USER:$USER /var/www/elt-arena

# Repository clone
cd /var/www/elt-arena
git clone https://github.com/slymnckn/elt-arena.git .

# Environment dosyası
cp .env.example .env.local
nano .env.local  # Değerleri düzenleyin

# Dependencies ve build
npm ci
npm run build
```

### 5. Database Migration
```bash
# Schema ve initial data
sudo -u postgres psql elt_arena < scripts/database-schema.sql
sudo -u postgres psql elt_arena < scripts/seed-data.sql
```

### 6. PM2 ile Servis
```bash
# Log dizini oluştur
sudo mkdir -p /var/log/elt-arena
sudo chown -R $USER:$USER /var/log/elt-arena

# PM2 ile başlat
pm2 start deployment/ecosystem.config.js

# Sistem başlangıcına ekle
pm2 startup
pm2 save
```

### 7. Nginx Konfigürasyonu
```bash
# Site konfigürasyonu
sudo cp deployment/nginx.conf /etc/nginx/sites-available/elt-arena

# Domain adını güncelleyin
sudo nano /etc/nginx/sites-available/elt-arena

# Site'ı aktif et
sudo ln -s /etc/nginx/sites-available/elt-arena /etc/nginx/sites-enabled/

# Default site'ı kaldır (opsiyonel)
sudo rm /etc/nginx/sites-enabled/default

# Test ve restart
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL Sertifikası
```bash
# Let's Encrypt sertifikası
sudo certbot --nginx -d eltarena.com -d www.eltarena.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

### 9. Firewall Ayarları
```bash
# UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 🔧 Environment Değişkenleri

`.env.local` dosyasında aşağıdaki değerleri düzenleyin:

```env
NODE_ENV=production
DATABASE_URL=postgresql://elt_arena_user:güçlü_şifre_123@localhost:5432/elt_arena
JWT_SECRET=super-secure-jwt-key-32-characters-minimum
NEXTAUTH_URL=https://eltarena.com
PORT=3000
```

## 🗄️ Database Backup

```bash
# Manual backup
sudo -u postgres pg_dump elt_arena > backup_$(date +%Y%m%d_%H%M%S).sql

# Otomatik backup (crontab)
crontab -e
# Add: 0 2 * * * sudo -u postgres pg_dump elt_arena > /home/backups/elt_arena_$(date +\%Y\%m\%d).sql
```

## 📊 Monitoring

```bash
# PM2 durumu
pm2 status
pm2 logs elt-arena

# System durumu
systemctl status nginx
systemctl status postgresql

# Disk kullanımı
df -h

# Memory kullanımı
free -h
```

## 🔄 Güncelleme İşlemi

```bash
cd /var/www/elt-arena

# Backup al
sudo -u postgres pg_dump elt_arena > pre_update_backup_$(date +%Y%m%d_%H%M%S).sql

# Kod güncelle
git pull origin main
npm ci
npm run build

# Servisi yeniden başlat
pm2 restart elt-arena
```

## 🚨 Sorun Giderme

### Port Kontrolü
```bash
sudo lsof -i :3000  # Node.js
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :80    # HTTP
sudo lsof -i :443   # HTTPS
```

### Log İnceleme
```bash
# PM2 logs
pm2 logs elt-arena

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Service Restart
```bash
pm2 restart elt-arena
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

## 📞 Destek

Sorun yaşandığında:
1. Logları kontrol edin
2. Servislerin durumunu kontrol edin  
3. Environment değişkenlerini kontrol edin
4. İletişim: support@broosmedia.com

---


