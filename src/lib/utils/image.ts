
/**
 * Transforms a raw image URL into a watermarked API URL.
 * Only transforms local uploads (starting with /uploads/).
 * External URLs or static assets are returned as is.
 */
export function getWatermarkedUrl(url: string | undefined): string {
    if (!url) return '/images/products/placeholder.jpg';

    // Check if it's a local upload
    if (url.startsWith('/uploads/')) {
        // Remove leading slash for API path
        const relativePath = url.substring(1);
        return `/api/image/${relativePath}`;
    }

    return url;
}
