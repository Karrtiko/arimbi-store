import { initDatabase, seedDatabase } from '$lib/server/db';

// Initialize database on server start
initDatabase();
seedDatabase();

console.log('🚀 Server hooks initialized');
