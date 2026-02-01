<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cart } from '$lib/stores/cart.svelte';
	import Button from '../ui/Button.svelte';

	// Props
	let { settings = {} } = $props<{ settings?: any }>();

	// State for form data
	let formData = $state({
		buyerName: '',
		buyerPhone: '',
		isGift: false, // Checkbox state
		receiverName: '',
		receiverPhone: '',
		address: '',
		notes: ''
	});

	function formatPrice(price: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	function generateWhatsAppMessage() {
		// List items cleanly
		const itemsList = cart.items
			.map((item) => {
				const priceStr = formatPrice(item.price * item.quantity);
				if (item.type === 'bundle') {
					// Format:
					// - Bundle Name (Qty) = Total
					//   (Isi: Item 1, Item 2)
					const subItems =
						item.items && Array.isArray(item.items) ? item.items.join('\n      ') : '';
					return `- ${item.name} (${item.quantity}x) = ${priceStr}\n      (Isi:\n      ${subItems}\n      )`;
				}
				return `- ${item.name} (${item.quantity}x) = ${priceStr}`;
			})
			.join('\n');

		// Determine Receiver Name
		// If isGift is true -> use input receiverName
		// If false -> use buyerName
		const finalReceiverName = formData.isGift ? formData.receiverName : formData.buyerName;
		const finalReceiverPhone = formData.isGift ? formData.receiverPhone : formData.buyerPhone;

		const message = `Halo kak!
Aku mau checkout, ini detailnya ya:

${itemsList}

Total: ${formatPrice(cart.total)}

Pesanan Atas nama: ${formData.buyerName}
Nomor Telp: ${formData.buyerPhone}

Pengiriman ke:
Nama Penerima: ${finalReceiverName}
Nomor Telp: ${finalReceiverPhone}
Alamat: ${formData.address}
${formData.notes ? `Catatan: ${formData.notes}` : ''}

Terima Kasih`;

		return encodeURIComponent(message);
	}

	function handleSubmit(e: Event) {
		e.preventDefault();

		// Validate form
		if (!formData.buyerName || !formData.buyerPhone || !formData.address) {
			alert('Mohon lengkapi Data Pembeli dan Alamat');
			return;
		}

		// Strict validation: Only require Receiver fields if isGift is CHECKED
		if (formData.isGift && (!formData.receiverName || !formData.receiverPhone)) {
			alert('Mohon lengkapi Data Penerima untuk Dropship / Hadiah');
			return;
		}

		const whatsappNumber = settings?.admin_whatsapp || '6281234567890'; // Use setting or default
		const message = generateWhatsAppMessage();
		const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

		window.open(whatsappUrl, '_blank');
		cart.close();
	}

	function removeItem(id: number, type: string) {
		cart.removeItem(id, type);
	}

	function updateQty(id: number, delta: number, type: string) {
		cart.updateQuantity(id, delta, type);
	}
</script>

{#if cart.isOpen}
	<div class="overlay" onclick={() => cart.close()} transition:slide={{ duration: 0 }}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="header">
				<h2 class="title">Keranjang Belanja ({cart.totalItems})</h2>
				<button class="close-btn" onclick={() => cart.close()}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
					>
				</button>
			</div>

			<div class="content-scroll">
				<!-- Cart Items List -->
				{#if cart.items.length === 0}
					<div style="text-align: center; padding: 2rem; color: var(--gray-500);">
						Keranjang kosong
					</div>
				{:else}
					<div class="cart-items">
						{#each cart.items as item}
							<div class="cart-item">
								<img src={item.image_url} alt={item.name} class="item-image" />
								<div class="item-details">
									<h4 class="item-name">
										{#if item.type === 'bundle'}
											<span class="badge-bundle">📦 Bundle</span>
										{/if}
										{item.name}
									</h4>
									{#if item.type === 'bundle' && item.items}
										<div class="bundle-contents">
											{#each item.items as subItem}
												<small>• {subItem}</small>
											{/each}
										</div>
									{/if}
									<p class="item-price">
										{formatPrice(item.price)} x {item.quantity} =
										<span class="item-subtotal">{formatPrice(item.price * item.quantity)}</span>
									</p>
								</div>
								<div class="item-actions">
									<div class="qty-controls">
										<button
											class="qty-btn"
											onclick={() => updateQty(item.id, -1, item.type || 'product')}>−</button
										>
										<span class="qty-val">{item.quantity}</span>
										<button
											class="qty-btn"
											onclick={() => updateQty(item.id, 1, item.type || 'product')}>+</button
										>
									</div>
									<button
										class="remove-btn"
										onclick={() => removeItem(item.id, item.type || 'product')}>Hapus</button
									>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				{#if cart.items.length > 0}
					<form onsubmit={handleSubmit} id="checkout-form">
						<!-- 1. Data Pembeli -->
						<h3 class="section-title">Data Pembeli</h3>
						<div class="form-row">
							<div class="form-col form-group">
								<label for="buyerName">Nama Anda *</label>
								<input
									type="text"
									id="buyerName"
									bind:value={formData.buyerName}
									placeholder="Nama Lengkap"
									required
								/>
							</div>
							<div class="form-col form-group">
								<label for="buyerPhone">No. WhatsApp *</label>
								<input
									type="tel"
									id="buyerPhone"
									bind:value={formData.buyerPhone}
									placeholder="08..."
									required
								/>
							</div>
						</div>

						<!-- 2. Opsi Penerima -->
						<label class="checkbox-group">
							<input type="checkbox" bind:checked={formData.isGift} />
							<span class="checkbox-label">Kirim sebagai Dropship / Hadiah (Alamat Berbeda)</span>
						</label>

						<!-- 3. Data Penerima (Conditional) -->
						{#if formData.isGift}
							<div transition:slide>
								<h3 class="section-title">Data Penerima Paket</h3>
								<div class="form-row">
									<div class="form-col form-group">
										<label for="receiverName">Nama Penerima *</label>
										<input
											type="text"
											id="receiverName"
											bind:value={formData.receiverName}
											placeholder="Nama Penerima"
											required={formData.isGift}
										/>
									</div>
									<div class="form-col form-group">
										<label for="receiverPhone">No. HP Penerima *</label>
										<input
											type="tel"
											id="receiverPhone"
											bind:value={formData.receiverPhone}
											placeholder="08..."
											required={formData.isGift}
										/>
									</div>
								</div>
							</div>
						{/if}

						<!-- 4. Alamat & Catatan -->
						<h3 class="section-title">Detail Pengiriman</h3>
						<div class="form-group">
							<label for="address">Alamat Lengkap {formData.isGift ? 'Penerima' : ''} *</label>
							<textarea
								id="address"
								bind:value={formData.address}
								placeholder="Jln. Contoh No. 123, Kecamatan, Kota, Kode Pos"
								required
							></textarea>
						</div>

						<div class="form-group">
							<label for="notes">Catatan Tambahan (Opsional)</label>
							<textarea
								id="notes"
								bind:value={formData.notes}
								placeholder="Contoh: Tolong tulis 'Happy Birthday' di kartu ucapan"
							></textarea>
						</div>
					</form>
				{/if}
			</div>

			{#if cart.items.length > 0}
				<div class="footer">
					<div class="total-row">
						<span>Total Pembayaran</span>
						<span style="color: var(--primary-600);">{formatPrice(cart.total)}</span>
					</div>
					<button type="submit" form="checkout-form" class="submit-btn">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"
							><path
								d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
							/></svg
						>
						Order via WhatsApp
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: var(--space-md);
	}

	.modal {
		background: white;
		border-radius: var(--radius-xl);
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-xl);
	}

	.header {
		padding: var(--space-lg);
		border-bottom: 1px solid var(--gray-200);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--gray-900);
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--gray-500);
		padding: 4px;
		border-radius: var(--radius-full);
		display: flex;
	}

	.close-btn:hover {
		background: var(--gray-100);
		color: var(--gray-900);
	}

	.content-scroll {
		overflow-y: auto;
		padding: var(--space-lg);
		flex: 1;
	}

	.section-title {
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--gray-500);
		margin-bottom: var(--space-md);
		letter-spacing: 0.05em;
		padding-top: var(--space-md);
		border-top: 1px solid var(--gray-100);
	}

	.section-title:first-child {
		border-top: none;
		padding-top: 0;
	}

	/* Cart Items */
	.cart-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
	}

	.cart-item {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-sm);
		border: 1px solid var(--gray-100);
		border-radius: var(--radius-lg);
	}

	.item-image {
		width: 60px;
		height: 60px;
		border-radius: var(--radius-md);
		object-fit: cover;
		background: var(--gray-100);
	}

	.item-details {
		flex: 1;
	}

	.item-name {
		font-weight: 600;
		font-size: 0.95rem;
		margin-bottom: 0.25rem;
	}

	.item-price {
		font-size: 0.875rem;
		color: var(--primary-600);
		font-weight: 600;
	}

	.item-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: space-between;
	}

	.qty-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--gray-100);
		border-radius: var(--radius-full);
		padding: 2px;
	}

	.qty-btn {
		width: 24px;
		height: 24px;
		border: none;
		background: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1rem;
		box-shadow: var(--shadow-sm);
	}

	.qty-val {
		font-size: 0.875rem;
		font-weight: 600;
		min-width: 1rem;
		text-align: center;
	}

	.remove-btn {
		background: none;
		border: none;
		color: var(--gray-400);
		font-size: 0.75rem;
		text-decoration: underline;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.remove-btn:hover {
		color: #ef4444;
	}

	.form-group {
		margin-bottom: var(--space-md);
	}

	.form-row {
		display: flex;
		gap: 1rem;
	}

	.form-col {
		flex: 1;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--gray-700);
		margin-bottom: 0.35rem;
	}

	input,
	textarea {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		font-size: 0.95rem;
		border: 1px solid var(--gray-300);
		border-radius: var(--radius-md);
		outline: none;
		transition: border-color 0.2s;
		font-family: var(--font-body);
	}

	input:focus,
	textarea:focus {
		border-color: var(--primary-500);
		box-shadow: 0 0 0 3px var(--primary-100);
	}

	textarea {
		min-height: 80px;
		resize: vertical;
	}

	/* Checkbox Style */
	.checkbox-group {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: var(--space-lg) 0;
		padding: 0.75rem;
		background: var(--gray-50);
		border-radius: var(--radius-lg);
		cursor: pointer;
		border: 1px solid var(--gray-200);
		transition: all 0.2s;
	}

	.checkbox-group:hover {
		border-color: var(--primary-300);
	}

	input[type='checkbox'] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		accent-color: var(--primary-600);
	}

	.checkbox-label {
		margin: 0;
		cursor: pointer;
		flex: 1;
		font-weight: 600;
		color: var(--gray-800);
	}

	.footer {
		padding: var(--space-lg);
		border-top: 1px solid var(--gray-200);
		background: var(--gray-50);
		border-bottom-left-radius: var(--radius-xl);
		border-bottom-right-radius: var(--radius-xl);
	}

	.total-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-md);
		font-size: 1.125rem;
		font-weight: 700;
	}

	.submit-btn {
		width: 100%;
		background: #25d366; /* WhatsApp Green Solid */
		color: white;
		padding: var(--space-md);
		border: none;
		border-radius: var(--radius-lg);
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: filter 0.2s;
	}

	.submit-btn:hover {
		filter: brightness(1.1);
	}

	.badge-bundle {
		background: #fef08a; /* Yellow-200 */
		color: #854d0e; /* Yellow-800 */
		font-size: 0.7rem;
		padding: 2px 6px;
		border-radius: 4px;
		vertical-align: middle;
		margin-right: 4px;
	}

	.bundle-contents {
		display: flex;
		flex-direction: column;
		margin-bottom: 4px;
		color: var(--gray-500);
		font-size: 0.8rem;
	}
</style>
