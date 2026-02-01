import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Helper: Ensure directory exists
function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export const GET: RequestHandler = async ({ params, url }) => {
    const imagePath = params.path; // e.g., "products/filename.jpg"
    if (!imagePath) throw error(400, 'Image path required');

    // 1. Resolve source path
    const fullSourcePath = path.resolve('static/uploads', imagePath);
    if (!fs.existsSync(fullSourcePath)) {
        throw error(404, 'Image not found: ' + imagePath);
    }

    // 2. Get Watermark Settings
    const settings = db.getSettings();
    const watermarkPath = settings.watermark_path
        ? path.resolve('static', settings.watermark_path.startsWith('/') ? settings.watermark_path.slice(1) : settings.watermark_path)
        : null;

    // If no watermark configured, serve original (redirect or stream)
    // Redirect is better for performance if no processing needed
    if (!watermarkPath || !fs.existsSync(watermarkPath)) {
        const file = fs.readFileSync(fullSourcePath);
        return new Response(file, {
            headers: {
                'Content-Type': 'image/jpeg', // Simplification, ideally detect mime
                'Cache-Control': 'public, max-age=31536000'
            }
        });
    }

    // 3. Cache Mechanism
    // Cache key based on source mtime + watermark mtime + settings
    const sourceStats = fs.statSync(fullSourcePath);
    const watermarkStats = fs.statSync(watermarkPath);
    const cacheKey = `${imagePath}-${sourceStats.mtimeMs}-${watermarkStats.mtimeMs}-${JSON.stringify(settings)}`;
    // Simple hash for filename
    const hash = Buffer.from(cacheKey).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);

    const cacheDir = path.resolve('static/cache/images');
    ensureDir(cacheDir);
    const cacheFile = path.join(cacheDir, `${hash}.webp`); // Convert to WebP for optimization

    // Check if cached file exists
    if (fs.existsSync(cacheFile)) {
        const file = fs.readFileSync(cacheFile);
        return new Response(file, {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-Image-Cache': 'HIT'
            }
        });
    }

    // 4. Process Image with Sharp
    try {
        const image = sharp(fullSourcePath);
        const metadata = await image.metadata();
        const width = metadata.width || 800;

        // Resize watermark based on scale setting
        const scale = settings.watermark_scale || 0.2;
        const wmWidth = Math.round(width * scale);
        const opacity = settings.watermark_opacity || 0.5;

        // Resize watermark to appropriate size
        let watermarkBuffer = await sharp(watermarkPath)
            .resize(wmWidth)
            .png() // Convert to PNG to preserve transparency
            .toBuffer();

        // Apply opacity by compositing with a transparent layer using dest-in blend
        const watermarkWithOpacity = await sharp(watermarkBuffer)
            .composite([{
                input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
                raw: { width: 1, height: 1, channels: 4 },
                tile: true,
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();

        // Position mapping
        const pos = settings.watermark_position || 'bottom-right';
        let gravity: any = 'southeast';

        switch (pos) {
            case 'center': gravity = 'center'; break;
            case 'top-left': gravity = 'northwest'; break;
            case 'top-right': gravity = 'northeast'; break;
            case 'bottom-left': gravity = 'southwest'; break;
            case 'bottom-right': gravity = 'southeast'; break;
        }

        // Composite watermark onto image
        const outputBuffer = await image
            .composite([{
                input: watermarkWithOpacity,
                gravity: gravity,
                blend: 'over'
            }])
            .webp({ quality: 85 })
            .toBuffer();

        // Save to Cache
        fs.writeFileSync(cacheFile, outputBuffer);

        return new Response(outputBuffer as BodyInit, {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'X-Image-Cache': 'MISS'
            }
        });

    } catch (e: any) {
        console.error('Watermark Error:', e);
        // Fallback to original if error
        const file = fs.readFileSync(fullSourcePath);
        return new Response(file as BodyInit, {
            headers: {
                'Content-Type': 'image/jpeg'
            }
        });
    }
};
