<script lang="ts">
	import ProductCard from '$lib/components/product/ProductCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { viewport } from '$lib/actions/viewport';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let { products } = $props<{
		products: any[];
	}>();
</script>

<section class="section reveal" use:viewport>
	<div class="section-header">
		<div class="header-content">
			<h2 class="section-title">Bawa Pulang Rasa Autentik Dunia</h2>
			<p class="section-desc">
				Nggak perlu paspor buat nyobain snack viral dari Jepang atau Bangkok. Kita bawain langsung
				buat kamu.
			</p>
		</div>
		<Button href="/products" variant="ghost">Lihat Semua →</Button>
	</div>

	<div class="grid">
		{#each products as product (product.id)}
			<div animate:flip={{ duration: 400 }} in:fly={{ y: 20, duration: 400, delay: 100 }}>
				<ProductCard {product} />
			</div>
		{:else}
			<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-500);">
				<p>Belum ada produk untuk kategori ini.</p>
				<Button href="/" variant="outline" size="sm" style="margin-top: 1rem;">Lihat Semua</Button>
			</div>
		{/each}
	</div>
</section>

<style>
	.section {
		padding: var(--space-3xl) var(--space-lg);
		max-width: 1280px;
		margin: 0 auto;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: end;
		margin-bottom: var(--space-xl);
	}

	.header-content {
		max-width: 600px;
	}

	.section-title {
		font-size: 2rem;
		font-weight: 700;
		color: var(--gray-900);
		margin-bottom: 0.5rem;
	}

	.section-desc {
		color: var(--gray-500);
		font-size: 1.125rem;
		line-height: 1.6;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--space-xl);
	}

	@media (max-width: 768px) {
		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
	}
</style>
