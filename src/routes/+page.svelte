<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import HeroSection from '$lib/components/home/HeroSection.svelte';
	import OriginSection from '$lib/components/home/OriginSection.svelte';
	import RecommendationSection from '$lib/components/home/RecommendationSection.svelte';
	import ProductCard from '$lib/components/product/ProductCard.svelte';
	import BundleSection from '$lib/components/home/BundleSection.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	const { pageContent } = data;
</script>

<svelte:head>
	<title>ArimbiStore.ID - Snack Ikonik & Skincare Pilihan</title>
</svelte:head>

<Navbar />

<!-- 1. The Intro: "Solusi Jastip & Skincare" -->
<HeroSection
	images={data.heroImages}
	title={pageContent.hero_title}
	subtitle={pageContent.hero_subtitle}
/>

<!-- 2. The Passport: "Jalan-Jalan Virtual" -->
<OriginSection
	countries={data.countries}
	title={pageContent.origin_title}
	subtitle={pageContent.origin_subtitle}
/>

<!-- 3. Best Sellers Section -->
{#if data.bestSellers && data.bestSellers.length > 0}
	<section class="section-container best-sellers">
		<div class="container">
			<div class="section-header">
				<h2 class="section-title">{pageContent.best_seller_title || '🔥 Produk Terlaris'}</h2>
				<p class="section-subtitle">
					{pageContent.best_seller_subtitle || 'Favorit pelanggan kami bulan ini'}
				</p>
			</div>
			<div class="product-grid">
				{#each data.bestSellers as product}
					<ProductCard {product} lowStockThreshold={data.lowStockThreshold} />
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- 4. Low Stock Alert Section -->
{#if data.lowStockProducts && data.lowStockProducts.length > 0}
	<section class="section-container low-stock">
		<div class="container">
			<div class="section-header">
				<h2 class="section-title">
					{pageContent.low_stock_title || '⚡ Buruan! Stok Tinggal Sedikit'}
				</h2>
				<p class="section-subtitle">
					{pageContent.low_stock_subtitle || 'Jangan sampai kehabisan produk favoritmu'}
				</p>
			</div>
			<div class="product-grid">
				{#each data.lowStockProducts as product}
					<ProductCard {product} lowStockThreshold={data.lowStockThreshold} />
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- 5. The Discovery: "Mixed Grid" with Custom Copy -->
<RecommendationSection products={data.recommendations} />

{#if data.bundles && data.bundles.length > 0}
	<!-- 6. The Bundle: "Me-Time Closing Story" -->
	<BundleSection bundles={data.bundles} />
{/if}

<Footer />

<style>
	.section-container {
		padding: 3rem 0;
	}

	.section-container.best-sellers {
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%);
	}

	.section-container.low-stock {
		background: linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%);
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.section-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.section-title {
		font-size: 2rem;
		font-weight: 800;
		margin-bottom: 0.5rem;
		color: #1f2937;
	}

	.section-subtitle {
		font-size: 1.125rem;
		color: #6b7280;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
	}
</style>
