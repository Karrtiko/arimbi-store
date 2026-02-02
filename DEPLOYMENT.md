# 🚀 Deployment Guide - Arimbi Store

## Quick Start

### 1. Prepare Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and set your values
nano .env
```

### 2. Build and Run
```bash
# Using Docker Compose (Recommended)
docker-compose up -d

# Or using Docker directly
docker build -t arimbi-store .
docker run -d -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  --env-file .env \
  --name arimbi-store \
  arimbi-store
```

### 3. Access Application
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

## Important Configuration

### Required Environment Variables
- `SESSION_SECRET`: Generate with `openssl rand -base64 32`
- `ORIGIN`: Your production domain (e.g., https://store.example.com)
- `ADMIN_WHATSAPP`: Your WhatsApp number for order notifications

### Data Persistence
Make sure these directories exist and have proper permissions:
- `./data` - Database storage
- `./uploads` - Product images

## Production Checklist
- [ ] Change SESSION_SECRET to a strong random value
- [ ] Set correct ORIGIN domain
- [ ] Configure reverse proxy (Nginx/Caddy) for HTTPS
- [ ] Set up regular backups of `./data/db.json`
- [ ] Monitor disk space for uploads
- [ ] Configure firewall rules

## Backup & Restore

### Backup
```bash
# Backup database
cp data/db.json data/db.json.backup.$(date +%Y%m%d)

# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

### Restore
```bash
# Restore database
cp data/db.json.backup.YYYYMMDD data/db.json

# Restore uploads
tar -xzf uploads-backup-YYYYMMDD.tar.gz
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs -f

# Or for direct docker
docker logs arimbi-store
```

### Database issues
```bash
# Verify db.json exists and is valid JSON
cat data/db.json | jq .

# Reset database (WARNING: deletes all data)
rm data/db.json
# Restart container to regenerate
```

### Permission issues
```bash
# Fix permissions
sudo chown -R 1000:1000 data uploads
```
