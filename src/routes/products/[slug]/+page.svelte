<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ProductCard from '$lib/components/product/ProductCard.svelte';
	import ShareModal from '$lib/components/ui/ShareModal.svelte';
	import WhatsAppContact from '$lib/components/ui/WhatsAppContact.svelte';

	// Modular Components
	import ProductVisual from '$lib/components/product/detail/ProductVisual.svelte';
	import ProductInfo from '$lib/components/product/detail/ProductInfo.svelte';
	import ProductActions from '$lib/components/product/detail/ProductActions.svelte';

	import { cart } from '$lib/stores/cart.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	// State
	let selectedVariantId = $state(data.product.variants?.[0]?.id || null);
	let showShareModal = $state(false);

	// Derived
	const selectedVariant = $derived(
		data.product.variants?.find((v) => v.id === selectedVariantId) || null
	);

	const currentPrice = $derived(
		selectedVariant ? selectedVariant.price || data.product.price : data.product.price
	);

	const isSnack = $derived(data.product.category_slug === 'snack');
	const themeColor = $derived(isSnack ? 'var(--accent-500)' : 'var(--primary-500)');

	function formatPrice(price: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	function addToCart() {
		const productToAdd = {
			...data.product,
			id: selectedVariant ? `${data.product.id}-${selectedVariant.id}` : data.product.id,
			name: selectedVariant ? `${data.product.name} - ${selectedVariant.name}` : data.product.name, // Append variant name
			price: currentPrice
		};
		cart.addItem(productToAdd);
		cart.open();
	}

	function buyNow() {
		const productToAdd = {
			...data.product,
			id: selectedVariant ? `${data.product.id}-${selectedVariant.id}` : data.product.id,
			name: selectedVariant ? `${data.product.name} - ${selectedVariant.name}` : data.product.name,
			price: currentPrice
		};
		cart.addItem(productToAdd);
		cart.open();
	}

	function openShare() {
		showShareModal = true;
	}
</script>

<svelte:head>
	<title>{data.product.name} - ArimbiStore.ID</title>
	<meta name="description" content={data.product.description} />
</svelte:head>

<Navbar />

<main class="page-container">
	<!-- Breadcrumbs -->
	<nav class="breadcrumbs">
		<a href="/">Home</a>
		<span class="sep">/</span>
		{#if data.product.country_slug}
			<a href="/products?country={data.product.country_slug}">{data.product.country_name}</a>
			<span class="sep">/</span>
		{/if}
		<span class="current">{data.product.name}</span>
	</nav>

	<div class="product-grid">
		<!-- 1. Product Visual -->
		<!-- 1. Product Visual -->
		<ProductVisual
			imageUrl={data.product.image_url}
			images={data.product.images}
			name={data.product.name}
			onShare={openShare}
		/>

		<!-- 2. Product Narrative & Info -->
		<!-- Just passing actions to ProductInfo now -->
		<ProductInfo
			product={data.product}
			bind:selectedVariantId
			{formatPrice}
			{isSnack}
			{themeColor}
			{addToCart}
			{buyNow}
			productName={data.product.name}
			adminWhatsApp={data.adminWhatsApp}
		/>

		<!-- Only mobile footer handled here/separately -->
		<ProductActions
			{addToCart}
			{buyNow}
			{themeColor}
			{currentPrice}
			{formatPrice}
			productName={data.product.name}
			adminWhatsApp={data.adminWhatsApp}
			stock={data.product.stock}
		/>
	</div>

	<!-- Related Products -->
	{#if data.relatedProducts.length > 0}
		<div class="related-section">
			<h2 class="section-title center">Mungkin Kamu Suka Juga</h2>
			<div class="related-grid">
				{#each data.relatedProducts as product}
					<ProductCard {product} />
				{/each}
			</div>
		</div>
	{/if}
</main>

<ShareModal
	bind:isOpen={showShareModal}
	productName={data.product.name}
	productUrl={typeof window !== 'undefined' ? window.location.href : ''}
/>

<Footer />

<style>
	.page-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-lg);
		min-height: 80vh;
		padding-bottom: 100px; /* Mobile sticky bar buffer */
	}

	@media (min-width: 768px) {
		.page-container {
			padding-bottom: var(--space-3xl);
		}
	}

	/* Breadcrumbs */
	.breadcrumbs {
		margin-bottom: var(--space-xl);
		font-size: 0.875rem;
		color: var(--gray-500);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.breadcrumbs a {
		color: var(--gray-600);
		text-decoration: none;
		transition: color 0.2s;
	}

	.breadcrumbs a:hover {
		color: var(--primary-600);
	}

	.breadcrumbs .current {
		font-weight: 600;
		color: var(--gray-900);
	}

	/* Main Grid layout */
	.product-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-2xl);
		margin-bottom: var(--space-3xl);
	}

	@media (min-width: 768px) {
		.product-grid {
			grid-template-columns: 1fr 1fr;
			align-items: start;
		}
	}

	/* Related */
	.related-section {
		border-top: 1px solid var(--gray-200);
		padding-top: var(--space-2xl);
	}

	.section-title.center {
		font-size: 1.5rem;
		font-weight: 700;
		text-align: center;
		margin-bottom: 2rem;
		color: var(--gray-900);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--space-xl);
	}
</style>
