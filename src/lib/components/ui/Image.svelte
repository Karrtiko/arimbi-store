<script lang="ts">
	let {
		src,
		alt,
		class: className = '',
		style = '',
		aspectRatio = '1/1'
	} = $props<{
		src: string;
		alt: string;
		class?: string;
		style?: string;
		aspectRatio?: string;
	}>();

	// Apply watermark transformation for uploaded images
	const finalSrc = $derived(() => {
		if (!src) return src;
		// Only transform local uploads
		if (src.startsWith('/uploads/')) {
			const pathWithoutUploads = src.replace('/uploads/', '');
			return `/api/image/${pathWithoutUploads}`;
		}
		return src;
	});

	let isLoading = $state(true);
	let isError = $state(false);

	function handleLoad() {
		isLoading = false;
	}

	function handleError() {
		isLoading = false;
		isError = true;
	}
</script>

<div class="image-wrapper {className}" {style}>
	{#if isLoading}
		<div class="skeleton"></div>
	{/if}

	{#if isError}
		<div class="fallback">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="fallback-icon"
				><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle
					cx="9"
					cy="9"
					r="2"
				/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg
			>
			<span class="fallback-text">No Image</span>
		</div>
	{:else}
		<img
			src={finalSrc()}
			{alt}
			onload={handleLoad}
			onerror={handleError}
			loading="lazy"
			class:loaded={!isLoading}
		/>
	{/if}
</div>

<style>
	.image-wrapper {
		position: relative;
		overflow: hidden;
		width: 100%;
		height: 100%;
		background: var(--gray-100);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.3s ease;
		opacity: 0;
	}

	img.loaded {
		opacity: 1;
	}

	.skeleton {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			var(--gray-100) 25%,
			var(--gray-200) 50%,
			var(--gray-100) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		z-index: 1;
	}

	.fallback {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--gray-50);
		color: var(--gray-400);
		padding: 1rem;
		text-align: center;
		z-index: 2;
	}

	.fallback-icon {
		width: 24px;
		height: 24px;
		margin-bottom: 0.5rem;
		opacity: 0.5;
	}

	.fallback-text {
		font-size: 0.75rem;
		font-weight: 500;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
