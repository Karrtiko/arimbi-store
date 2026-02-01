<script lang="ts">
	import { slide } from 'svelte/transition';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		product,
		selectedVariantId = $bindable(),
		formatPrice,
		isSnack,
		themeColor,
		addToCart,
		buyNow,
		productName,
		adminWhatsApp
	} = $props<{
		product: any;
		selectedVariantId: string | null;
		formatPrice: (p: number) => string;
		isSnack: boolean;
		themeColor: string;
		addToCart: () => void;
		buyNow: () => void;
		productName?: string;
		adminWhatsApp?: string;
	}>();

	let openAccordion = $state<string | null>(null);

	// WhatsApp Logic
	let showWhatsAppModal = $state(false);
	let waName = $state('');
	let waQuestion = $state('');

	function sendWhatsApp() {
		if (!waName.trim() || !waQuestion.trim()) {
			alert('Mohon lengkapi nama dan pertanyaan Anda');
			return;
		}

		let message = `Halo Admin Arimbi Store!\n\n`;
		message += `Nama: ${waName}\n`;
		message += `Produk: ${productName || product.name}\n`;
		message += `Link: ${window.location.href}\n`;
		message += `\nPertanyaan:\n${waQuestion}`;

		const encodedMessage = encodeURIComponent(message);
		const phone = adminWhatsApp || '6281234567890';
		const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

		window.open(whatsappUrl, '_blank');
		showWhatsAppModal = false;
		waName = '';
		waQuestion = '';
	}

	// Computed
	const selectedVariant = $derived(
		product.variants?.find((v: any) => v.id === selectedVariantId) || null
	);

	const currentPrice = $derived(
		selectedVariant ? selectedVariant.price || product.price : product.price
	);

	function toggleAccordion(id: string) {
		if (openAccordion === id) openAccordion = null;
		else openAccordion = id;
	}

	function isLongText(value: any): boolean {
		return typeof value === 'string' && (value.length > 50 || value.includes('\n'));
	}
</script>

