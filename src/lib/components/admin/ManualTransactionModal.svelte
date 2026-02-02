<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale, slide } from 'svelte/transition';

	// Props
	let { products = [], bundles = [] } = $props<{ products: any[]; bundles?: any[] }>();

	// State
	let isOpen = $state(false);
	let isSubmitting = $state(false);
	let whatsappText = $state(''); // New: WA Text Input
	let manualItems = $state([
		{ product_id: '', qty: 1, product_name: '', price: 0, type: 'product', detected_name: '' }
	]);

	function parseWhatsapp() {
		if (!whatsappText) return;

		const text = whatsappText.replace(/\r\n/g, '\n');

		// 1. ITEMS PARSING
		// Strategy: Look for lines starting with "-"
		const itemLines = text.split('\n').filter((l) => l.trim().startsWith('-'));
		const parsedItemsList: any[] = [];

		const searchList = allSellables.map((item) => ({
			...item,
			searchName: item.label.toLowerCase().replace(/[^a-z0-9]/g, '')
		}));

		const findProduct = (rawName: string) => {
			const normalizedRaw = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
			if (!normalizedRaw) return null;
			const exact = searchList.find((p) => p.searchName === normalizedRaw);
			if (exact) return exact;
			return searchList.find(
				(p) => p.searchName.includes(normalizedRaw) || normalizedRaw.includes(p.searchName)
			);
		};

		itemLines.forEach((line) => {
			let cleanLine = line.replace(/^-/, '').trim();
			let qty = 1;

			// Checkout format: "- Item Name (2x) = Rp 10.000"
			const qtyMatch = cleanLine.match(/\((\d+)x\)/i);
			if (qtyMatch) {
				qty = parseInt(qtyMatch[1]);
				cleanLine = cleanLine.replace(qtyMatch[0], '').trim();
			}

			// Remove price part " = Rp ..."
			cleanLine = cleanLine.replace(/=\s*(?:Rp\.?|IDR)?\s*[\d,.]+/i, '').trim();

			const productName = cleanLine.trim();
			const matched = findProduct(productName);

			if (matched) {
				parsedItemsList.push({
					product_id: matched.value,
					qty: qty,
					product_name: matched.label,
					price: matched.price,
					type: matched.type
				});
			} else {
				parsedItemsList.push({
					product_id: '',
					qty: qty,
					product_name: '',
					detected_name: productName,
					price: 0,
					type: 'product'
				});
			}
		});

		// 2. METADATA PARSING (Structured)
		// We have distinct sections based on headers.
		// Checkout Format:
		// Pesanan Atas nama: ...
		// Nomor Telp: ...
		//
		// Pengiriman ke:
		// Nama Penerima: ...
		// Nomor Telp: ...
		// Alamat: ...
		// Catatan: ...

		// Helper: extract value but stop at newlines OR common phone patterns if accidentally on same line
		const getValue = (key: string, source: string) => {
			// Look for key, capture until newline or end
			const regex = new RegExp(`${key}:\\s*(.*?)(?=\\n|$)`, 'i');
			const match = source.match(regex);
			if (!match) return '';

			let val = match[1].trim();

			// FIX: Check if the value itself contains a phone number-like pattern and strip it
			// Often "Name: Budi 08123456" happens if format is loose
			// checkout format puts them on separate lines, but header reuse might cause this.
			// Or "Pesanan Atas nama: Budi Nomor Telp: ..." if on same line

			// Stop at "Nomor Telp" or "WA" if it leaked into the line
			const nextKeyIndex = val.search(/(?:Nomor Telp|Nomor HP|WA|HP):/i);
			if (nextKeyIndex !== -1) {
				val = val.substring(0, nextKeyIndex).trim();
			}

			return val;
		};

		// Split text into "Buyer Section" and "Shipping Section" if possible
		// "Pengiriman ke:" acts as a divider.
		const parts = text.split(/Pengiriman ke:/i);
		const buyerSection = parts[0] || '';
		const shippingSection = parts[1] || '';

		// Buyer Data (from top section)
		const cleanBuyerName =
			getValue('Pesanan Atas nama', buyerSection) || getValue('Nama', buyerSection);
		// Phone in buyer section
		const buyerPhoneMatch = buyerSection.match(
			/(?:Nomor Telp|Nomor HP|WA):\s*((?:\+?62|0)[\d\-\s]+)/i
		);
		const cleanBuyerPhone = buyerPhoneMatch ? buyerPhoneMatch[1].replace(/\D/g, '') : '';

		// Receiver Data (from shipping section)
		const cleanReceiverName = getValue('Nama Penerima', shippingSection);
		// Phone in shipping section
		const receiverPhoneMatch = shippingSection.match(
			/(?:Nomor Telp|Nomor HP|WA):\s*((?:\+?62|0)[\d\-\s]+)/i
		);
		const cleanReceiverPhone = receiverPhoneMatch ? receiverPhoneMatch[1].replace(/\D/g, '') : '';

		// Address & Notes (from shipping section)
		// Alamat might be multi-line.
		const addressMatch = shippingSection.match(
			/Alamat:\s*([\s\S]*?)(?=\n\s*(?:Catatan|Note|Terima Kasih)|$)/i
		);
		const cleanAddress = addressMatch ? addressMatch[1].trim() : '';

		const notesMatch = shippingSection.match(
			/(?:Catatan|Note):\s*([\s\S]*?)(?=\n\s*Terima Kasih|$)/i
		);
		const cleanNotes = notesMatch ? notesMatch[1].trim() : '';

		// UPDATE STATE
		if (cleanBuyerName) manualFormData.buyerName = cleanBuyerName;
		if (cleanBuyerPhone) manualFormData.buyerPhone = cleanBuyerPhone;

		if (cleanReceiverName) {
			manualFormData.receiverName = cleanReceiverName;
			// Smart IsGift: Only if receiver name differs significantly from buyer name
			// Normalize for comparison
			const b = cleanBuyerName.toLowerCase().replace(/\s/g, '');
			const r = cleanReceiverName.toLowerCase().replace(/\s/g, '');
			if (b !== r && b && r) {
				manualFormData.isGift = true;
			} else {
				manualFormData.isGift = false;
				// If not gift, we might still want to keep the phone number if it was parsed,
				// but form usually hides receiver fields if !isGift.
				// However, our backend might expect receiver fields to be empty if not gift.
				// CheckoutModal sends "finalReceiverName" which matches buyerName if not gift.
				// For admin manual input, if it's the same person, we usually uncheck "Gift".
			}
		}

		if (cleanReceiverPhone && manualFormData.isGift) {
			manualFormData.receiverPhone = cleanReceiverPhone;
		}

		if (cleanAddress) manualFormData.address = cleanAddress;
		if (cleanNotes && cleanNotes !== '-') manualFormData.notes = cleanNotes;

		if (parsedItemsList.length > 0) {
			manualItems = parsedItemsList;
		}

		alert(`Parser Selesai!\nDitemukan: ${parsedItemsList.length} item(s).`);
	}

	function requestSubmit() {
		// Validate
		if (!manualFormData.buyerName) {
			alert('Nama Pembeli wajib diisi!');
			return;
		}

		if (manualFormData.total <= 0) {
			alert('Total transaksi Rp 0. Mohon tambahkan produk atau pastikan harga produk valid.');
			return;
		}

		// Open Confirmation
		showConfirmation = true;
	}

	function confirmAndSubmit() {
		showConfirmation = false;
		// Trigger the real form submit
		// Since we are inside a form, we need to trigger it programmatically or use a hidden button.
		// SvelteKit's enhance works on the <form> element.
		// We can assign a ref to the submit button or simply call the form submit?
		// Actually, simpler: The "Simpan" button was type="submit".
		// We verified it with requestSubmit, now valid.
		// We need to trigger the actual submit event.
		// Let's use a hidden button.
		document.getElementById('hidden-submit-btn')?.click();
	}

	// Derived Items for Dropdown
	const allSellables = $derived([
		...products.map((p) => ({
			id: p.id, // Keep numeric ID for products to ensure server linking if possible, but we need unique value.
			// Actually server expects product_id to be Number for linking.
			// If we change value to 'p-1', we must strip it before submit or server update.
			// BUT, the parser uses 'b-1' and '1' (numeric).
			// Let's use simple IDs.
			// If we use 'p-' prefix, we break existing logic unless we fix it everywhere.
			// The parser I wrote uses 'b-' prefix for bundles, and raw ID for products.
			value: p.id,
			label: p.name,
			price: p.price,
			stock: p.stock,
			type: 'product'
		})),
		...bundles.map((b) => ({
			id: b.id,
			value: `b-${b.id}`, // Prefix for bundle
			label: `[Paket] ${b.name}`,
			price: b.price,
			stock: b.stock || 999, // Bundles might not have simple stock
			type: 'bundle'
		}))
	]);

	let manualFormData = $state({
		id: '',
		buyerName: '',
		buyerPhone: '',
		isGift: false,
		receiverName: '',
		receiverPhone: '',
		address: '',
		notes: '',
		total: 0
	});

	// Auto-calculate Total
	$effect(() => {
		const total = manualItems.reduce((sum, item) => {
			// Find in allSellables
			// item.product_id might be number (product) or string 'b-...' (bundle)
			// Comparison: String(p.value) == String(item.product_id)
			const found = allSellables.find((p) => String(p.value) === String(item.product_id));
			const price = found ? found.price : item.price || 0;
			// Also update name and price if found (to ensure consistency)
			if (found) {
				// We don't mutate item here to avoid infinite loop, but we use 'found.price'
				// The form submission uses 'manualItems' which has price.
				// We should probably bind price? Or simple rely on lookup.
				// But manualItems has 'price' field. The parser sets it.
				// If user changes dropdown, we should update price.
				// This effect only calculates total.
			}
			return sum + price * item.qty;
		}, 0);
		manualFormData.total = total;
	});

	// Helper to update item details when dropdown changes
	function handleItemSelect(index: number) {
		const item = manualItems[index];
		const found = allSellables.find((p) => String(p.value) === String(item.product_id));
		if (found) {
			manualItems[index].product_name = found.label;
			manualItems[index].price = found.price;
			manualItems[index].type = found.type; // Track type for server
		}
	}

	// Helpers
	function formatPrice(price: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	export function show(initialData?: any) {
		isSubmitting = false;
		if (initialData) {
			if (initialData.items && Array.isArray(initialData.items)) {
				manualItems = initialData.items.map((i: any) => ({
					...i,
					product_id: i.product_id, // Keep as is (could be string from parser)
					qty: Number(i.qty) || 1
				}));
			} else {
				manualItems = [{ product_id: '', qty: 1, product_name: '', price: 0 }];
			}

			manualFormData = {
				id: initialData.id || '',
				buyerName: initialData.buyerName || initialData.buyer?.name || '',
				buyerPhone: initialData.buyerPhone || initialData.buyer?.phone || '',
				isGift: initialData.isGift || false,
				receiverName: initialData.receiverName || initialData.receiver?.name || '',
				receiverPhone: initialData.receiverPhone || initialData.receiver?.phone || '',
				address: initialData.address || '',
				notes: initialData.notes || '',
				total: 0
			};
		} else {
			manualItems = [{ product_id: '', qty: 1, product_name: '', price: 0 }];
			manualFormData = {
				id: '',
				buyerName: '',
				buyerPhone: '',
				isGift: false,
				receiverName: '',
				receiverPhone: '',
				address: '',
				notes: '',
				total: 0
			};
		}
		isOpen = true;
	}

	export function close() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" transition:fade={{ duration: 200 }} onclick={close}>
		<div
			class="modal-container"
			transition:scale={{ duration: 300, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="modal-header">
				<div class="header-content">
					<h3>{manualFormData.id ? 'Edit Transaksi' : 'Tambah Transaksi Manual'}</h3>
					<p>Input detail pesanan pelanggan langsung ke sistem</p>
				</div>
				<button class="close-btn" onclick={close}>✕</button>
			</div>

			<!-- Body -->
			<div class="modal-content">
				<form
					method="POST"
					action={manualFormData.id ? '?/updateTransaction' : '?/createTransaction'}
					id="manual-form"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								close();
								window.location.reload();
							}
						};
					}}
				>
					{#if manualFormData.id}
						<input type="hidden" name="id" value={manualFormData.id} />
					{/if}
					<div class="form-grid">
						<!-- PEMBELI & PENGIRIMAN -->
						<div class="column-left">
							<div class="form-section">
								<h4 class="section-title">Identitas Pembeli</h4>

								<!-- New: WA Parser -->
								<div class="wa-parser-box">
									<textarea
										placeholder="Paste Pesanan WhatsApp di sini (Otomatis deteksi Nama/HP/Alamat)..."
										bind:value={whatsappText}
										rows="3"
										class="wa-input"
									></textarea>
									<button type="button" class="btn-parse" onclick={parseWhatsapp}>
										⚡ Auto Isi dari WA
									</button>
								</div>

								<div class="form-group">
									<label for="buyerName">Nama Lengkap *</label>
									<input
										type="text"
										name="buyerName"
										bind:value={manualFormData.buyerName}
										placeholder="Nama pembeli..."
										required
										class="form-input"
									/>
								</div>
								<div class="form-group">
									<label for="buyerPhone">Nomor WhatsApp *</label>
									<input
										type="tel"
										name="buyerPhone"
										bind:value={manualFormData.buyerPhone}
										placeholder="08xxxxxxxxxx"
										required
										class="form-input"
									/>
								</div>
							</div>

							<div class="form-section">
								<h4 class="section-title">Pengiriman</h4>
								<label class="checkbox-wrapper">
									<input type="checkbox" name="isGift" bind:checked={manualFormData.isGift} />
									<span class="checkbox-label">Kirim sebagai Hadiah / Dropship</span>
								</label>

								{#if manualFormData.isGift}
									<div class="gift-box" transition:slide>
										<div class="form-group">
											<label for="receiverName">Nama Penerima</label>
											<input
												type="text"
												name="receiverName"
												bind:value={manualFormData.receiverName}
												placeholder="Nama penerima..."
												required={manualFormData.isGift}
												class="form-input"
											/>
										</div>
										<div class="form-group">
											<label for="receiverPhone">HP Penerima</label>
											<input
												type="tel"
												name="receiverPhone"
												bind:value={manualFormData.receiverPhone}
												placeholder="No HP penerima..."
												required={manualFormData.isGift}
												class="form-input"
											/>
										</div>
									</div>
								{/if}

								<div class="form-group">
									<label for="address">Alamat Lengkap *</label>
									<textarea
										name="address"
										bind:value={manualFormData.address}
										rows="3"
										placeholder="Jl. Raya No. 123, Kota, Provinsi..."
										required
										class="form-input"
									></textarea>
								</div>
								<div class="form-group">
									<label for="notes">Catatan Pesanan</label>
									<textarea
										name="notes"
										bind:value={manualFormData.notes}
										rows="2"
										placeholder="Pesan tambahan..."
										class="form-input"
									></textarea>
								</div>
							</div>
						</div>

						<!-- ITEMS -->
						<div class="column-right">
							<div class="form-section h-full flex flex-col">
								<h4 class="section-title">Daftar Belanja</h4>
								<div class="items-list custom-scrollbar">
									{#each manualItems as item, index}
										<div class="item-row" transition:slide>
											<div class="item-select-wrapper">
												<!-- svelte-ignore a11y_no_onchange -->
												<select
													bind:value={item.product_id}
													required
													class="item-select"
													onchange={() => handleItemSelect(index)}
												>
													<option value="">Pilih Produk / Paket</option>
													{#each allSellables as sellable}
														<option
															value={sellable.value}
															disabled={sellable.stock < 1 &&
																String(sellable.value) !== String(item.product_id)}
														>
															{sellable.label} ({formatPrice(sellable.price)})
														</option>
													{/each}
												</select>
												{#if item.product_id}
													{@const found = allSellables.find(
														(p) => String(p.value) === String(item.product_id)
													)}
													{#if found}
														<span class="stock-info"
															>Stok: {found.stock} | {formatPrice(found.price)} / pcs</span
														>
													{/if}
												{/if}
											</div>
											<div class="item-qty">
												<button
													type="button"
													class="btn-qty"
													onclick={() => item.qty > 1 && item.qty--}>-</button
												>
												<input
													type="number"
													bind:value={item.qty}
													min="1"
													readonly
													class="input-qty"
												/>
												<button type="button" class="btn-qty" onclick={() => item.qty++}>+</button>
											</div>
											{#if manualItems.length > 1}
												<button
													type="button"
													class="btn-remove"
													onclick={() => (manualItems = manualItems.filter((_, i) => i !== index))}
													>✕</button
												>
											{/if}
										</div>
									{/each}
									<button
										type="button"
										class="btn-add-item"
										onclick={() =>
											(manualItems = [
												...manualItems,
												{ product_id: '', qty: 1, product_name: '', price: 0, detected_name: '' }
											])}
									>
										+ Tambah Produk Lain
									</button>
								</div>

								<div class="total-summary">
									<div class="summary-row">
										<span>Ringkasan Tagihan</span>
										<span>{manualItems.length} Produk</span>
									</div>
									<div class="summary-total">{formatPrice(manualFormData.total)}</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Hidden fields for form submission -->
					<input type="hidden" name="items" value={JSON.stringify(manualItems)} />
					<input type="hidden" name="total" value={manualFormData.total} />
				</form>
			</div>

			<!-- Footer -->
			<div class="modal-footer">
				<button class="btn-cancel" onclick={close}>Batal</button>
				<button type="submit" form="manual-form" class="btn-submit" disabled={isSubmitting}>
					{isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Scoped CSS for ManualTransactionModal - Vanilla */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

	:global(.manual-modal-open) body {
		overflow: hidden;
	}

	* {
		box-sizing: border-box;
		font-family: 'Inter', sans-serif;
	}

	/* Modal Overlay */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(15, 23, 42, 0.6); /* Slate-900/60 */
		backdrop-filter: blur(4px);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.modal-container {
		background: white;
		width: 100%;
		max-width: 1000px;
		max-height: 90vh;
		border-radius: 1.5rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Header */
	.modal-header {
		padding: 1.5rem 2rem;
		background: #f8fafc;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.header-content h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #1e293b;
	}
	.header-content p {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		color: #64748b;
	}
	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #94a3b8;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: background 0.2s;
	}
	.close-btn:hover {
		background: #e2e8f0;
		color: #1e293b;
	}

	/* Content */
	.modal-content {
		padding: 2rem;
		overflow-y: auto;
		flex: 1;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2.5rem;
	}
	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Sections */
	.section-title {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		color: #64748b;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #f1f5f9;
		margin-top: 0;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}
	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #334155;
		margin-bottom: 0.5rem;
	}
	.form-input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.75rem;
		font-size: 0.95rem;
		color: #1e293b;
		outline: none;
		transition: border-color 0.2s;
		background: #f8fafc;
	}
	.form-input:focus {
		border-color: #4f46e5;
		background: white;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
	}

	.checkbox-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		margin-bottom: 1rem;
	}
	.checkbox-label {
		font-size: 0.9rem;
		font-weight: 600;
		color: #475569;
	}

	.gift-box {
		background: #eff6ff;
		padding: 1.25rem;
		border-radius: 1rem;
		margin-bottom: 1.25rem;
		border: 1px solid #dbeafe;
	}

	/* Items List */
	.item-row {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 0.75rem;
		align-items: start;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		padding: 1rem;
		border-radius: 1rem;
		margin-bottom: 0.75rem;
	}

	.item-select-wrapper {
		display: flex;
		flex-direction: column;
	}
	.item-select {
		width: 100%;
		padding: 0.6rem;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
		font-size: 0.9rem;
		font-weight: 600;
		background: #f8fafc;
	}
	.stock-info {
		font-size: 0.7rem;
		color: #059669;
		font-weight: 700;
		margin-top: 4px;
	}

	.item-qty {
		display: flex;
		align-items: center;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		overflow: hidden;
	}
	.btn-qty {
		border: none;
		background: #f1f5f9;
		width: 28px;
		height: 32px;
		font-weight: bold;
		cursor: pointer;
	}
	.btn-qty:hover {
		background: #e2e8f0;
	}
	.input-qty {
		width: 36px;
		text-align: center;
		border: none;
		font-weight: 600;
		font-size: 0.9rem;
		outline: none;
	}

	.btn-remove {
		background: #fee2e2;
		color: #ef4444;
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.btn-remove:hover {
		background: #fecaca;
	}

	.btn-add-item {
		width: 100%;
		padding: 1rem;
		border: 2px dashed #e2e8f0;
		border-radius: 1rem;
		color: #64748b;
		font-weight: 700;
		font-size: 0.9rem;
		cursor: pointer;
		background: transparent;
		transition: all 0.2s;
	}
	.btn-add-item:hover {
		border-color: #94a3b8;
		color: #475569;
		background: #f8fafc;
	}

	.total-summary {
		margin-top: auto;
		background: #1e293b;
		color: white;
		padding: 2rem;
		border-radius: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.summary-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
		opacity: 0.8;
	}
	.summary-total {
		font-size: 2rem;
		font-weight: 800;
	}

	/* Footer */
	.modal-footer {
		padding: 1.5rem 2rem;
		background: #f8fafc;
		border-top: 1px solid #e2e8f0;
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}
	.btn-cancel {
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		font-weight: 600;
		color: #64748b;
		background: white;
		border: 1px solid #cbd5e1;
		cursor: pointer;
	}
	.btn-cancel:hover {
		background: #f1f5f9;
	}
	.btn-submit {
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		font-weight: 600;
		color: white;
		background: #4f46e5;
		border: none;
		box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
		cursor: pointer;
	}
	.btn-submit:hover {
		background: #4338ca;
	}
	/* WA Parser */
	.wa-parser-box {
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		padding: 1rem;
		border-radius: 0.75rem;
		margin-bottom: 1.5rem;
	}
	.wa-input {
		width: 100%;
		border: 1px solid #86efac;
		border-radius: 0.5rem;
		padding: 0.5rem;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
		outline: none;
	}
	.detected-item-hint {
		font-size: 0.8rem;
		color: #d97706;
		background: #fffbeb;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		margin-top: 0.25rem;
		border: 1px dashed #fcd34d;
	}

	.btn-parse {
		width: 100%;
		background: #16a34a;
		color: white;
		border: none;
		padding: 0.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.btn-parse:hover {
		background: #15803d;
	}
</style>
