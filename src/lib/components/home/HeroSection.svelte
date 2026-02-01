<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Image from '$lib/components/ui/Image.svelte';

	let {
		images = [],
		title = 'Jajanan yang Kamu Kangenin, <br /><span class="text-primary">Skincare yang Kamu Butuhin.</span>',
		subtitle = 'Pengen snack oleh-oleh hits dari luar negeri nggak perlu nunggu jastip. Plus, ada koleksi skincare pilihan buat harian kamu. Semua ready, tinggal angkut!'
	} = $props<{
		images?: string[];
		title?: string;
		subtitle?: string;
	}>();

	// Fill with placeholders if less than 4
	// or just loop what we have. For layout stability let's ensure 4 slots.
	// If empty, we can just use placeholders or repeats.
	const displayImages = $derived(
		images.length >= 4
			? images.slice(0, 4)
			: [...images, ...Array(4 - images.length).fill('/images/products/placeholder.jpg')]
	);
</script>

<section class="hero">
	<div class="hero-container">
		<div class="hero-content">
			<h1 class="hero-title">
				{@html title}
			</h1>
			<p class="hero-subtitle">
				{subtitle}
			</p>
			<div class="hero-buttons">
				<Button href="/products?category=snack" variant="secondary" size="lg"
					>Lihat Katalog Snack</Button
				>
				<Button href="/products?category=skincare" variant="primary" size="lg">Cek Skincare</Button>
			</div>
		</div>
		<div class="hero-visual">
			<div class="hero-image-grid">
				<!-- Dynamic Images -->
				{#each displayImages as src, i}
					<div class="hero-img-card" style={i % 2 !== 0 ? 'margin-top: 3rem;' : ''}>
						<Image {src} alt="Hero Product" />
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		background: linear-gradient(to right, #ffffff 50%, #fbf7ff 50%);
		overflow: hidden;
		position: relative;
	}

	.hero-container {
		max-width: 1280px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		min-height: 600px;
	}

	.hero-content {
		padding: var(--space-2xl) var(--space-lg);
		z-index: 10;
	}

	.hero-visual {
		height: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Subtle pattern overlay */
		background-image: radial-gradient(#e9d5ff 1px, transparent 1px);
		background-size: 20px 20px;
	}

	.hero-image-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		transform: rotate(-3deg);
	}

	.hero-img-card {
		background: white;
		padding: 0.5rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		width: 160px;
		height: 200px;
		transition: transform 0.3s ease;
		overflow: hidden;
		position: relative;
	}

	.hero-img-card:hover {
		transform: translateY(-10px);
	}

	/* Ensure image fills the card */
	:global(.hero-img-card .image-wrapper) {
		height: 100%;
		border-radius: var(--radius-md);
	}

	.hero-title {
		font-size: clamp(2.5rem, 4vw, 3.5rem);
		font-weight: 800;
		line-height: 1.15;
		color: var(--gray-900);
		margin-bottom: var(--space-md);
		letter-spacing: -0.02em;
	}

	.hero-subtitle {
		font-size: 1.125rem;
		color: var(--gray-600);
		margin-bottom: var(--space-xl);
		max-width: 520px;
		line-height: 1.7;
	}

	.hero-buttons {
		display: flex;
		gap: 1rem;
	}

	@media (max-width: 768px) {
		.hero {
			background: linear-gradient(to bottom, white, #fbf7ff);
		}
		.hero-container {
			grid-template-columns: 1fr;
			text-align: center;
			padding-bottom: var(--space-2xl);
		}
		.hero-buttons {
			justify-content: center;
		}
		.hero-image-grid {
			display: none;
		}
	}
</style>
