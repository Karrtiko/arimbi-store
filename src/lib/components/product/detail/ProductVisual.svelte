<script lang="ts">
	import Image from '$lib/components/ui/Image.svelte';

	let { imageUrl, images, name, onShare } = $props<{
		imageUrl: string;
		images?: string[];
		name: string;
		onShare: () => void;
	}>();

	// Sync state when prop changes (navigation between products)
	let activeImage = $state(imageUrl);
	let isFullscreen = $state(false);
	let isPaused = $state(false);

	$effect(() => {
		activeImage = imageUrl;
	});

	// Ensure we have a valid list, unique items
	let gallery = $derived([...new Set(images && images.length > 0 ? images : [imageUrl])]);

	// Helper to convert URL to watermarked version (same logic as Image component)
	function toWatermarkUrl(url: string): string {
		if (!url) return url;
		if (url.startsWith('/uploads/')) {
			const pathWithoutUploads = url.replace('/uploads/', '');
			return `/api/image/${pathWithoutUploads}`;
		}
		return url;
	}
	// Auto-slideshow
	$effect(() => {
		if (gallery.length > 1 && !isPaused && !isFullscreen) {
			const timer = setInterval(() => {
				nextImage();
			}, 3000);
			return () => clearInterval(timer);
		}
	});

	// Slider Logic
	function nextImage() {
		const idx = gallery.indexOf(activeImage);
		const nextIdx = (idx + 1) % gallery.length;
		activeImage = gallery[nextIdx];
	}

	function prevImage() {
		const idx = gallery.indexOf(activeImage);
		const prevIdx = (idx - 1 + gallery.length) % gallery.length;
		activeImage = gallery[prevIdx];
	}

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
	}
</script>

<div class="visual-col">
	<div
		class="image-wrapper-detail"
		onmouseenter={() => (isPaused = true)}
		onmouseleave={() => (isPaused = false)}
	>
		<!-- Main Image with Click to Fullscreen -->
		<button class="main-img-btn" onclick={toggleFullscreen} title="Click to Zoom">
			<Image src={activeImage} alt={name} />
		</button>

		<!-- Share Button Overlay -->
		<button
			class="share-btn-overlay"
			onclick={(e) => {
				e.stopPropagation();
				onShare();
			}}
			title="Share"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle
					cx="18"
					cy="19"
					r="3"
				/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line
					x1="15.41"
					x2="8.59"
					y1="6.51"
					y2="10.49"
				/></svg
			>
		</button>

		<!-- Slider Arrows -->
		{#if gallery.length > 1}
			<button class="nav-btn prev" onclick={prevImage}>❮</button>
			<button class="nav-btn next" onclick={nextImage}>❯</button>
		{/if}
	</div>

	<!-- Thumbnail Strip -->
	{#if gallery.length > 1}
		<div class="thumb-strip">
			{#each gallery as img}
				<button
					class="thumb-item"
					class:active={activeImage === img}
					onclick={() => (activeImage = img)}
					title="View Image"
				>
					<Image src={img} alt={name} />
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Fullscreen Modal -->
{#if isFullscreen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fullscreen-overlay" onclick={toggleFullscreen}>
		<button class="close-btn" onclick={toggleFullscreen}>&times;</button>
		<!-- Use standard img for fullscreen to avoid potential Image component containment issues in fixed overlay -->
		<img src={toWatermarkUrl(activeImage)} alt={name} class="fullscreen-img" />

		{#if gallery.length > 1}
			<button
				class="nav-btn prev fs-nav"
				onclick={(e) => {
					e.stopPropagation();
					prevImage();
				}}>❮</button
			>
			<button
				class="nav-btn next fs-nav"
				onclick={(e) => {
					e.stopPropagation();
					nextImage();
				}}>❯</button
			>
		{/if}

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fs-thumbnails" onclick={(e) => e.stopPropagation()}>
			{#each gallery as img}
				<button
					class="thumb-item fs-thumb"
					class:active={activeImage === img}
					onclick={() => (activeImage = img)}
				>
					<Image src={img} alt={name} />
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	/* Visual Column */
	.visual-col {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.visual-col {
			position: sticky;
			top: 2rem;
		}
	}

	.image-wrapper-detail {
		border-radius: var(--radius-xl);
		overflow: hidden;
		background: var(--gray-50);
		border: 1px solid var(--gray-100);
		aspect-ratio: 1/1;
		position: relative;
	}

	:global(.image-wrapper-detail .image-wrapper) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	/* Thumbnail Strip */
	.thumb-strip {
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		padding-bottom: 0.5rem; /* Space for scrollbar if any */
	}
	.thumb-item {
		width: 70px;
		height: 70px;
		border-radius: var(--radius-md);
		overflow: hidden;
		border: 2px solid transparent;
		cursor: pointer;
		padding: 0;
		background: var(--gray-50);
		flex-shrink: 0;
	}
	.thumb-item.active {
		border-color: var(--primary-600);
		opacity: 0.8;
	}
	.thumb-item:hover {
		opacity: 0.9;
	}

	/* Image Component inside thumb */
	:global(.thumb-item .image-wrapper) {
		width: 100%;
		height: 100%;
	}
	:global(.thumb-item img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.share-btn-overlay {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: white;
		border: none;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: var(--shadow-lg);
		z-index: 10;
		color: var(--gray-700);
		transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.share-btn-overlay:hover {
		transform: scale(1.15) rotate(5deg);
		color: var(--primary-600);
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(255, 255, 255, 0.8);
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.25rem;
		color: var(--gray-800);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		z-index: 5;
		transition: all 0.2s;
	}
	.nav-btn:hover {
		background: white;
		transform: translateY(-50%) scale(1.1);
	}
	.nav-btn.prev {
		left: 1rem;
	}
	.nav-btn.next {
		right: 1rem;
	}

	/* Main Image Button Wrapper */
	.main-img-btn {
		border: none;
		padding: 0;
		background: none;
		width: 100%;
		height: 100%;
		cursor: zoom-in;
	}

	/* Fullscreen Overlay */
	.fullscreen-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.95);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: none;
		padding: 0;
		cursor: zoom-out;
	}

	.fullscreen-img {
		max-width: 90%;
		max-height: 80vh;
		object-fit: contain;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
	}

	.close-btn {
		position: absolute;
		top: 2rem;
		right: 2rem;
		background: none;
		border: none;
		color: white;
		font-size: 3rem;
		cursor: pointer;
		line-height: 1;
		opacity: 0.8;
	}
	.close-btn:hover {
		opacity: 1;
	}

	.fs-nav {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		width: 60px;
		height: 60px;
		font-size: 2rem;
	}
	.fs-nav:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.fs-thumbnails {
		position: absolute;
		bottom: 2rem;
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		max-width: 90%;
		padding: 1rem;
	}

	.fs-thumb {
		width: 60px;
		height: 60px;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}
	.fs-thumb.active {
		border-color: white;
	}
</style>
