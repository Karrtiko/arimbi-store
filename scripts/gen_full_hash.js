
import bcrypt from 'bcryptjs';
import fs from 'fs';

async function generate() {
    const hash = await bcrypt.hash('admin123', 10);
    fs.writeFileSync('temp_hash.txt', hash);
    console.log('Hash generated and saved to temp_hash.txt');
}

generate();
