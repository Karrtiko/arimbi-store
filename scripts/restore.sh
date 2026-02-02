#!/bin/bash

# Arimbi Store - Restore Script
# Restores SQLite database and uploads from backup

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh YYYYMMDD-HHMMSS"
    echo ""
    echo "Available backups:"
    ls -1 backups/arimbi-*.db 2>/dev/null | sed 's/backups\/arimbi-//g' | sed 's/.db//g'
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="./backups"

echo "🔄 Starting restore process for backup: $BACKUP_DATE"

# Check if backup exists
if [ ! -f "$BACKUP_DIR/arimbi-$BACKUP_DATE.db" ]; then
    echo "❌ Backup not found: $BACKUP_DIR/arimbi-$BACKUP_DATE.db"
    exit 1
fi

# Confirm restore
read -p "⚠️  This will overwrite current data. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Stop Docker container if running
echo "🛑 Stopping Docker container..."
docker-compose down 2>/dev/null || true

# Backup current data before restore
if [ -f "data/arimbi.db" ]; then
    CURRENT_BACKUP="data/arimbi.db.before-restore-$(date +%Y%m%d-%H%M%S)"
    cp data/arimbi.db "$CURRENT_BACKUP"
    echo "💾 Current database backed up to: $CURRENT_BACKUP"
fi

# Restore database
echo "📥 Restoring database..."
cp "$BACKUP_DIR/arimbi-$BACKUP_DATE.db" data/arimbi.db
echo "✅ Database restored"

# Restore uploads if backup exists
if [ -f "$BACKUP_DIR/uploads-$BACKUP_DATE.tar.gz" ]; then
    echo "📥 Restoring uploads..."
    
    # Backup current uploads
    if [ -d "uploads" ]; then
        mv uploads "uploads.before-restore-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # Extract backup
    tar -xzf "$BACKUP_DIR/uploads-$BACKUP_DATE.tar.gz"
    echo "✅ Uploads restored"
else
    echo "⚠️  No uploads backup found for this date"
fi

echo ""
echo "✅ Restore completed!"
echo ""
echo "Next steps:"
echo "  1. Start Docker: docker-compose up -d"
echo "  2. Check logs: docker-compose logs -f"
echo "  3. Verify data in admin dashboard"
