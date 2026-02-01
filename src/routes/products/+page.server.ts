import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const categoryFilter = url.searchParams.get('category');
    const countryFilter = url.searchParams.get('country');
    const searchQuery = url.searchParams.get('q');
    const pageParam = url.searchParams.get('page');
    const currentPage = pageParam ? parseInt(pageParam) : 1;

    // Get settings for pagination
    const settings = db.getSettings();
    const perPage = settings.products_per_page_catalog || 15;

    // Build filters for pagination
    const paginationFilters: any = {};
    if (searchQuery) paginationFilters.search = searchQuery;
    if (categoryFilter) {
        const category = db.getCategoryBySlug(categoryFilter);
        if (category) paginationFilters.category_id = category.id;
    }
    if (countryFilter) {
        const country = db.getCountryBySlug(countryFilter);
        if (country) paginationFilters.country_id = country.id;
    }

    // Get paginated products
    const paginationResult = db.getProductsPaginated(currentPage, perPage, paginationFilters);

    // Safely extract products from result - handle both old and new structure
    const productItems = (paginationResult as any).products || (paginationResult as any).items || [];

    // Get details for products and filter only active (double check)
    const products = productItems
        .filter((p: any) => p && (p.is_active !== 0 && p.is_active !== false))
        .map((p: any) => db.getProductWithDetails(p.slug))
        .filter((p: any) => p !== undefined);

    // Get all categories and active countries for filters
    const categories = db.getCategories();
    const countries = db.getActiveCountries();

    // Extract pagination info safely
    const paginationInfo = (paginationResult as any).pagination || paginationResult;

    return {
        products,
        categories,
        countries,
        filters: {
            category: categoryFilter,
            country: countryFilter,
            search: searchQuery,
        },
        pagination: {
            currentPage: paginationInfo.currentPage || currentPage,
            totalPages: paginationInfo.totalPages || 1,
            totalItems: paginationInfo.totalProducts || paginationInfo.totalItems || productItems.length,
            perPage: paginationInfo.perPage || perPage
        }
    };
};
