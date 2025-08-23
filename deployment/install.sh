#!/bin/bash

# ELT Arena Production Kurulum Scripti
# Bu scripti root yetkisiyle çalıştırın: sudo ./install.sh

set -e

echo "🚀 ELT Arena Production Kurulum Başlıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log fonksiyonu
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Root kontrolü
if [ "$EUID" -ne 0 ]; then
    error "Bu script root yetkisiyle çalıştırılmalıdır. 'sudo ./install.sh' kullanın."
fi

log "Sistem güncelleniyor..."
apt update && apt upgrade -y

log "Gerekli paketler kuruluyor..."
apt install -y curl wget git nginx certbot python3-certbot-nginx postgresql postgresql-contrib

log "Node.js 18 LTS kuruluyor..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

log "PM2 kuruluyor..."
npm install -g pm2

# PostgreSQL setup
log "PostgreSQL konfigüre ediliyor..."
systemctl start postgresql
systemctl enable postgresql

# ELT Arena kullanıcısı oluştur
if ! id "elt-arena" &>/dev/null; then
    log "ELT Arena sistem kullanıcısı oluşturuluyor..."
    useradd -m -s /bin/bash elt-arena
fi

# Uygulama dizini oluştur
log "Uygulama dizini hazırlanıyor..."
mkdir -p /var/www/elt-arena
chown -R elt-arena:elt-arena /var/www/elt-arena

# Log dizini oluştur
mkdir -p /var/log/elt-arena
chown -R elt-arena:elt-arena /var/log/elt-arena

log "Temel kurulum tamamlandı!"
echo ""
echo "📋 Sonraki Adımlar:"
echo "1. Repository'yi clone edin:"
echo "   cd /var/www/elt-arena"
echo "   sudo -u elt-arena git clone https://github.com/slymnckn/elt-arena.git ."
echo ""
echo "2. Environment dosyasını ayarlayın:"
echo "   sudo -u elt-arena cp .env.example .env.local"
echo "   sudo -u elt-arena nano .env.local"
echo ""
echo "3. Database'i kurun:"
echo "   sudo -u postgres createuser --interactive  # elt_arena_user"
echo "   sudo -u postgres createdb elt_arena"
echo "   sudo -u postgres psql -c \"ALTER USER elt_arena_user WITH PASSWORD 'güçlü_şifre';\"" 
echo "   sudo -u postgres psql elt_arena < scripts/database-schema-utf8.sql"
echo "   sudo -u postgres psql elt_arena < scripts/seed-data.sql"
echo ""
echo "4. Uygulamayı çalıştırın:"
echo "   cd /var/www/elt-arena"
echo "   sudo -u elt-arena npm ci"
echo "   sudo -u elt-arena npm run build"
echo "   sudo -u elt-arena pm2 start deployment/ecosystem.config.js"
echo ""
echo "5. Nginx konfigürasyonunu ayarlayın:"
echo "   cp deployment/nginx.conf /etc/nginx/sites-available/elt-arena"
echo "   ln -s /etc/nginx/sites-available/elt-arena /etc/nginx/sites-enabled/"
echo "   nginx -t && systemctl reload nginx"
echo ""
echo "6. SSL sertifikası alın:"
echo "   certbot --nginx -d eltarena.com -d www.eltarena.com"
echo ""
echo "✅ Kurulum scripti tamamlandı!"
