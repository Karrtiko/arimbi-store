# 🗄️ SQLite Migration Guide

## Overview
This guide explains how to migrate from JSON file storage to SQLite database.

## Why SQLite?
- ✅ **Better Performance**: Faster queries and indexing
- ✅ **Data Integrity**: ACID transactions prevent corruption
- ✅ **Concurrency**: Multiple reads/writes without conflicts
- ✅ **Backup Friendly**: Single file, easy to backup
- ✅ **Production Ready**: Battle-tested, reliable

---

## Migration Steps

### 1. Backup Current Data
```bash
# Backup JSON database
cp src/lib/server/data/db.json src/lib/server/data/db.json.backup

# Backup uploads
cp -r static/uploads static/uploads.backup
```

### 2. Run Migration Script
```bash
npm run migrate
```

This will:
- Create `data/arimbi.db` SQLite database
- Import all products, bundles, transactions, settings, and pages
- Preserve all data integrity

### 3. Switch to SQLite Database Layer

**Option A: Rename files (Recommended)**
```bash
# Backup old index
mv src/lib/server/db/index.ts src/lib/server/db/index_json.ts.backup

# Use SQLite version
mv src/lib/server/db/index_sqlite.ts src/lib/server/db/index.ts
```

**Option B: Manual update**
Update imports in `src/lib/server/db/index.ts` to use SQLite functions.

### 4. Test Locally
```bash
npm run dev
```

Visit http://localhost:3000 and verify:
- [ ] Homepage loads with products
- [ ] Can browse catalog
- [ ] Admin login works
- [ ] Can view transactions
- [ ] Can create new transaction
- [ ] Settings are preserved

### 5. Deploy with Docker
```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify data persists after restart
docker-compose restart
docker-compose logs -f
```

---

## Rollback Plan

If something goes wrong:

```bash
# Stop application
docker-compose down  # or Ctrl+C if running dev

# Restore JSON version
mv src/lib/server/db/index_json.ts.backup src/lib/server/db/index.ts

# Restore data
cp src/lib/server/data/db.json.backup src/lib/server/data/db.json

# Restart
npm run dev
```

---

## Database Location

- **Development**: `./data/arimbi.db`
- **Docker**: `/app/data/arimbi.db` (mounted to `./data`)

---

## Backup & Restore

### Backup
```bash
# Simple copy
cp data/arimbi.db data/arimbi.db.backup.$(date +%Y%m%d)

# Or use SQLite backup command
sqlite3 data/arimbi.db ".backup data/arimbi.db.backup"
```

### Restore
```bash
cp data/arimbi.db.backup.YYYYMMDD data/arimbi.db
```

### Automated Backups (Cron)
```bash
# Add to crontab
0 2 * * * cp /path/to/data/arimbi.db /path/to/backups/arimbi-$(date +\%Y\%m\%d).db
```

---

## Troubleshooting

### Migration fails
- Check JSON file is valid: `cat src/lib/server/data/db.json | jq .`
- Ensure `data/` directory exists
- Check file permissions

### Database locked error
- Only one process can write at a time
- Stop dev server before migration
- Check no other processes are using the database

### Data missing after migration
- Check migration script output for errors
- Verify data exists in SQLite: `sqlite3 data/arimbi.db "SELECT COUNT(*) FROM products;"`
- Restore from backup if needed

---

## Database Management

### View Data
```bash
# Open SQLite CLI
sqlite3 data/arimbi.db

# Useful commands
.tables                    # List tables
.schema products           # Show table structure
SELECT * FROM products;    # Query data
.quit                      # Exit
```

### Optimize Database
```bash
sqlite3 data/arimbi.db "VACUUM;"
```

---

## Next Steps

After successful migration:
1. Monitor application for any issues
2. Set up automated backups
3. Remove old JSON backup files (keep one for safety)
4. Update documentation

---

## Support

If you encounter issues:
1. Check migration script output
2. Review application logs
3. Verify database file exists and is readable
4. Test queries manually with sqlite3 CLI
