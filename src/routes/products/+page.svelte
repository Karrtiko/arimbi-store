<script lang="ts">
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ProductCard from '$lib/components/product/ProductCard.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { fade, slide, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	let searchInput = $state(data.filters.search || '');

	function handleSearch(e: Event) {
		e.preventDefault();
		const params = new URLSearchParams(window.location.search);
		if (searchInput) {
			params.set('q', searchInput);
		} else {
			params.delete('q');
		}
		goto(`/products?${params.toString()}`, { noScroll: true }); // Smooth update without jarring scroll
	}

	function filterByCategory(slug: string | null) {
		const params = new URLSearchParams(window.location.search);
		if (slug) {
			params.set('category', slug);
		} else {
			params.delete('category');
		}
		goto(`/products?${params.toString()}`, { noScroll: true });
	}

	function filterByCountry(slug: string | null) {
		const params = new URLSearchParams(window.location.search);
		if (slug) {
			params.set('country', slug);
		} else {
			params.delete('country');
		}
		goto(`/products?${params.toString()}`, { noScroll: true });
	}

	// Derived for active state simpler access
	const activeCategory = $derived(data.filters.category);
	const activeCountry = $derived(data.filters.country);
</script>

<svelte:head>
	<title>Katalog Lengkap - ArimbiStore.ID</title>
	<meta name="description" content="Jelajahi koleksi lengkap snack dan skincare luar negeri kami" />
</svelte:head>

<Navbar />

