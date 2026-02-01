<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import BundleSection from '$lib/components/home/BundleSection.svelte';

	let { data } = $props<{ data: { bundles: any[] } }>();
</script>

<Navbar />

<div class="page-container">
	<div class="header">
		<h1>Special Bundles</h1>
		<p>Hemat lebih banyak dengan paket pilihan kami.</p>
	</div>

	<!-- Reuse BundleSection but maybe we want a grid layout here instead of horizontal scroll? 
         The user asked for "halaman bundle gitu", usually implies a full list. 
         BundleSection is now styled for horizontal scroll. 
         I should probably create a specific grid view here or make BundleSection adaptable.
         For now, let's create a Grid Layout here directly to differentiate from Home. 
    -->

	<div class="bundle-grid">
		{#each data.bundles as bundle}
			<a href="/bundles/{bundle.slug}" class="bundle-card">
				<div class="bundle-image">
					{#if bundle.image_url}
						<img src={bundle.image_url} alt={bundle.name} />
					{:else}
						<div class="placeholder">🎁</div>
					{/if}
					<div class="tag">Best Value</div>
				</div>
				<div class="bundle-content">
					<h2>{bundle.name}</h2>
					<p>{bundle.description}</p>
					<div class="price">
						<span class="curr">Rp {bundle.price.toLocaleString('id-ID')}</span>
						{#if bundle.original_price && bundle.original_price > bundle.price}
							<span class="orig">Rp {bundle.original_price.toLocaleString('id-ID')}</span>
						{/if}
					</div>
					<div class="btn-view">View Bundle</div>
				</div>
			</a>
		{/each}
		{#if data.bundles.length === 0}
			<div class="empty">Belum ada bundle tersedia saat ini.</div>
		{/if}
	</div>
</div>

<Footer />

<style>
	.page-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--gray-900);
		margin-bottom: 0.5rem;
	}

	p {
		color: var(--gray-600);
		font-size: 1.125rem;
	}

	.bundle-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
	}

	.bundle-card {
		background: white;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: var(--shadow-md);
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		border: 1px solid var(--gray-200);
		display: flex;
		flex-direction: column;
	}
	.bundle-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
		border-color: var(--primary-300);
	}

	.bundle-image {
		aspect-ratio: 4/3;
		background: var(--gray-100);
		position: relative;
		overflow: hidden;
	}
	.bundle-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
	}
	.tag {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(4px);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--primary-700);
		text-transform: uppercase;
	}

	.bundle-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		color: var(--gray-900);
	}
	.bundle-content p {
		font-size: 0.875rem;
		color: var(--gray-600);
		line-height: 1.5;
		margin-bottom: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.price {
		margin-top: auto;
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
		margin-bottom: 1rem;
	}
	.curr {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--primary-600);
	}
	.orig {
		text-decoration: line-through;
		color: var(--gray-400);
		font-size: 0.875rem;
	}

	.btn-view {
		background: var(--gray-100);
		color: var(--gray-900);
		text-align: center;
		padding: 0.75rem;
		border-radius: 0.5rem;
		font-weight: 600;
		transition: background 0.2s;
	}
	.bundle-card:hover .btn-view {
		background: var(--primary-600);
		color: white;
	}

	.empty {
		grid-column: 1 / -1;
		text-align: center;
		padding: 3rem;
		color: var(--gray-500);
	}
</style>
