import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const countryFilter = url.searchParams.get('country');

    let recommendations = [];

    if (countryFilter) {
        // If filtering by country, get top active products from that country
        const allProducts = db.getActiveProducts();
        const countries = db.getCountries();
        recommendations = allProducts
            .filter((p: any) => {
                const country = countries.find((c: any) => c.id === p.country_id);
                return country?.slug === countryFilter;
            })
            .slice(0, 8)
            .map((p: any) => db.getProductWithDetails(p.slug))
            .filter((p: any) => p !== undefined);
    } else {
        // Default mixed view - only active products
        // Get featured products (Recommendation mix)
        // Taking 4 snacks and 4 skincare products for a good mix
        const activeProducts = db.getActiveProducts();
        const snacks = activeProducts
            .filter((p: any) => p.category_id === 1)
            .slice(0, 4)
            .map((p: any) => db.getProductWithDetails(p.slug));
        const skincare = activeProducts
            .filter((p: any) => p.category_id === 2)
            .slice(0, 4)
            .map((p: any) => db.getProductWithDetails(p.slug));

        // Interleave them for a mixed feel: [Snack, Skincare, Snack, Skincare, ...]
        const maxLength = Math.max(snacks.length, skincare.length);
        for (let i = 0; i < maxLength; i++) {
            if (snacks[i]) recommendations.push(snacks[i]);
            if (skincare[i]) recommendations.push(skincare[i]);
        }
    }

    // Get active countries for Origin Shortcut
    const countries = db.getActiveCountries();

    // Get Featured Products for Hero - only active
    // Just grab first 4 active products to show in Hero
    const heroProducts = db.getActiveProducts()
        .slice(0, 4)
        .map((p: any) => db.getProductWithDetails(p.slug))
        .filter((p: any) => p !== undefined);
    const heroImages = heroProducts.map((p: any) => p.image_url);

    // Real Bundles Data
    const rawBundles = db.getBundles(true); // Get active only
    const bundles = rawBundles.slice(0, 3).map((b: any) => {
        const enriched = db.getBundleWithDetails(b.slug);
        return enriched ? {
            ...enriched,
            type: 'bundle',
            items: enriched.items.map((i: any) => `${i.quantity}x ${i.product_name}`)
        } : { ...b, type: 'bundle' };
    });

    // Get settings
    const settings = db.getSettings();
    const lowStockThreshold = settings.low_stock_threshold || 10;
    const bestSellersLimit = settings.best_sellers_limit || 10;

    // Get Best Sellers (last 30 days)
    // User requested max 10
    const bestSellers = db.getBestSellerProducts(bestSellersLimit, 30)
        .map((p: any) => db.getProductWithDetails(p.slug))
        .filter((p: any) => p !== undefined);

    // Get Low Stock Products
    // User requested max 5
    const lowStockProducts = db.getLowStockProducts(lowStockThreshold)
        .slice(0, 5)
        .map((p: any) => db.getProductWithDetails(p.slug))
        .filter((p: any) => p !== undefined);

    // Get CMS Content for Home
    const homePage = db.getPage('home');

    return {
        recommendations,
        countries,
        bundles,
        heroImages,
        activeFilter: countryFilter,
        bestSellers,
        lowStockProducts,
        lowStockThreshold,
        pageContent: homePage?.content || {}
    };
};
