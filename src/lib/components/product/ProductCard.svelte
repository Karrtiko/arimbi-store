<script lang="ts">
	import Image from '$lib/components/ui/Image.svelte';
	import LowStockBadge from '$lib/components/ui/LowStockBadge.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import { getWatermarkedUrl } from '$lib/utils/image';

	let { product, lowStockThreshold = 10 } = $props<{
		product: {
			id: number;
			name: string;
			slug: string;
			price: number;
			image_url: string;
			description?: string;
			category_name: string;
			category_slug?: string;
			country_name?: string;
			country_flag?: string;
			attributes?: Record<string, any>;
			stock?: number;
		};
		lowStockThreshold?: number;
	}>();

	function formatPrice(price: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	function handleAddToCart(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		cart.addItem(product);
	}

	// Helper to determine label - now used just as clean badge text without emoji for new design if needed
	// But keeping emoji based on user preference for now, but style will be capsule
	const label = $derived.by(() => {
		if (product.category_slug === 'snack' && product.country_name) {
			return `✈️ Oleh-oleh ${product.country_name}`;
		} else if (product.category_slug === 'skincare') {
			return '✨ Daily Care';
		}
		return product.category_name;
	});

	// Determine color theme based on category
	const isSnack = $derived(product.category_slug === 'snack');
	const isOutOfStock = $derived(product.stock !== undefined && product.stock <= 0);
</script>

<a
	href="/products/{product.slug}"
	class="product-card {isSnack ? 'snack' : 'skincare'} {isOutOfStock ? 'out-of-stock' : ''}"
>
	<div class="product-image-container">
		<Image src={product.image_url} alt={product.name} />
		{#if isOutOfStock}
			<div class="badge-overlay">
				<span class="stock-badge empty">Stok Habis</span>
			</div>
		{:else if product.stock !== undefined && product.stock > 0 && product.stock <= lowStockThreshold}
			<div class="badge-overlay">
				<LowStockBadge />
			</div>
		{/if}
	</div>
	<div class="product-content">
		<span class="category-badge {isSnack ? 'snack' : 'skincare'}">
			{label}
		</span>

		<h3 class="product-name">{product.name}</h3>

		{#if product.description}
			<p class="product-description">{product.description}</p>
		{/if}

		<!-- Metadata removed or simplified as per request for cleaner look, origin is in badge now.
             Can add short origin here if needed but badge logic covers it. -->

		<div class="product-footer">
			<p class="product-price">{formatPrice(product.price)}</p>
			<button
				class="cart-btn"
				onclick={handleAddToCart}
				title={isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
				disabled={isOutOfStock}
			>
				{#if isOutOfStock}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
							x1="12"
							y1="16"
							x2="12.01"
							y2="16"
						/></svg
					>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path
							d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
						/></svg
					>
				{/if}
			</button>
		</div>
	</div>
</a>

<style>
	.product-card {
		background: white;
		border: 1px solid var(--gray-100);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		text-decoration: none;
		display: flex;
		flex-direction: column;
		height: 100%;
		color: inherit;
		position: relative;
	}

	.product-card:hover {
		transform: translateY(-8px);
		box-shadow: var(--shadow-xl);
		border-color: transparent;
	}

	/* Highlight border color on hover based on category */
	.product-card.snack:hover {
		border-top: 4px solid var(--accent-500);
	}

	.product-card.skincare:hover {
		border-top: 4px solid var(--primary-500);
	}

	.product-image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		border-radius: 1rem 1rem 0 0;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
	}

	.badge-overlay {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		z-index: 10;
	}

	:global(.product-image-container .image-wrapper) {
		position: absolute !important;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	:global(.product-card:hover .image-wrapper img) {
		transform: scale(1.05);
	}

	.product-content {
		padding: var(--space-md);
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	/* Capsule Badge positioned above title */
	.category-badge {
		display: inline-flex;
		align-items: center;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.15rem 0.6rem;
		border-radius: var(--radius-full);
		margin-bottom: var(--space-xs);
		letter-spacing: 0.03em;
		text-transform: uppercase;
		align-self: flex-start;
		background: var(--gray-100);
		color: var(--gray-600);
	}

	.category-badge.snack {
		background: var(--accent-50);
		color: var(--accent-700);
	}

	.category-badge.skincare {
		background: var(--primary-50);
		color: var(--primary-700);
	}

	.product-name {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--gray-900);
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.product-description {
		font-size: 0.875rem;
		color: var(--gray-600);
		line-height: 1.5;
		margin-bottom: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Price styling */
	.product-footer {
		margin-top: auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-top: var(--space-sm);
	}

	.product-price {
		font-size: 1.125rem;
		font-weight: 800;
		color: var(--gray-900);
	}

	/* Cart Button: Circular with Primary/Accent Color */
	.cart-btn {
		background: var(--gray-900);
		color: white;
		border: none;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		opacity: 0.9;
	}

	.product-card.snack .cart-btn {
		background: var(--accent-500);
	}

	.product-card.skincare .cart-btn {
		background: var(--primary-500);
	}

	.cart-btn:hover {
		transform: scale(1.1);
		opacity: 1;
		box-shadow: var(--shadow-md);
	}

	/* Out of Stock Styles */
	.product-card.out-of-stock .product-image-container {
		filter: grayscale(0.8);
	}

	.product-card.out-of-stock .cart-btn {
		background: var(--gray-300) !important;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.stock-badge {
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-full);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		display: inline-block;
	}

	.stock-badge.empty {
		background: var(--gray-800);
		color: white;
		border: 1px solid var(--gray-600);
	}
</style>
