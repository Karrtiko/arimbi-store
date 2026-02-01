<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale, slide } from 'svelte/transition';

	// Props
	let { products = [], bundles = [] } = $props<{ products: any[]; bundles?: any[] }>();

	// State
	let isOpen = $state(false);
	let isSubmitting = $state(false);
	let manualItems = $state([
		{ product_id: '', qty: 1, product_name: '', price: 0, type: 'product' }
	]);

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
												{ product_id: '', qty: 1, product_name: '', price: 0 }
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
</style>
