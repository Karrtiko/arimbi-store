#!/bin/bash

# Arimbi Store - Backup Script
# Backs up SQLite database and uploads directory

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting backup process..."

# Backup database
if [ -f "data/arimbi.db" ]; then
    cp data/arimbi.db "$BACKUP_DIR/arimbi-$DATE.db"
    echo "✅ Database backed up: arimbi-$DATE.db"
else
    echo "⚠️  Database file not found: data/arimbi.db"
fi

# Backup uploads
if [ -d "uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads-$DATE.tar.gz" uploads/
    echo "✅ Uploads backed up: uploads-$DATE.tar.gz"
else
    echo "⚠️  Uploads directory not found"
fi

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "arimbi-*.db" -mtime +7 -delete
find "$BACKUP_DIR" -name "uploads-*.tar.gz" -mtime +7 -delete

# Show backup size
echo ""
echo "📊 Backup Summary:"
echo "   Database: $(ls -lh $BACKUP_DIR/arimbi-$DATE.db 2>/dev/null | awk '{print $5}')"
echo "   Uploads:  $(ls -lh $BACKUP_DIR/uploads-$DATE.tar.gz 2>/dev/null | awk '{print $5}')"
echo "   Total backups: $(ls -1 $BACKUP_DIR | wc -l) files"

echo ""
echo "✅ Backup completed: $DATE"
