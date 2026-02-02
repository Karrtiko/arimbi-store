<script lang="ts">
	import { enhance } from '$app/forms';
	import ManualTransactionModal from '$lib/components/admin/ManualTransactionModal.svelte';

	// Receive data from +page.server.ts
	let { data } = $props<{ data: any }>();

	// Destructure for easier usage in template
	let stats = $derived(data.stats);
	let transactions = $derived(data.transactions || []);

	let manualModal: ManualTransactionModal;

	import TransactionTable from '$lib/components/admin/TransactionTable.svelte';

	// Format helpers
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	};
</script>

<div class="dashboard-grid">
	<!-- 1. Omset Hari Ini (Static) -->
	<div class="stat-card">
		<div class="stat-icon revenue-day">📅</div>
		<div class="stat-info">
			<span class="label">Omset Hari Ini</span>
			<span class="value">{formatPrice(stats.dailyRevenue || 0)}</span>
			<span class="subtext">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
		</div>
	</div>

	<!-- 2. Omset Bulan Ini (Static - kept for usefulness, but non-interactive as requested "omset hari ini aja" might imply primary focus, but month is standard context) -->
	<!-- User said "omset harian dan bulanan tuh hapus aja... pakein omset hari ini aja". I will strictly follow "pakein omset hari ini aja" for the *change*, but keeping total revenue/pending is fine? -->
	<!-- I'll keep it simple: Just Omset Hari Ini as requested replacement for the filterable cards. -->

	<div class="stat-card">
		<div class="stat-icon orders">📦</div>
		<div class="stat-info">
			<span class="label">Siap Kirim (Paid)</span>
			<span class="value">{stats.needProcessCount || 0}</span>
		</div>
	</div>

	<div class="stat-card">
		<div class="stat-icon pending">⏳</div>
		<div class="stat-info">
			<span class="label">Pesanan Baru (Pending)</span>
			<span class="value">{stats.pendingCount || 0}</span>
		</div>
	</div>
</div>

<div class="section mt-8">
	<div class="section-header">
		<h2>Transaksi Hari Ini</h2>
		<div class="flex gap-2">
			<button class="btn-sm bg-black text-white border-black" onclick={() => manualModal.show()}
				>+ Tambah Transaksi</button
			>
			<a href="/admin/transactions" class="btn-sm">Lihat Semua</a>
		</div>
	</div>

	<div class="card table-container">
		<TransactionTable {transactions} onEdit={(trx) => manualModal.show(trx)} />
	</div>
</div>

<!-- MANUAL ENTRY MODAL COMPONENT -->
<ManualTransactionModal bind:this={manualModal} products={data.products} bundles={data.bundles} />

<style>
	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1.5rem;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.stat-card.clickable {
		cursor: pointer;
		position: relative;
	}

	.stat-card.clickable:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.stat-card.clickable:active {
		transform: translateY(0);
	}

	.stat-icon {
		width: 56px;
		height: 56px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
	}

	.stat-icon.revenue-day {
		background: #dcfce7;
		color: #166534;
	}
	.stat-icon.revenue-month {
		background: #ecfccb;
		color: #3f6212;
	}
	.stat-icon.revenue {
		background: #dcfce7;
		color: #166534;
	}
	.stat-icon.orders {
		background: #dbeafe;
		color: #1e40af;
	}
	.stat-icon.products {
		background: #f3e8ff;
		color: #6b21a8;
	}
	.stat-icon.pending {
		background: #ffedd5;
		color: #c2410c;
	}

	.stat-info {
		display: flex;
		flex-direction: column;
	}

	.stat-info .label {
		font-size: 0.875rem;
		color: #6b7280;
	}
	.stat-info .value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
	}
	.stat-info .subtext {
		font-size: 0.75rem;
		color: #9ca3af;
		margin-top: 0.25rem;
	}

	/* MODAL STYLES */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-modal {
		background: white;
		padding: 1.5rem;
		border-radius: 1rem;
		width: 90%;
		max-width: 320px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
	}

	.filter-modal h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.125rem;
		color: #111827;
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		font-size: 1rem;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.btn-cancel {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		background: #f3f4f6;
		color: #374151;
		font-weight: 500;
	}

	.btn-save {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		background: #111827;
		color: white;
		font-weight: 500;
	}
	.stat-info .trend {
		font-size: 0.75rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}
	.stat-info .trend.up {
		color: #166534;
	}

	.mt-8 {
		margin-top: 2rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.section-header h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
	}

	.revenue-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-bottom: 0.25rem;
	}

	.month-nav {
		display: flex;
		gap: 0.25rem;
	}

	.nav-btn {
		background: #f3f4f6;
		border: none;
		border-radius: 4px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		color: #6b7280;
		cursor: pointer;
		text-decoration: none;
		transition: all 0.2s;
	}

	.nav-btn:hover {
		background: #e5e7eb;
		color: #374151;
	}

	.card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-table th {
		text-align: left;
		padding: 1rem 1.5rem;
		background: #f9fafb;
		font-size: 0.75rem;
		text-transform: uppercase;
		color: #6b7280;
		font-weight: 600;
	}

	.data-table td {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		color: #374151;
		font-size: 0.875rem;
	}

	.data-table tr:last-child td {
		border-bottom: none;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.badge.success {
		background: #dcfce7;
		color: #166534;
	}
	.badge.warning {
		background: #fef3c7;
		color: #92400e;
	}
	.badge.info {
		background: #dbeafe;
		color: #1e40af;
	}
	.badge.error {
		background: #fee2e2;
		color: #991b1b;
	}

	.btn-sm {
		background: white;
		border: 1px solid #d1d5db;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.bg-black {
		background-color: #000;
	}
	.text-white {
		color: #fff;
	}
	.border-black {
		border-color: #000;
	}
</style>
