<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import confetti from 'canvas-confetti';
	import ManualTransactionModal from '$lib/components/admin/ManualTransactionModal.svelte';
	import TransactionTable from '$lib/components/admin/TransactionTable.svelte';

	let { data } = $props();
	const { transactions, pagination, stats, products, bundles = [] } = data;

	// Modal State
	let showChatModal = $state(false);
	let showParserModal = $state(false);
	let selectedTrx: any = $state(null);

	// Transaction Form State
	let manualModal: any;
	let waInput = $state('');

	/* --- Colors & Assets moved to CSS --- */

	const chatTemplates = {
		pending: {
			label: 'Tagih Pembayaran (Pending)',
			preview: '"Halo Kak, mohon konfirmasi pembayarannya ya..."',
			text: (trx: any) =>
				`Halo Kak ${trx.buyerName}, mohon konfirmasi pembayaran untuk pesanan #${trx.id} sebesar ${formatPrice(trx.total)} ya. Terima kasih! 🙏`
		},
		paid: {
			label: 'Konfirmasi Packing (Paid)',
			preview: '"Pembayaran diterima! Pesanan sedang kami proses..."',
			text: (trx: any) =>
				`Halo Kak ${trx.buyerName}, pembayaran untuk order #${trx.id} sudah kami terima! Paket akan segera kami proses dan kirim. Ditunggu ya! ✨`
		},
		shipped: {
			label: 'Kirim No. Resi (Shipped)',
			preview: '"Pesanan sudah dikirim! Cek nomor resi Kakak di sini..."',
			text: (trx: any) =>
				`Halo Kak ${trx.buyerName}, paket #${trx.id} sudah dikirim ya! 🚚\nNo. Resi: ${trx.resi || 'Sedang diupdate'}\nCek statusnya secara berkala. Terima kasih! 😊`
		}
	};

	function formatPrice(price: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusClass(status: string) {
		// Classes mapped to CSS
		return status.toLowerCase(); // pending, paid, shipped, etc.
	}

	function openChatMenu(trx: any) {
		selectedTrx = trx;
		showChatModal = true;
	}

	function copyTemplate(type: keyof typeof chatTemplates) {
		if (!selectedTrx) return;
		const message = chatTemplates[type].text(selectedTrx);
		const phone = selectedTrx.buyerPhone.replace(/^0/, '62');
		const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

		window.open(url, '_blank');
		showChatModal = false;
	}

	function handleStatusChange(e: Event, trx: any) {
		const select = e.target as HTMLSelectElement;
		const newStatus = select.value;

		const formData = new FormData();
		formData.append('id', trx.id);
		formData.append('status', newStatus);

		fetch('?/updateStatus', { method: 'POST', body: formData }).then((res) => {
			if (res.ok && newStatus === 'PAID') {
				confetti({
					particleCount: 100,
					spread: 70,
					origin: { y: 0.6 },
					colors: ['#4f46e5', '#818cf8']
				});
			}
			window.location.reload();
		});
	}

	function handleResiChange(e: Event, trx: any) {
		const input = e.target as HTMLInputElement;
		const formData = new FormData();
		formData.append('id', trx.id);
		formData.append('status', 'SHIPPED');
		formData.append('resi', input.value);
		fetch('?/updateStatus', { method: 'POST', body: formData });
	}

	function printInvoice(trx: any) {
		selectedTrx = trx;
		setTimeout(() => window.print(), 100);
	}

	function parseWaChat() {
		// New Format Parser
		const lines = waInput.split('\n');

		// 1. Basic Info Regex - Uses lookaheads to stop at the next keyword
		// Handles "Pesanan Atas nama: ABC Nomor Telp: ..." (Single line) or Newlines
		const buyerNameMatch = waInput.match(
			/(?:Pesanan Atas nama|Nama):\s*(.*?)(?=\s*(?:Nomor Telp|HP|Pengiriman ke)|$)/i
		);
		const buyerPhoneMatch = waInput.match(
			/(?:Nomor Telp|HP):\s*(.*?)(?=\s*(?:Pengiriman ke|Nama Penerima|Alamat)|$)/i
		);
		const receiverNameMatch = waInput.match(
			/Nama Penerima:\s*(.*?)(?=\s*(?:Alamat|HP Penerima)|$)/i
		);

		// Address: Capture until "Catatan" or "Terima Kasih"
		const addressMatch = waInput.match(/Alamat:\s*([\s\S]*?)(?=\s*(?:Catatan|Terima Kasih)|$)/i);
		const notesMatch = waInput.match(/Catatan:\s*([\s\S]*?)(?=\s*(?:Terima Kasih)|$)/i);

		// 2. Items Match: "- Product Name (1x) ="
		const itemRegex = /-\s+(.+?)\s+\((\d+)x\)\s+=/g;
		let match;
		const parsedItems = [];
		const allSellables = [
			...products.map((p) => ({ ...p, _type: 'product', searchName: p.name.toLowerCase() })),
			...bundles.map((b) => ({ ...b, _type: 'bundle', searchName: b.name.toLowerCase() }))
		];

		while ((match = itemRegex.exec(waInput)) !== null) {
			const productName = match[1].trim().toLowerCase();
			const quantity = parseInt(match[2]);

			// Try to find in combined list
			const matchedItem = allSellables.find(
				(item) => item.searchName === productName || productName.includes(item.searchName)
			);

			parsedItems.push({
				// If matched, use the appropriate ID format that ManualModal will understand.
				// NOTE: We need to update ManualModal to handle this passed 'products' list which might now include bundles?
				// For now, let's assume we will pass a combined list to ManualModal.
				// If it's a product, ID is just number. If bundle, maybe we treat it as product?
				// If I pass bundles as "products", I need to make sure IDs don't clash?
				// Let's assume for this step that I WILL update Modal to handle mixed IDs or distinct IDs.
				// But wait, if I haven't updated Modal yet, this might break?
				// The user asked to "fix parser".
				product_id: matchedItem
					? matchedItem._type === 'bundle'
						? `b-${matchedItem.id}`
						: matchedItem.id
					: '',
				qty: quantity,
				product_name: matchedItem
					? matchedItem._type === 'bundle'
						? `[Paket] ${matchedItem.name}`
						: matchedItem.name
					: match[1].trim(),
				price: matchedItem ? matchedItem.price : 0
			});
		}

		// Fallback for default item if none found
		if (parsedItems.length === 0) {
			parsedItems.push({ product_id: '', qty: 1, product_name: '', price: 0 });
		}

		// 3. Construct Data
		const parsedData = {
			buyerName: buyerNameMatch?.[1]?.trim() || '',
			buyerPhone: buyerPhoneMatch?.[1]?.trim() || '',
			isGift: !!receiverNameMatch, // Auto-enable if receiver name is parsed
			receiverName: receiverNameMatch?.[1]?.trim() || '',
			// If receiver info is found, use it parsed, otherwise fallback to buyer if needed (but ManualModal handles this well)
			receiverPhone: '', // Receiver phone often not separated in simple format, but user didn't specify distinct regex for it in example.
			// Wait, "Pengiriman ke:" block usually implies it.
			// If the user example had a specific Receiver Phone field, I'd parse it.
			// In the example: "Nomor Telp: ..." is under Buyer.
			// The example: "Nama Penerima: Manusia Lain", "Alamat: ...". No distinct Receiver Phone.
			// I'll leave receiverPhone empty or maybe define logic later if needed.
			address: addressMatch?.[1]?.trim() || '',
			notes: notesMatch?.[1]?.trim() || '',
			items: parsedItems
		};

		manualModal.show(parsedData);
		showParserModal = false;
		waInput = '';
	}

	function openManualInput() {
		showParserModal = false;
		manualModal.show();
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Arimbi Store</title>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="main-container">
	<!-- Header -->
	<header class="page-header no-print">
		<div class="header-content">
			<h1>Manajemen Transaksi</h1>
			<p>Kelola pesanan, invoice, dan chat pelanggan Arimbi Store.</p>
		</div>
		<div class="header-actions">
			<button class="btn-primary" onclick={() => (showParserModal = true)}>
				<span class="btn-icon">+</span> Input Pesanan WA
			</button>
		</div>
	</header>

	<!-- Stats Grid -->
	<div class="stats-grid no-print">
		<div class="stat-card">
			<p class="stat-label">Pesanan Baru</p>
			<h3 class="stat-value text-amber">{stats.pendingCount}</h3>
		</div>
		<div class="stat-card">
			<p class="stat-label">Siap Kirim</p>
			<h3 class="stat-value text-blue">{stats.successCount}</h3>
		</div>
		<div class="stat-card">
			<p class="stat-label">Total Omzet</p>
			<h3 class="stat-value text-indigo">{formatPrice(stats.monthRevenue)}</h3>
		</div>
		<div class="stat-card">
			<p class="stat-label">Target Bulanan</p>
			<div class="progress-bar-bg">
				<div class="progress-bar-fill" style="width: 70%"></div>
			</div>
		</div>
	</div>

	<!-- Table -->
	<TransactionTable
		{transactions}
		onEdit={(trx) => manualModal.show(trx)}
		onPrint={printInvoice}
		onChat={openChatMenu}
	/>

	<!-- Pagination -->
	<!-- Pagination -->
	<div class="pagination-container no-print">
		<span class="pagination-info">
			Showing <strong>{(pagination.currentPage - 1) * pagination.perPage + 1}</strong> to
			<strong>{Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)}</strong
			>
			of {pagination.totalItems}
		</span>
		<div class="pagination-buttons">
			<a
				href="?page={pagination.currentPage - 1}"
				class="btn-page {pagination.hasPrevPage ? '' : 'disabled'}">Prev</a
			>
			<span class="page-number">{pagination.currentPage}</span>
			<a
				href="?page={pagination.currentPage + 1}"
				class="btn-page {pagination.hasNextPage ? '' : 'disabled'}">Next</a
			>
			>
		</div>
	</div>
</div>

<!-- Parser Modal -->
{#if showParserModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop no-print" onclick={() => (showParserModal = false)} transition:fade>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<div>
					<h3>Input Pesanan</h3>
					<p class="modal-subtitle">Paste format order WA atau input manual</p>
				</div>
				<button onclick={() => (showParserModal = false)} class="btn-close">✕</button>
			</div>
			<div class="modal-body">
				<textarea
					bind:value={waInput}
					placeholder="Contoh:&#10;Nama: Budi&#10;Alamat: Jl. Sudirman No 1&#10;HP: 08123..."
					class="parser-textarea"
					rows="5"
				></textarea>
				<div class="parser-actions">
					<button
						class="btn-primary w-full justify-center"
						onclick={parseWaChat}
						disabled={!waInput.trim()}
					>
						Proses Format WA
					</button>
					<div class="divider-text">ATAU</div>
					<button class="btn-secondary w-full justify-center" onclick={openManualInput}>
						Input Manual Tanpa Format
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<ManualTransactionModal bind:this={manualModal} {products} {bundles} />

<!-- Chat Modal -->
{#if showChatModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop no-print" onclick={() => (showChatModal = false)} transition:fade>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<div>
					<h3>Template Chat WA</h3>
					<p class="modal-subtitle">Kirim ke: {selectedTrx?.buyerName}</p>
				</div>
				<button onclick={() => (showChatModal = false)} class="btn-close">✕</button>
			</div>
			<div class="modal-body">
				{#each Object.entries(chatTemplates) as [key, template]}
					<button
						onclick={() => copyTemplate(key as keyof typeof chatTemplates)}
						class="btn-template"
					>
						<span class="template-label">{template.label}</span>
						<span class="template-preview">{template.preview}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- Print Layout -->
{#if selectedTrx}
	<div class="print-layout print-only">
		<div class="invoice-box">
			<div class="invoice-header">
				<h1 class="invoice-title">ARIMBI STORE - INVOICE</h1>
				<div class="invoice-meta">
					<p>{formatDate(selectedTrx.timestamp)}</p>
				</div>
			</div>
			<hr class="divider" />
			<p class="invoice-row"><strong>Invoice:</strong> #{selectedTrx.id}</p>
			<p class="invoice-row"><strong>Kepada:</strong> {selectedTrx.buyerName}</p>

			<table class="invoice-table">
				<thead>
					<tr>
						<th align="left">Item</th>
						<th align="right">Qty</th>
						<th align="right">Total</th>
					</tr>
				</thead>
				<tbody>
					{#each selectedTrx.items as item}
						<tr>
							<td>{item.product_name}</td>
							<td align="right">{item.qty}</td>
							<td align="right">{formatPrice(item.price * item.qty)}</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr>
						<td colspan="2" align="right" class="total-label">Total</td>
						<td align="right" class="total-value">{formatPrice(selectedTrx.total)}</td>
					</tr>
				</tfoot>
			</table>

			<div class="invoice-footer">
				Terima kasih sudah berbelanja di Arimbi Store!<br />
				Follow IG: @arimbi.store
			</div>
		</div>

		<!-- Shipping Label -->
		<div class="shipping-label">
			<p class="label-header">Penerima:</p>
			<h2 class="label-name">{selectedTrx.buyerName}</h2>
			<p class="label-phone">{selectedTrx.buyerPhone}</p>
			<p class="label-address">{selectedTrx.address || 'Alamat tidak tersedia'}</p>
			<hr class="divider dark" />
			<div class="label-footer">
				<div>
					<p class="sender-label">Dari:</p>
					<p class="sender-name">Arimbi Store</p>
					<p class="sender-phone">{$page.data.settings?.admin_whatsapp || '0812-3456-7890'}</p>
				</div>
				<div class="courier-info">
					<p>{selectedTrx.courier || 'EKSPEDISI'}</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Reset & Fonts */
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

	:global(body) {
		margin: 0;
		font-family: 'Inter', sans-serif;
		background-color: #f8fafc; /* slate-50 */
		color: #1e293b; /* slate-800 */
	}

	/* Colors */
	:root {
		--primary: #4f46e5; /* indigo-600 */
		--primary-hover: #4338ca; /* indigo-700 */
		--primary-light: #e0e7ff; /* indigo-100 */
		--bg-white: #ffffff;
		--border-color: #f1f5f9; /* slate-100 */
		--text-dark: #1e293b;
		--text-gray: #64748b; /* slate-500 */
		--text-code: #0f172a;

		--status-pending-bg: #fef9c3;
		--status-pending-text: #854d0e;
		--status-paid-bg: #dbeafe;
		--status-paid-text: #1e40af;
		--status-shipped-bg: #f3e8ff;
		--status-shipped-text: #6b21a8;
		--status-done-bg: #dcfce7;
		--status-done-text: #166534;
		--status-cancelled-bg: #fee2e2;
		--status-cancelled-text: #991b1b;
	}

	.main-container {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Header */
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	.page-header h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
	}
	.page-header p {
		color: var(--text-gray);
		font-size: 0.95rem;
		margin: 0;
	}

	.btn-primary {
		background-color: var(--primary);
		color: white;
		border: none;
		padding: 0.75rem 1.25rem;
		border-radius: 0.75rem;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background 0.2s;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}
	.btn-primary:hover {
		background-color: var(--primary-hover);
	}
	.btn-secondary {
		background-color: white;
		color: var(--text-dark);
		border: 1px solid #e2e8f0;
		padding: 0.75rem 1.25rem;
		border-radius: 0.75rem;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background 0.2s;
	}
	.btn-secondary:hover {
		background-color: #f8fafc;
		border-color: #cbd5e1;
	}
	.btn-icon {
		font-size: 1.1em;
		line-height: 1;
	}
	.w-full {
		width: 100%;
	}
	.justify-center {
		justify-content: center;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	.stat-card {
		background: var(--bg-white);
		border: 1px solid var(--border-color);
		padding: 1.5rem;
		border-radius: 1rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
	}
	.stat-label {
		font-size: 0.9rem;
		color: var(--text-gray);
		margin: 0 0 0.5rem 0;
	}
	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
	}

	.text-amber {
		color: #d97706;
	}
	.text-blue {
		color: #2563eb;
	}
	.text-indigo {
		color: var(--primary);
	}

	.progress-bar-bg {
		width: 100%;
		background: #f1f5f9;
		height: 8px;
		border-radius: 99px;
		margin-top: 1rem;
	}
	.progress-bar-fill {
		background: var(--primary);
		height: 100%;
		border-radius: 99px;
	}

	/* Table */
	.table-container {
		background: var(--bg-white);
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
		margin-bottom: 1.5rem;
	}
	.data-table {
		width: 100%;
		border-collapse: collapse;
	}
	.data-table th {
		background: #f8fafc;
		text-align: left;
		padding: 1rem 1.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-gray);
		border-bottom: 1px solid var(--border-color);
	}
	.data-table td {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid #f8fafc;
		font-size: 0.9rem;
		vertical-align: top;
	}
	.data-table tr:hover {
		background: #fcfcfd;
	}

	/* Columns */
	.invoice-number {
		display: block;
		font-weight: 700;
		color: var(--text-dark);
	}
	.invoice-date {
		font-size: 0.8rem;
		color: #94a3b8;
	}

	.customer-name {
		display: block;
		font-weight: 600;
		color: #334155;
	}
	.customer-phone {
		color: var(--primary);
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: 4px;
	}
	.icon-phone {
		font-size: 0.8em;
	}

	.main-item {
		display: block;
		color: #475569;
		font-size: 0.9rem;
	}
	.more-items {
		font-size: 0.8rem;
		color: #94a3b8;
		font-style: italic;
	}

	.input-resi {
		width: 140px;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		outline: none;
		transition: border 0.2s;
	}
	.input-resi:focus {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px var(--primary-light);
	}

	.select-status {
		appearance: none;
		border: none;
		padding: 0.4rem 1rem;
		border-radius: 2rem;
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		outline: none;
		text-align: center;
	}
	/* Status Colors */
	.pending {
		background: var(--status-pending-bg);
		color: var(--status-pending-text);
	}
	.paid {
		background: var(--status-paid-bg);
		color: var(--status-paid-text);
	}
	.shipped {
		background: var(--status-shipped-bg);
		color: var(--status-shipped-text);
	}
	.done {
		background: var(--status-done-bg);
		color: var(--status-done-text);
	}
	.cancelled {
		background: var(--status-cancelled-bg);
		color: var(--status-cancelled-text);
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}
	.btn-icon-action {
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		border-radius: 0.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		color: #64748b;
		transition: background 0.2s;
	}
	.btn-icon-action:hover {
		background: #f1f5f9;
		color: var(--text-dark);
	}
	.btn-whatsapp:hover {
		background: #f0fdf4;
		color: #166534;
	}

	/* Pagination */
	.pagination-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.pagination-info {
		font-size: 0.9rem;
		color: var(--text-gray);
	}
	.pagination-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.btn-page {
		text-decoration: none;
		color: var(--text-dark);
		border: 1px solid var(--border-color);
		padding: 0.4rem 0.8rem;
		border-radius: 0.4rem;
		font-size: 0.85rem;
		background: white;
	}
	.btn-page:hover {
		background: #f8fafc;
	}
	.btn-page.disabled {
		opacity: 0.5;
		pointer-events: none;
	}
	.page-number {
		background: var(--primary-light);
		color: var(--primary);
		font-weight: 700;
		padding: 0.4rem 0.8rem;
		border-radius: 0.4rem;
		font-size: 0.85rem;
	}

	/* Modal */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.4);
		backdrop-filter: blur(4px);
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.modal-content {
		background: white;
		width: 100%;
		max-width: 450px;
		border-radius: 1.5rem;
		overflow: hidden;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}
	.modal-header {
		background: #eef2ff;
		padding: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: start;
		border-bottom: 1px solid var(--border-color);
	}
	.modal-header h3 {
		margin: 0;
		color: #312e81;
		font-size: 1.1rem;
	}
	.modal-subtitle {
		margin: 4px 0 0;
		font-size: 0.8rem;
		color: var(--primary);
	}
	.btn-close {
		background: none;
		border: none;
		font-size: 1.2rem;
		color: #94a3b8;
		cursor: pointer;
	}

	.modal-body {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.btn-template {
		background: white;
		border: 1px solid var(--border-color);
		padding: 1rem;
		border-radius: 1rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-template:hover {
		border-color: #c7d2fe;
		background: #f5f7ff;
	}
	.template-label {
		display: block;
		font-weight: 700;
		color: #334155;
		margin-bottom: 0.25rem;
		font-size: 0.9rem;
	}
	.template-preview {
		display: block;
		font-size: 0.8rem;
		color: #94a3b8;
		font-style: italic;
	}
	.btn-template:hover .template-label {
		color: var(--primary);
	}

	/* Parser Modal Specifics */
	.parser-textarea {
		width: 100%;
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: #f8fafc;
		font-size: 0.9rem;
		resize: vertical;
		outline: none;
		margin-bottom: 0.5rem;
		font-family: inherit;
		box-sizing: border-box;
	}
	.parser-textarea:focus {
		background: white;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px var(--primary-light);
	}
	.parser-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		margin-top: 0.5rem;
	}
	.divider-text {
		font-size: 0.7rem;
		font-weight: 700;
		color: #94a3b8;
		letter-spacing: 0.1em;
	}

	/* Print Styles */
	@media print {
		.no-print {
			display: none !important;
		}
		.print-only {
			display: block !important;
		}
		body {
			background: white;
			font-size: 12pt;
		}
	}

	.print-only {
		display: none;
	}

	.print-layout {
		padding: 0;
	}
	.invoice-box {
		border: 2px dashed #cbd5e1;
		padding: 2rem;
		margin-bottom: 2rem;
		height: 148mm;
		box-sizing: border-box;
	}
	.invoice-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
	.invoice-title {
		font-size: 1.2rem;
		font-weight: 700;
		font-style: italic;
		margin: 0;
	}
	.invoice-meta {
		text-align: right;
		font-size: 0.9rem;
		color: #64748b;
	}
	.divider {
		border: 0;
		border-top: 1px solid #e2e8f0;
		margin: 1rem 0;
	}
	.divider.dark {
		border-color: black;
	}

	.invoice-row {
		margin: 0.25rem 0;
		font-size: 0.9rem;
	}
	.invoice-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1.5rem;
		font-size: 0.9rem;
	}
	.invoice-table th {
		border-bottom: 1px solid #000;
		padding: 0.5rem 0;
	}
	.invoice-table td {
		padding: 0.5rem 0;
		border-bottom: 1px dashed #e2e8f0;
	}
	.total-label {
		font-weight: 700;
		padding-top: 1rem;
	}
	.total-value {
		font-weight: 700;
		padding-top: 1rem;
	}

	.invoice-footer {
		margin-top: 2rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		padding: 1rem;
		text-align: center;
		font-style: italic;
		color: #94a3b8;
		font-size: 0.8rem;
	}

	.shipping-label {
		border: 2px solid black;
		padding: 1.5rem;
		width: 100mm;
		box-sizing: border-box;
	}
	.label-header {
		font-size: 0.75rem;
		text-transform: uppercase;
		font-style: italic;
		margin: 0;
	}
	.label-name {
		font-size: 1.25rem;
		font-weight: 800;
		text-transform: uppercase;
		margin: 0.25rem 0;
	}
	.label-phone {
		font-size: 1.1rem;
		font-family: monospace;
		list-style: none;
		margin: 0 0 0.5rem 0;
	}
	.label-address {
		font-size: 0.9rem;
		line-height: 1.4;
		margin: 0;
	}

	.label-footer {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: 1rem;
	}
	.sender-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		color: #64748b;
		margin: 0;
	}
	.sender-name {
		font-size: 0.8rem;
		font-weight: 700;
		margin: 0;
	}
	.sender-phone {
		font-size: 0.7rem;
		margin: 0;
	}
	.courier-info p {
		font-size: 0.8rem;
		font-family: monospace;
		font-weight: 600;
		margin: 0;
	}
</style>