<div class="info-col">
	<div class="main-info">
		<div class="badges">
			<span class="badge category {isSnack ? 'snack' : 'skincare'}">{product.category_name}</span>
			{#if product.country_name}
				<span class="badge country">
					{product.country_flag}
					{product.country_name}
				</span>
			{/if}
		</div>

		<h1 class="product-title">{product.name}</h1>

		<div class="price-row">
			<p class="product-price" style="color: {themeColor}">{formatPrice(currentPrice)}</p>
			<p class="social-proof">🔥 12 orang sedang melihat</p>
		</div>

		<!-- Variants -->
		{#if product.variants && product.variants.length > 0}
			<div class="variants-section">
				<span class="variant-label">Pilih Varian:</span>
				<div class="chips-group">
					{#each product.variants as variant}
						<button
							class="chip {selectedVariantId === variant.id ? 'active' : ''} {isSnack
								? 'snack'
								: 'skincare'}"
							onclick={() => (selectedVariantId = variant.id)}
						>
							{variant.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Actions (Desktop) -->
		<div class="action-group desktop-actions">
			{#if product.stock !== undefined && product.stock <= 0}
				<!-- Out of Stock - Pre-order via WhatsApp -->
				<Button
					variant="primary"
					size="xl"
					onclick={() => {
						waQuestion = `Halo, saya mau Pre-order ${product.name}, apakah bisa?`;
						showWhatsAppModal = true;
					}}
					style="flex: 1; height: 3.5rem; font-size: 1.125rem; background-color: #25d366; border-color: #25d366;"
				>
					<span style="font-size: 1.25rem; margin-right: 0.5rem">📝</span>
					Pre-order via WhatsApp
				</Button>
			{:else}
				<Button
					variant="outline"
					size="xl"
					onclick={addToCart}
					style="flex: 1; height: 3.5rem; font-size: 1.125rem;"
				>
					Tambah Keranjang
				</Button>

				<Button
					variant="primary"
					size="xl"
					onclick={buyNow}
					style="flex: 1; background-color: {themeColor}; border-color: {themeColor}; height: 3.5rem; font-size: 1.125rem;"
				>
					Beli Sekarang
				</Button>

				<!-- WhatsApp Button (Desktop) - Only show if stock available / normal flow -->
				<button
					class="desktop-wa-btn"
					onclick={() => (showWhatsAppModal = true)}
					title="Chat Admin"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
						/>
					</svg>
				</button>
			{/if}
		</div>
		<!-- Trust Badges -->
		<div class="trust-row">
			<div class="trust-item">
				<span>🚀</span> Ready Stock
			</div>
			<div class="trust-item">
				<span>✨</span> 100% Original
			</div>
			<div class="trust-item">
				<span>📦</span> Packing Aman
			</div>
		</div>
	</div>

	<!-- Description & Details -->
	<div class="details-group">
		<p class="product-desc">{product.description}</p>

		<!-- Attributes -->
		{#if product.attributes && Object.keys(product.attributes).length > 0}
			<div class="attributes-section">
				<!-- Visual Grid -->
				<div class="attr-grid-visual">
					{#each Object.entries(product.attributes) as [key, value]}
						{#if !isLongText(value)}
							<div class="attr-box">
								<div class="attr-icon">
									{#if key.includes('berat') || key.includes('volume')}⚖️
									{:else if key.includes('expired')}⏳
									{:else if key.includes('skin_type')}🧖‍♀️
									{:else if key.includes('pedas')}🌶️
									{:else}📌{/if}
								</div>
								<div class="attr-content">
									<span class="attr-label">{key.replace(/_/g, ' ')}</span>
									<span class="attr-val-bold">{value}</span>
								</div>
							</div>
						{/if}
					{/each}
				</div>

				<!-- Accordions -->
				<div class="accordions">
					{#each Object.entries(product.attributes) as [key, value]}
						{#if isLongText(value)}
							<div class="accordion-item">
								<button class="accordion-header" onclick={() => toggleAccordion(key)}>
									<span class="acc-title">{key.replace(/_/g, ' ')}</span>
									<span class="acc-icon {openAccordion === key ? 'open' : ''}">▼</span>
								</button>
								{#if openAccordion === key}
									<div class="accordion-content" transition:slide>
										{#if typeof value === 'string'}
											<div class="rich-text">
												{#each value.split('\n') as line}
													<p>{line}</p>
												{/each}
											</div>
										{/if}
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- WhatsApp Modal Desktop -->
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

<style>
	/* Layout Groups */
	.main-info {
		margin-bottom: var(--space-xl);
		border-bottom: 1px solid var(--gray-200);
		padding-bottom: var(--space-lg);
	}

	.badges {
		display: flex;
		gap: 0.5rem;
		margin-bottom: var(--space-md);
	}

	.badge {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-full);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.badge.category.snack {
		background: var(--accent-50);
		color: var(--accent-700);
	}
	.badge.category.skincare {
		background: var(--primary-50);
		color: var(--primary-700);
	}
	.badge.country {
		background: var(--gray-100);
		color: var(--gray-700);
	}

	.product-title {
		font-size: clamp(2rem, 3vw, 3rem);
		font-weight: 800;
		color: var(--gray-900);
		margin-bottom: var(--space-md);
		line-height: 1.2;
	}

	.price-row {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: var(--space-lg);
	}

	.product-price {
		font-size: 2rem;
		font-weight: 800;
	}

	.social-proof {
		font-size: 0.875rem;
		color: var(--gray-500);
		font-style: italic;
	}

	/* Variants */
	.variants-section {
		margin-bottom: var(--space-xl);
	}

	.variant-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--gray-500);
		display: block;
		margin-bottom: 0.75rem;
	}

	.chips-group {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.chip {
		padding: 0.75rem 1.5rem;
		border-radius: var(--radius-md);
		border: 2px solid var(--gray-200);
		background: white;
		font-weight: 600;
		color: var(--gray-600);
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.95rem;
	}

	.chip:hover {
		border-color: var(--gray-300);
	}

	.chip.active.snack {
		border-color: var(--accent-500);
		background: var(--accent-50);
		color: var(--accent-700);
	}

	.chip.active.skincare {
		border-color: var(--primary-500);
		background: var(--primary-50);
		color: var(--primary-700);
	}

	/* Actions */
	.action-group.desktop-actions {
		margin-bottom: var(--space-xl);
		display: none; /* Hidden on mobile */
		gap: 1rem;
	}

	.desktop-wa-btn {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: var(--radius-lg);
		border: none;
		background: #25d366;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
		transition: all 0.2s;
		cursor: pointer;
	}

	.desktop-wa-btn:hover {
		transform: scale(1.05);
		background: #20ba5a;
	}

	@media (min-width: 768px) {
		.action-group.desktop-actions {
			display: flex;
		}
	}

	/* Trust */
	.trust-row {
		display: flex;
		gap: var(--space-lg);
		font-size: 0.875rem;
		color: var(--gray-600);
		align-items: center;
	}

	.trust-item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-weight: 500;
	}

	/* Details */
	.product-desc {
		font-size: 1.125rem;
		color: var(--gray-700);
		line-height: 1.7;
		margin-bottom: var(--space-2xl);
	}

	/* Iconic Info Grid */
	.attr-grid-visual {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
	}

	.attr-box {
		background: var(--gray-50);
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		border: 1px solid var(--gray-100);
		display: flex;
		align-items: center;
		gap: 0.75rem;
		transition: transform 0.2s;
	}

	.attr-box:hover {
		transform: translateY(-2px);
	}

	.attr-icon {
		font-size: 1.25rem;
		width: 36px;
		height: 36px;
		background: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.attr-content {
		display: flex;
		flex-direction: column;
	}

	.attr-label {
		font-size: 0.65rem;
		color: var(--gray-500);
		text-transform: uppercase;
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.attr-val-bold {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--gray-900);
	}

	/* Accordions */
	.accordion-item {
		border-bottom: 1px solid var(--gray-200);
	}

	.accordion-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 0;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.accordion-header:hover .acc-title {
		color: var(--primary-600);
	}

	.acc-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--gray-900);
		text-transform: capitalize;
		transition: color 0.2s;
	}

	.acc-icon {
		font-size: 0.75rem;
		color: var(--gray-400);
		transition: transform 0.3s;
	}

	.acc-icon.open {
		transform: rotate(180deg);
	}

	.accordion-content {
		padding-bottom: 1.5rem;
	}

	.rich-text p {
		margin-bottom: 0.75rem;
		line-height: 1.7;
		color: var(--gray-700);
	}

	/* WhatsApp Modal Styles */
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
</style>
