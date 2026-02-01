getProductsPaginated: (page: number = 1, perPage?: number, filters?: { search?: string; category_id?: number; country_id?: number }) => {
    const data = getData();
    const settings = data.settings || {};
    const itemsPerPage = perPage ?? settings.products_per_page_catalog ?? 15;

    // Start with active products
    let products = data.products.filter((p: any) => p.is_active !== 0 && p.is_active !== false);

    // Apply filters
    if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter((p: any) =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower))
        );
    }

    if (filters?.category_id) {
        products = products.filter((p: any) => p.category_id === filters.category_id);
    }

    if (filters?.country_id) {
        products = products.filter((p: any) => p.country_id === filters.country_id);
    }

    // Calculate pagination
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
        items: products.slice(startIndex, endIndex),
        currentPage: validPage,
        totalPages,
        totalItems: totalProducts,
        perPage: itemsPerPage
    };
}
