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
	let selectedTrx: any = $state(null);

	// Transaction Form State
	let manualModal: any;

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
			<button class="btn-primary" onclick={() => manualModal.show()}>
				<span class="btn-icon">+</span> Input Pesanan WA
			</button>
		</div>
	</header>

	<!-- Stats Grid -->
	<!-- Stats Grid -->
	<!-- Stats Grid -->
	<div class="stats-grid no-print">
		<!-- 1. Revenue Card (Leading) -->
		<div class="stat-card" style="grid-column: span 2;">
			<div class="stat-icon revenue">💰</div>
			<div class="stat-info">
				<div class="revenue-header">
					<span class="stat-label">Omset Bulan Ini</span>
					<span class="stat-value">{formatPrice(stats.monthRevenue || 0)}</span>
				</div>
				<div class="month-nav">
					<span style="font-size: 0.75rem; color: #64748b; margin-right: 0.5rem;">
						{new Date(stats.viewYear, stats.viewMonth).toLocaleDateString('id-ID', {
							month: 'long',
							year: 'numeric'
						})}
					</span>

					<a
						href="?month={(stats.viewMonth - 1 + 12) % 12}&year={stats.viewMonth === 0
							? stats.viewYear - 1
							: stats.viewYear}"
						class="nav-btn"
						title="Bulan Sebelumnya">◀</a
					>
					<a
						href="?month={(stats.viewMonth + 1) % 12}&year={stats.viewMonth === 11
							? stats.viewYear + 1
							: stats.viewYear}"
						class="nav-btn"
						title="Bulan Berikutnya">▶</a
					>
				</div>
			</div>
		</div>

		<!-- 2. Status Cards -->
		<div class="stat-card">
			<div class="stat-icon pending">⏳</div>
			<div class="stat-info">
				<span class="stat-label">Pending</span>
				<span class="stat-value">{stats.statusCounts?.PENDING || 0}</span>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon paid">📦</div>
			<div class="stat-info">
				<span class="stat-label">Siap Kirim</span>
				<span class="stat-value">{stats.statusCounts?.PAID || 0}</span>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon shipped">🚚</div>
			<div class="stat-info">
				<span class="stat-label">Dikirim</span>
				<span class="stat-value">{stats.statusCounts?.SHIPPED || 0}</span>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon done">✅</div>
			<div class="stat-info">
				<span class="stat-label">Selesai</span>
				<span class="stat-value">{stats.statusCounts?.DONE || 0}</span>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon cancelled">❌</div>
			<div class="stat-info">
				<span class="stat-label">Batal</span>
				<span class="stat-value">{stats.statusCounts?.CANCELLED || 0}</span>
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
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}
	.stat-card {
		background: var(--bg-white);
		border: 1px solid var(--border-color);
		padding: 1.5rem;
		border-radius: 1rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
		display: flex;
		align-items: center;
		gap: 1rem;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}
	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}
	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	/* Icon Backgrounds */
	.stat-icon.revenue {
		background: #eff6ff;
		color: #3b82f6;
	} /* blue */
	.stat-icon.pending {
		background: #fef3c7;
		color: #d97706;
	} /* amber */
	.stat-icon.paid {
		background: #e0e7ff;
		color: #4f46e5;
	} /* indigo */
	.stat-icon.shipped {
		background: #f3e8ff;
		color: #9333ea;
	} /* purple */
	.stat-icon.done {
		background: #dcfce7;
		color: #16a34a;
	} /* green */
	.stat-icon.cancelled {
		background: #fee2e2;
		color: #dc2626;
	} /* red */

	.stat-info {
		display: flex;
		flex-direction: column;
	}
	.stat-label {
		font-size: 0.85rem;
		color: var(--text-gray);
		margin: 0 0 0.25rem 0;
		font-weight: 500;
	}
	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		color: var(--text-dark);
	}

	/* Specific Revenue Header Styles */
	.revenue-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.month-nav {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}
	.nav-btn {
		background: #f1f5f9;
		border: none;
		border-radius: 4px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		cursor: pointer;
		text-decoration: none;
		color: #64748b;
		transition: background 0.2s;
	}
	.nav-btn:hover {
		background: #e2e8f0;
		color: #334155;
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
