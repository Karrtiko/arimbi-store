<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { viewport } from '$lib/actions/viewport';
	import { cart } from '$lib/stores/cart.svelte';

	let { bundles } = $props<{
		bundles: any[];
	}>();

	function addToCart(bundle: any) {
		console.log('Adding bundle to cart:', bundle);
		cart.addItem(bundle);
		cart.open();
	}
</script>

<section class="bundle-section reveal" use:viewport>
	<div class="bundle-container">
		{#each bundles.slice(0, 5) as bundle}
			<a href="/bundles/{bundle.slug}" class="bundle-card">
				<div class="bundle-image">
					<span class="bundle-tag">✨ Best Value Bundle</span>
					{#if bundle.image_url}
						<img src={bundle.image_url} alt={bundle.name} class="img-cover" />
					{:else}
						<!-- Placeholder -->
						<div style="text-align: center; color: var(--primary-300);">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="80"
								height="80"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><path d="m7.5 4.27 9 5.15" /><path
									d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
								/><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-9" /></svg
							>
						</div>
					{/if}
				</div>

				<div class="bundle-content">
					<h2 class="bundle-title">{bundle.name}</h2>
					<p class="bundle-desc">
						{bundle.description}
					</p>

					<div class="bundle-items">
						{#each bundle.items.slice(0, 3) as item}
							<div class="bundle-item">
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
									class="text-primary"><polyline points="20 6 9 17 4 12" /></svg
								>
								{item}
							</div>
						{/each}
						{#if bundle.items.length > 3}
							<div class="more-items">+ {bundle.items.length - 3} more items...</div>
						{/if}
					</div>

					<div class="bundle-price-box">
						<span class="current-price">Rp {bundle.price.toLocaleString('id-ID')}</span>
						{#if bundle.original_price > bundle.price}
							<span class="original-price">Rp {bundle.original_price.toLocaleString('id-ID')}</span>
						{/if}
					</div>

					<div style="align-self: stretch;">
						<Button variant="primary" size="md" style="width: 100%;">View Details</Button>
					</div>
				</div>
			</a>
		{/each}
	</div>
</section>

<style>
	.bundle-section {
		background: #fffdf5; /* Very soft warm bg */
		padding: var(--space-3xl) 0;
		border-top: 1px solid var(--gray-100);
		overflow: hidden;
	}

	.bundle-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--space-lg);
		display: flex;
		gap: var(--space-xl);
		overflow-x: auto;
		padding-bottom: var(--space-lg); /* Space for scrollbar */
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
	}

	/* Hide scrollbar for cleaner look but keep functionality */
	.bundle-container::-webkit-scrollbar {
		height: 8px;
	}
	.bundle-container::-webkit-scrollbar-track {
		background: transparent;
	}
	.bundle-container::-webkit-scrollbar-thumb {
		background: var(--gray-200);
		border-radius: 4px;
	}

	.bundle-card {
		background: white;
		border-radius: var(--radius-xl);
		display: flex; /* Changed from grid to flex column for vertical card in scroll */
		flex-direction: column;
		overflow: hidden;
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--primary-100);
		min-width: 320px;
		max-width: 360px;
		scroll-snap-align: center;
		flex-shrink: 0;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		text-decoration: none;
		color: inherit;
		position: relative;
	}

	.bundle-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
	}

	.bundle-content {
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.bundle-tag {
		position: absolute;
		top: 1rem;
		left: 1rem;
		z-index: 10;
		display: inline-block;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(4px);
		color: var(--primary-700);
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-full);
		font-weight: 600;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		box-shadow: var(--shadow-sm);
	}

	.bundle-title {
		font-size: 1.5rem; /* Smaller title for card */
		font-weight: 800;
		margin-bottom: var(--space-sm);
		color: var(--gray-900);
		letter-spacing: -0.02em;
	}

	.bundle-desc {
		color: var(--gray-600);
		margin-bottom: var(--space-md);
		font-size: 0.9rem;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.bundle-items {
		margin-bottom: var(--space-lg);
		background: var(--gray-50);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		border-left: 3px solid var(--primary-400);
		font-size: 0.85rem;
	}

	.bundle-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		color: var(--gray-800);
		font-weight: 500;
	}
	/* Limit bundle items display */
	.bundle-item:nth-child(n + 4) {
		display: none;
	}
	.more-items {
		font-size: 0.75rem;
		color: var(--gray-500);
		margin-top: 0.25rem;
		font-style: italic;
	}

	.bundle-price-box {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-top: auto;
		margin-bottom: var(--space-md);
	}

	.current-price {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--primary-600);
	}

	.original-price {
		font-size: 0.9rem;
		color: var(--gray-400);
		text-decoration: line-through;
	}

	.bundle-image {
		background: var(--primary-50);
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 240px; /* Fixed height image */
		order: -1; /* Image first */
	}

	.img-cover {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
