<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { cart } from '$lib/stores/cart.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { page } from '$app/stores';

	let { data } = $props<{ data: { bundle: any } }>();

	// Derived state for gallery
	let currentImage = $state(
		data.bundle.image_url || (data.bundle.images && data.bundle.images[0]) || ''
	);

	// Use images array if available, otherwise just image_url
	let images = $derived(
		data.bundle.images && data.bundle.images.length > 0
			? data.bundle.images
			: data.bundle.image_url
				? [data.bundle.image_url]
				: []
	);

	function addToCart() {
		if (data.bundle.stock <= 0) return;

		console.log('Adding bundle to cart:', data.bundle);
		cart.addItem(data.bundle);
		cart.open();
	}

	// Share functionality
	let showShareModal = $state(false);
	function openShare() {
		showShareModal = true;
	}

	function buyNow() {
		if (data.bundle.stock <= 0) return;
		cart.addItem(data.bundle);
		cart.open();
	}

	// WhatsApp Logic
	let showWhatsAppModal = $state(false);
	let waName = $state('');
	let waQuestion = $state('');

	function handleWhatsAppClick() {
		showWhatsAppModal = true;
	}

	function sendWhatsApp() {
		if (!waName.trim() || !waQuestion.trim()) {
			alert('Mohon lengkapi nama dan pertanyaan Anda');
			return;
		}

		let message = `Halo Admin Arimbi Store!\n\n`;
		message += `Nama: ${waName}\n`;
		message += `Bundle: ${data.bundle.name}\n`;
		message += `Link: ${window.location.href}\n`;
		message += `\nPertanyaan:\n${waQuestion}`;

		const encodedMessage = encodeURIComponent(message);
		const phone = $page.data.settings?.admin_whatsapp || '6281234567890'; // Dynamic phone
		const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

		window.open(whatsappUrl, '_blank');
		showWhatsAppModal = false;
		waName = '';
		waQuestion = '';
	}
</script>

<Navbar />

