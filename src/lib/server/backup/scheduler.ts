import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { getDatabase } from '$lib/server/db/sqlite';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUP_AGE_DAYS = 7;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Perform a full system backup
 */
export async function performBackup() {
    console.log('🔄 Starting automated backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    try {
        // 1. Backup Database (using better-sqlite3 native backup)
        // This is safe to run while the app is active (hot backup)
        const db = getDatabase();
        const dbBackupPath = path.join(BACKUP_DIR, `arimbi-${timestamp}.db`);

        await db.backup(dbBackupPath);
        console.log(`✅ Database backed up to: ${dbBackupPath}`);

        // 2. Backup Uploads (using tar)
        // Use UPLOAD_DIR env var if set (Docker), otherwise default to static/uploads
        const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'static', 'uploads');

        if (fs.existsSync(uploadsDir)) {
            const uploadsBackupPath = path.join(BACKUP_DIR, `uploads-${timestamp}.tar.gz`);
            // Tar command: we need to find the parent and target name
            // If uploadsDir is /app/static/uploads, we want to tar -C /app/static uploads
            const parentDir = path.dirname(uploadsDir);
            const targetName = path.basename(uploadsDir);

            const cmd = `tar -czf "${uploadsBackupPath}" -C "${parentDir}" "${targetName}"`;

            exec(cmd, (error) => {
                if (error) {
                    console.error('⚠️ Failed to backup uploads via tar:', error);
                    // Fallback or ignore? Uploads might be huge, so failure is critical.
                } else {
                    console.log(`✅ Uploads backed up to: ${uploadsBackupPath}`);
                }
            });
        }

        // 3. Prune old backups
        pruneOldBackups();

    } catch (error) {
        console.error('❌ Backup failed:', error);
    }
}

/**
 * Remove backups older than MAX_BACKUP_AGE_DAYS
 */
function pruneOldBackups() {
    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) return;

        const now = Date.now();
        const maxAge = MAX_BACKUP_AGE_DAYS * 24 * 60 * 60 * 1000;

        files.forEach(file => {
            const filePath = path.join(BACKUP_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;

                if (now - stats.mtimeMs > maxAge) {
                    fs.unlink(filePath, (err) => {
                        if (!err) console.log(`🧹 Pruned old backup: ${file}`);
                    });
                }
            });
        });
    });
}

/**
 * Initialize the backup scheduler
 */
export function initBackupScheduler() {
    // Run every day at 02:00 AM
    // Cron format: Minute Hour DayOfMonth Month DayOfWeek
    cron.schedule('0 2 * * *', () => {
        performBackup();
    });

    console.log('⏰ Backup scheduler initialized (Daily at 02:00 AM)');
}
