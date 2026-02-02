import { initDatabase, seedDatabase } from '$lib/server/db';
import { initBackupScheduler } from '$lib/server/backup/scheduler';

// Initialize database on server start
initDatabase();
// seedDatabase(); // Skipped as we use migration

// Initialize backup scheduler
initBackupScheduler();

console.log('🚀 Server hooks initialized');