<main class="page-container">
	<!-- Header Section with Personality -->
	<div class="header-section">
		<h1 class="page-title">Eksplorasi Rasa & Perawatan.</h1>
		<p class="page-subtitle">
			Lagi nyari cemilan luar negeri yang viral atau skincare harian yang cocok di kulit? Cari di
			sini, tinggal klik, langsung bungkus lewat WA.
		</p>

		<!-- Search Bar -->
		<form onsubmit={handleSearch} class="search-form">
			<div class="search-input-wrapper">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="search-icon"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
				>
				<input
					type="text"
					bind:value={searchInput}
					placeholder="Lagi pengen snack apa hari ini?"
					class="search-input"
				/>
			</div>
			<button type="submit" class="search-btn">Cari</button>
		</form>
	</div>

	<!-- Filters: Visual & Interactive -->
	<div class="filters-container">
		<!-- 1. Country Filter (Passport Badge Style) -->
		<div class="filter-group">
			<span class="filter-label">Asal Negara:</span>
			<div class="country-scroll">
				<button
					class="country-btn {activeCountry === null ? 'active' : ''}"
					onclick={() => filterByCountry(null)}
				>
					<div class="flag-circle small">🌍</div>
					<span>Semua</span>
				</button>
				{#each data.countries as country}
					<button
						class="country-btn {activeCountry === country.slug ? 'active' : ''}"
						onclick={() => filterByCountry(country.slug)}
					>
						<div class="flag-circle small">{country.flag_emoji}</div>
						<span>{country.name}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- 2. Category Filter (Pills) -->
		<div class="filter-group">
			<span class="filter-label">Kategori:</span>
			<div class="category-list">
				<button
					class="category-pill {activeCategory === null ? 'active' : ''}"
					onclick={() => filterByCategory(null)}
				>
					Semua
				</button>
				{#each data.categories as category}
					<button
						class="category-pill {activeCategory === category.slug ? 'active' : ''}"
						onclick={() => filterByCategory(category.slug)}
					>
						{category.name}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Products Grid -->
	<div class="products-grid-wrapper">
		{#if data.products.length > 0}
			<div class="grid">
				{#each data.products as product (product.id)}
					<div animate:flip={{ duration: 300 }} in:fly={{ y: 20, duration: 300 }}>
						<ProductCard {product} />
					</div>
				{/each}
			</div>

			<!-- Pagination - Always show to display item count -->
			{#if data.pagination}
				<Pagination
					currentPage={data.pagination.currentPage}
					totalPages={data.pagination.totalPages}
					totalItems={data.pagination.totalItems}
					perPage={data.pagination.perPage}
					baseUrl="/products"
				/>
			{/if}
		{:else}
			<div class="empty-state" in:fade>
				<div class="empty-icon">🕵️‍♀️</div>
				<h2 class="empty-title">Yah, produknya nggak ketemu.</h2>
				<p class="empty-desc">Coba cari pakai kata kunci lain atau reset filter kamu.</p>
				<Button
					href="/products"
					variant="outline"
					onclick={(e) => {
						e.preventDefault();
						goto('/products');
						searchInput = '';
					}}
				>
					Reset Filter
				</Button>
			</div>
		{/if}
	</div>
</main>

<Footer />

<style>
	.page-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: var(--space-2xl) var(--space-lg);
		min-height: 80vh;
	}

	/* Header Styling */
	.header-section {
		max-width: 800px;
		margin: 0 auto var(--space-2xl);
		text-align: center;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--gray-900);
		margin-bottom: var(--space-sm);
		letter-spacing: -0.02em;
	}

	.page-subtitle {
		font-size: 1.125rem;
		color: var(--gray-500);
		margin-bottom: var(--space-lg);
		line-height: 1.6;
	}

	/* Search Bar */
	.search-form {
		display: flex;
		gap: var(--space-sm);
		max-width: 500px;
		margin: 0 auto;
	}

	.search-input-wrapper {
		flex: 1;
		position: relative;
	}

	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--gray-400);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 2.75rem;
		border: 2px solid var(--gray-200);
		border-radius: var(--radius-full);
		font-size: 1rem;
		outline: none;
		transition: all 0.2s;
		font-family: var(--font-body);
	}

	.search-input:focus {
		border-color: var(--primary-400);
		box-shadow: 0 0 0 4px var(--primary-50);
	}

	.search-btn {
		padding: 0 1.5rem;
		background: var(--gray-900);
		color: white;
		border: none;
		border-radius: var(--radius-full);
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.search-btn:hover {
		transform: translateY(-2px);
		background: var(--primary-600);
	}

	/* Filters Layout */
	.filters-container {
		margin-bottom: var(--space-2xl);
		background: white;
		padding: var(--space-lg);
		border-radius: var(--radius-xl);
		border: 1px solid var(--gray-100);
	}

	.filter-group {
		margin-bottom: var(--space-lg);
	}

	.filter-group:last-child {
		margin-bottom: 0;
	}

	.filter-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--gray-400);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-md);
	}

	/* Country Filter Styling */
	.country-scroll {
		display: flex;
		gap: var(--space-lg);
		overflow-x: auto;
		padding-bottom: var(--space-sm);
		scrollbar-width: none;
	}

	.country-scroll::-webkit-scrollbar {
		display: none;
	}

	.country-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		min-width: 60px;
		opacity: 0.6;
		transition: all 0.2s;
	}

	.country-btn:hover,
	.country-btn.active {
		opacity: 1;
		transform: translateY(-2px);
	}

	.flag-circle.small {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: var(--gray-50);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		border: 2px solid transparent;
		transition: all 0.2s;
	}

	.country-btn.active .flag-circle.small {
		border-color: var(--primary-500);
		background: white;
		box-shadow: var(--shadow-md);
	}

	.country-btn span {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--gray-700);
	}

	.country-btn.active span {
		color: var(--primary-700);
	}

	/* Category Pills */
	.category-list {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.category-pill {
		padding: 0.5rem 1.25rem;
		border-radius: var(--radius-full);
		border: 1px solid var(--gray-200);
		background: white;
		color: var(--gray-600);
		font-weight: 600;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.category-pill:hover {
		border-color: var(--gray-400);
		background: var(--gray-50);
	}

	.category-pill.active {
		background: var(--gray-900);
		color: white;
		border-color: var(--gray-900);
	}

	/* Grid Layout */
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--space-xl);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: var(--space-3xl) 0;
		color: var(--gray-500);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: var(--space-md);
	}

	.empty-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--gray-900);
		margin-bottom: var(--space-xs);
	}

	.empty-desc {
		margin-bottom: var(--space-lg);
	}

	@media (max-width: 768px) {
		.page-title {
			font-size: 2rem;
		}
	}
</style>