<div class="page-container">
	<div class="breadcrumb">
		<a href="/">Home</a> / <a href="/bundles">Bundles</a> / <span>{data.bundle.name}</span>
	</div>

	<div class="product-grid">
		<!-- Gallery Section -->
		<div class="gallery-section">
			<div class="main-image">
				{#if currentImage}
					<img src={currentImage} alt={data.bundle.name} />
				{:else}
					<div class="placeholder">🎁</div>
				{/if}

				<!-- Overlays -->
				<button class="share-btn-overlay" onclick={openShare} aria-label="Share">
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
					>
						<circle cx="18" cy="5" r="3" />
						<circle cx="6" cy="12" r="3" />
						<circle cx="18" cy="19" r="3" />
						<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
						<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
					</svg>
				</button>

				{#if data.bundle.stock <= 0}
					<div class="stock-badge out">Out of Stock</div>
				{:else if data.bundle.stock <= 10}
					<div class="stock-badge low">Only {data.bundle.stock} left!</div>
				{/if}
			</div>

			{#if images.length > 1}
				<div class="thumbnails">
					{#each images as img}
						<button
							class="thumb-btn"
							class:active={currentImage === img}
							onclick={() => (currentImage = img)}
						>
							<img src={img} alt="Thumbnail" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Info Section -->
		<div class="info-section">
			<div class="header">
				<span class="tag">Bundle Deal</span>
				<h1>{data.bundle.name}</h1>
				<div class="price-container">
					<span class="price">Rp {data.bundle.price.toLocaleString('id-ID')}</span>
					{#if data.bundle.original_price > data.bundle.price}
						<span class="original-price"
							>Rp {data.bundle.original_price.toLocaleString('id-ID')}</span
						>
						<span class="discount-badge">
							Save {Math.round((1 - data.bundle.price / data.bundle.original_price) * 100)}%
						</span>
					{/if}
				</div>
			</div>

			<div class="description">
				<h3>Description</h3>
				<p>{data.bundle.description}</p>
			</div>

			<div class="contents">
				<h3>What's Inside?</h3>
				<ul class="item-list">
					{#each data.bundle.items as item}
						<li>
							<a href="/products/{item.product_slug}" class="item-link">
								<div class="item-thumb">
									{#if item.product_image}
										<img src={item.product_image} alt={item.product_name} />
									{:else}
										<span>📦</span>
									{/if}
								</div>
								<div class="item-info">
									<span class="name">{item.product_name}</span>
									<span class="qty">x{item.quantity}</span>
								</div>
								<span class="arrow">→</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="actions">
				<div class="action-row">
					<Button
						variant="secondary"
						size="xl"
						style="flex: 1;"
						onclick={addToCart}
						disabled={data.bundle.stock <= 0}
					>
						{data.bundle.stock > 0 ? '+ Keranjang' : 'Out of Stock'}
					</Button>

					<Button
						variant="primary"
						size="xl"
						style="flex: 1;"
						onclick={buyNow}
						disabled={data.bundle.stock <= 0}
					>
						Beli Sekarang
					</Button>
				</div>

				<button class="btn-whatsapp" onclick={handleWhatsAppClick}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
						/>
					</svg>
					Chat dengan Admin
				</button>
			</div>

			<div class="guarantee">
				<div class="g-item">
					<span>🛡️</span> Original Products
				</div>
				<div class="g-item">
					<span>🚚</span> Fast Shipping
				</div>
				<div class="g-item">
					<span>💬</span> Order via WhatsApp
				</div>
			</div>
		</div>
	</div>
</div>

<!-- WhatsApp Modal -->
{#if showWhatsAppModal}
	<div class="wa-modal-overlay" onclick={() => (showWhatsAppModal = false)}>
		<div class="wa-modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="wa-modal-header">
				<h3>💬 Chat dengan Admin</h3>
				<button class="wa-close-btn" onclick={() => (showWhatsAppModal = false)}>✕</button>
			</div>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					sendWhatsApp();
				}}
			>
				<div class="wa-form-group">
					<label for="wa-name">Nama Anda</label>
					<input
						id="wa-name"
						type="text"
						bind:value={waName}
						placeholder="Masukkan nama Anda"
						required
					/>
				</div>
				<div class="wa-form-group">
					<label for="wa-question">Pertanyaan</label>
					<textarea
						id="wa-question"
						bind:value={waQuestion}
						placeholder="Apa yang ingin Anda tanyakan?"
						rows="4"
						required
					></textarea>
				</div>
				<button type="submit" class="wa-submit-btn">Kirim via WhatsApp</button>
			</form>
		</div>
	</div>
{/if}

<!-- Share Modal from lib -->
<!-- We can create a simple one inline or reuse ShareModal if imported -->
{#if showShareModal}
	<div class="wa-modal-overlay" onclick={() => (showShareModal = false)}>
		<div
			class="wa-modal-content"
			onclick={(e) => e.stopPropagation()}
			style="text-align: center; padding: 2rem;"
		>
			<h3>Share Bundle</h3>
			<p>Link copied to clipboard!</p>
			<button
				class="wa-submit-btn"
				onclick={() => {
					navigator.clipboard.writeText(window.location.href);
					showShareModal = false;
				}}>Copy Link Again</button
			>
		</div>
	</div>
{/if}

<Footer />

<style>
	.share-btn-overlay {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: white;
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		color: var(--gray-700);
		opacity: 0;
		transform: translateY(-10px);
		transition: all 0.2s;
	}
	.main-image:hover .share-btn-overlay {
		opacity: 1;
		transform: translateY(0);
	}

	.action-row {
		display: flex;
		gap: 1rem;
	}

	.btn-whatsapp {
		background: #25d366;
		color: white;
		border: none;
		padding: 0.75rem;
		border-radius: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s;
		width: 100%;
	}
	.btn-whatsapp:hover {
		background: #20ba5a;
	}

	.wa-modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.wa-modal-content {
		background: white;
		border-radius: 1rem;
		max-width: 500px;
		width: 100%;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		overflow: hidden;
	}

	.wa-modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.wa-modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #1f2937;
	}

	.wa-close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #9ca3af;
		cursor: pointer;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.wa-close-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.wa-modal-content form {
		padding: 1.5rem;
	}

	.wa-form-group {
		margin-bottom: 1.25rem;
	}

	.wa-form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #374151;
		font-size: 0.875rem;
	}

	.wa-form-group input,
	.wa-form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		font-family: inherit;
		transition: all 0.2s;
	}

	.wa-form-group input:focus,
	.wa-form-group textarea:focus {
		outline: none;
		border-color: #25d366;
		box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
	}

	.wa-form-group textarea {
		resize: vertical;
		min-height: 100px;
	}

	.wa-submit-btn {
		width: 100%;
		background: #25d366;
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.875rem 1.5rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s;
	}

	.wa-submit-btn:hover {
		background: #20ba5a;
	}

	.page-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 2rem;
	}

	.breadcrumb {
		margin-bottom: 2rem;
		color: var(--gray-500);
		font-size: 0.875rem;
	}
	.breadcrumb a {
		color: var(--gray-700);
		text-decoration: none;
	}
	.breadcrumb a:hover {
		color: var(--primary-600);
	}

	.product-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
	}

	@media (max-width: 768px) {
		.product-grid {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}

	/* Gallery */
	.gallery-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.main-image {
		aspect-ratio: 1;
		background: var(--gray-50);
		border-radius: 1.5rem;
		overflow: hidden;
		border: 1px solid var(--gray-200);
		position: relative;
	}
	.main-image img {
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
		font-size: 5rem;
	}

	.stock-badge {
		position: absolute;
		top: 1rem;
		left: 1rem;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		font-weight: 700;
		font-size: 0.875rem;
		color: white;
		text-transform: uppercase;
		box-shadow: var(--shadow-md);
	}
	.stock-badge.low {
		background: #eab308;
	}
	.stock-badge.out {
		background: #ef4444;
	}

	.thumbnails {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
	}
	.thumb-btn {
		width: 80px;
		height: 80px;
		border-radius: 0.75rem;
		overflow: hidden;
		border: 2px solid transparent;
		background: white;
		cursor: pointer;
		padding: 0;
		flex-shrink: 0;
	}
	.thumb-btn.active {
		border-color: var(--primary-600);
	}
	.thumb-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Info */
	.info-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.tag {
		display: inline-block;
		background: var(--primary-100);
		color: var(--primary-700);
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		margin-bottom: 0.5rem;
	}

	h1 {
		font-size: 3rem;
		font-weight: 800;
		color: var(--gray-900);
		line-height: 1.1;
		margin-bottom: 1rem;
	}

	.price-container {
		display: flex;
		align-items: baseline;
		gap: 1rem;
	}
	.price {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--primary-600);
	}
	.original-price {
		font-size: 1.25rem;
		color: var(--gray-400);
		text-decoration: line-through;
	}
	.discount-badge {
		background: #fee2e2;
		color: #991b1b;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-weight: 700;
		font-size: 0.875rem;
	}

	h3 {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--gray-900);
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.description p {
		color: var(--gray-600);
		line-height: 1.7;
		font-size: 1rem;
	}

	.item-list {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		background: var(--gray-50);
		padding: 1.5rem;
		border-radius: 1rem;
		border-left: 4px solid var(--primary-400);
	}

	.item-link {
		display: flex;
		align-items: center;
		gap: 1rem;
		text-decoration: none;
		color: inherit;
		padding: 0.75rem;
		background: white;
		border-radius: 0.75rem;
		border: 1px solid var(--gray-200);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}
	.item-link:hover {
		transform: translateX(4px);
		box-shadow: var(--shadow-md);
		border-color: var(--primary-300);
	}

	.item-thumb {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		background: var(--gray-100);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.item-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.item-info .name {
		font-weight: 600;
		color: var(--gray-900);
	}
	.item-info .qty {
		font-size: 0.875rem;
		color: var(--gray-500);
	}

	.arrow {
		color: var(--gray-400);
		font-weight: bold;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}

	.btn-share {
		background: none;
		border: 2px solid var(--gray-200);
		padding: 0.75rem;
		border-radius: 0.75rem;
		font-weight: 600;
		color: var(--gray-600);
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-share:hover {
		border-color: var(--gray-400);
		color: var(--gray-800);
	}

	.guarantee {
		display: flex;
		gap: 1.5rem;
		font-size: 0.875rem;
		color: var(--gray-500);
		border-top: 1px solid var(--gray-200);
		padding-top: 1.5rem;
	}
	.g-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
