<script lang="ts">
	let {
		addToCart,
		buyNow,
		themeColor,
		currentPrice,
		formatPrice,
		productName,
		adminWhatsApp,
		stock
	} = $props<{
		addToCart: () => void;
		buyNow: () => void;
		themeColor: string;
		currentPrice: number;
		formatPrice: (p: number) => string;
		productName: string;
		adminWhatsApp?: string;
		stock?: number;
	}>();

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
		message += `Produk: ${productName}\n`;
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
</script>

<!-- Sticky Mobile Action Bar Only -->
<div class="sticky-mobile-bar">
	<div class="mobile-buttons">
		<!-- WhatsApp Button -->
		<button class="mobile-wa-btn" onclick={handleWhatsAppClick} title="Chat dengan Admin">
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

		<!-- Cart & Buy buttons - Restored for mobile -->
		{#if stock !== undefined && stock <= 0}
			<button
				class="mobile-buy-btn"
				onclick={() => {
					waQuestion = `Halo, saya mau Pre-order ${productName}, apakah bisa?`;
					showWhatsAppModal = true;
				}}
				style="background-color: #25d366; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
			>
				<span style="font-size: 1.1rem;">📝</span>
				Pre-order via WhatsApp
			</button>
		{:else}
			<button class="mobile-cart-btn" onclick={addToCart}>
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
					><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path
						d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
					/></svg
				>
			</button>
			<button class="mobile-buy-btn" onclick={buyNow} style="background-color: {themeColor};">
				Beli Sekarang
			</button>
		{/if}
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

<style>
	.sticky-mobile-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		padding: 1rem 1.25rem;
		border-top: 1px solid var(--gray-200);
		display: flex;
		align-items: center;
		justify-content: space-between;
		z-index: 100;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
		gap: 0.75rem;
	}

	@media (min-width: 768px) {
		.sticky-mobile-bar {
			display: none;
		}
	}

	/* .mobile-price removed */

	.mobile-buttons {
		display: flex;
		gap: 0.5rem;
		flex: 1;
		justify-content: flex-end;
	}

	.mobile-cart-btn {
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-lg);
		border: 2px solid var(--gray-200);
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--gray-700);
		flex-shrink: 0;
	}

	.mobile-buy-btn {
		flex: 1;
		border-radius: var(--radius-lg);
		background: var(--primary-600);
		color: white;
		font-weight: 700;
		font-size: 0.9rem;
		border: none;
		height: 3rem;
		white-space: nowrap;
		padding: 0 1rem;
	}

	.mobile-wa-btn {
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-lg);
		border: none;
		background: #25d366;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
		transition: all 0.2s;
	}

	.mobile-wa-btn:active {
		background: #20ba5a;
		transform: scale(0.95);
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
