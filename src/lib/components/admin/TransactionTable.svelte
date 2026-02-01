<script lang="ts">
	import { enhance } from '$app/forms';
	import confetti from 'canvas-confetti';

	// Props
	let {
		transactions = [],
		onEdit = (trx: any) => {},
		onPrint = (trx: any) => {},
		onChat = (trx: any) => {},
		onDelete = (trx: any) => {}
	} = $props<{
		transactions: any[];
		onEdit?: (trx: any) => void;
		onPrint?: (trx: any) => void;
		onChat?: (trx: any) => void;
		onDelete?: (trx: any) => void;
	}>();

	// State
	let selectedIds = $state<string[]>([]);
	let isAllSelected = $derived(
		transactions.length > 0 && selectedIds.length === transactions.length
	);

	// Selection Handlers
	function toggleAll(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		if (checked) {
			selectedIds = transactions.map((t) => t.id);
		} else {
			selectedIds = [];
		}
	}

	function toggleOne(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((sid) => sid !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function handleBulkPrint(type: 'combined') {
		if (selectedIds.length === 0) return;
		const idsParam = selectedIds.join(',');
		window.location.href = `/print?ids=${idsParam}&type=${type}`;
	}

	function handleSinglePrint(trx: any) {
		window.location.href = `/print?ids=${trx.id}&type=combined`;
	}

	// Format helpers
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price);
	};

	const formatDate = (dateStr: string) => {
		const d = new Date(dateStr);
		return d.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	function getStatusClass(status: string) {
		switch (status) {
			case 'PAID':
				return 'success';
			case 'SHIPPED':
				return 'info';
			case 'DONE':
				return 'success';
			case 'PENDING':
				return 'warning';
			case 'CANCELLED':
				return 'error';
			default:
				return '';
		}
	}

	function handleStatusChange(e: Event, trx: any) {
		const select = e.target as HTMLSelectElement;
		const newStatus = select.value;

		// Logic Resi Popup for SHIPPED
		let resiValue = trx.resi;
		if (newStatus === 'SHIPPED') {
			const input = prompt('Masukkan Nomor Resi:', trx.resi || '');
			if (input === null) {
				// Cancelled
				select.value = trx.status; // Revert
				return;
			}
			resiValue = input;
		}

		const formData = new FormData();
		formData.append('id', trx.id);
		formData.append('status', newStatus);
		if (resiValue) formData.append('resi', resiValue);

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

	function handleDelete(trx: any) {
		if (confirm(`Yakin ingin menghapus transaksi #${trx.id}?`)) {
			const formData = new FormData();
			formData.append('id', trx.id);
			fetch('?/deleteTransaction', { method: 'POST', body: formData }).then(() => {
				window.location.reload();
			});
		}
	}
</script>

{#if selectedIds.length > 0}
	<div class="bulk-actions">
		<span class="bulk-count">{selectedIds.length} Dipilih</span>
		<div class="flex gap-2">
			<button class="btn-bulk btn-print-inv" onclick={() => handleBulkPrint('combined')}>
				🖨️ Cetak Invoice & Resi (A4)
			</button>
		</div>
	</div>
{/if}

<div class="table-container no-print">
	<table class="data-table">
		<thead>
			<tr>
				<th class="w-10 text-center">
					<input type="checkbox" checked={isAllSelected} onchange={toggleAll} class="checkbox-lg" />
				</th>
				<th>ID / Waktu</th>
				<th>Pelanggan</th>
				<th>Pesanan</th>
				<th class="text-center">Resi</th>
				<th class="text-center">Status</th>
				<th class="text-center">Aksi</th>
			</tr>
		</thead>
		<tbody>
			{#each transactions as trx}
				<tr class:selected={selectedIds.includes(trx.id)}>
					<td class="text-center">
						<input
							type="checkbox"
							checked={selectedIds.includes(trx.id)}
							onchange={() => toggleOne(trx.id)}
							class="checkbox-lg"
						/>
					</td>
					<!-- ID & Time -->
					<td>
						<div class="flex flex-col">
							<span class="invoice-number">#{trx.id}</span>
							<span class="invoice-date">{formatDate(trx.timestamp || trx.created_at)}</span>
						</div>
					</td>

					<!-- Pelanggan -->
					<td>
						<div class="flex flex-col">
							<span class="customer-name">{trx.buyerName || trx.buyer?.name || 'Guest'}</span>
							<span class="customer-phone">
								<span class="icon-phone">📞</span>
								{trx.buyerPhone || trx.buyer?.phone || '-'}
							</span>
						</div>
					</td>

					<!-- Pesanan -->
					<td>
						<div class="item-details">
							{#if trx.items && trx.items.length > 0}
								{@const firstItem = trx.items[0]}
								{@const remaining = trx.items.length - 1}
								<span class="main-item">
									{firstItem.product_name || firstItem.name}
									<strong class="qty-badge">x{firstItem.qty}</strong>
								</span>
								{#if remaining > 0}
									<span class="more-items">+{remaining} lainnya</span>
								{/if}
								<div class="total-price">{formatPrice(trx.total)}</div>
							{:else}
								<span class="no-item">-</span>
							{/if}
						</div>
					</td>

					<!-- Resi (Info Only) -->
					<td class="text-center">
						<span class="resi-text">{trx.resi || '-'}</span>
					</td>

					<!-- Status (Editable) -->
					<td class="text-center">
						<div class="status-wrapper">
							<select
								value={trx.status}
								onchange={(e) => handleStatusChange(e, trx)}
								class="select-status {getStatusClass(trx.status)}"
							>
								<option value="PENDING">PENDING</option>
								<option value="PAID">PAID</option>
								<option value="SHIPPED">SHIPPED</option>
								<option value="DONE">DONE</option>
								<option value="CANCELLED">CANCELLED</option>
							</select>
						</div>
					</td>

					<!-- Aksi -->
					<td class="text-center">
						<div class="action-buttons">
							<button onclick={() => onEdit(trx)} title="Edit" class="btn-icon-action btn-edit"
								>✏️</button
							>
							<button
								onclick={() => handleSinglePrint(trx)}
								title="Print"
								class="btn-icon-action btn-print">🖨️</button
							>
							<button onclick={() => onChat(trx)} title="Chat" class="btn-icon-action btn-whatsapp"
								>💬</button
							>
							<button
								onclick={() => handleDelete(trx)}
								title="Hapus"
								class="btn-icon-action btn-delete">🗑️</button
							>
						</div>
					</td>
				</tr>
			{/each}
			{#if transactions.length === 0}
				<tr>
					<td colspan="7" class="empty-state">Belum ada transaksi saat ini.</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

	/* Variables (inherited or locally defined as fallback) */
	:global(:root) {
		--primary: #4f46e5;
		--primary-light: #e0e7ff;
		--border-color: #f1f5f9;
		--text-dark: #1e293b;
		--text-gray: #64748b;
	}

	.table-container {
		background: white;
		border: 1px solid var(--border-color, #e2e8f0);
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
	}
	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'Inter', sans-serif;
	}
	.data-table th {
		background: #f8fafc;
		text-align: left;
		padding: 1rem 1.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-gray, #64748b);
		border-bottom: 1px solid var(--border-color, #e2e8f0);
	}
	.text-center {
		text-align: center !important;
	}

	.data-table td {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid #f8fafc;
		font-size: 0.875rem;
		vertical-align: top;
		color: var(--text-dark, #334155);
	}
	.data-table tr:hover {
		background: #fcfcfd;
	}
	.data-table tr:last-child td {
		border-bottom: none;
	}

	/* Column Styles */
	.flex {
		display: flex;
	}
	.flex-col {
		flex-direction: column;
	}

	.invoice-number {
		display: block;
		font-weight: 700;
		color: #4f46e5;
		font-family: monospace;
		font-size: 0.95rem;
	}
	.invoice-date {
		font-size: 0.75rem;
		color: #94a3b8;
		margin-top: 2px;
	}

	.customer-name {
		font-weight: 600;
		color: #1e293b;
	}
	.customer-phone {
		color: #64748b;
		font-size: 0.8rem;
		display: flex;
		align-items: center;
		gap: 4px;
		margin-top: 4px;
	}
	.icon-phone {
		font-size: 0.8em;
	}

	.item-details {
		font-size: 0.9rem;
	}
	.main-item {
		color: #334155;
		display: block;
	}
	.qty-badge {
		background: #f1f5f9;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.75rem;
		color: #475569;
	}
	.more-items {
		font-size: 0.75rem;
		color: #94a3b8;
		font-style: italic;
		display: block;
		margin-top: 2px;
	}
	.total-price {
		font-weight: 700;
		margin-top: 4px;
		color: #1e293b;
		font-size: 0.95rem;
	}
	.no-item {
		color: #cbd5e1;
	}

	.input-resi {
		width: 100%;
		max-width: 140px;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		font-size: 0.85rem;
		outline: none;
		transition: all 0.2s;
		text-align: center;
	}
	.input-resi:focus {
		border-color: #4f46e5;
		box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
	}

	.status-wrapper {
		display: flex;
		justify-content: center;
	}
	.select-status {
		appearance: none;
		border: none;
		padding: 0.35rem 1rem;
		border-radius: 2rem;
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		outline: none;
		text-align: center;
		letter-spacing: 0.025em;
		transition: transform 0.1s;
	}
	.select-status:hover {
		transform: scale(1.05);
	}

	/* Status Colors */
	.success {
		background: #dcfce7;
		color: #166534;
	}
	.warning {
		background: #fef9c3;
		color: #854d0e;
	}
	.info {
		background: #dbeafe;
		color: #1e40af;
	}
	.error {
		background: #fee2e2;
		color: #991b1b;
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}
	.btn-icon-action {
		width: 32px;
		height: 32px;
		border: 1px solid #e2e8f0;
		background: white;
		border-radius: 0.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		color: #64748b;
		transition: all 0.2s;
	}
	.btn-icon-action:hover {
		transform: translateY(-2px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}
	.btn-edit:hover {
		background: #fef3c7;
		color: #d97706;
		border-color: #fde68a;
	}
	.btn-print:hover {
		background: #f1f5f9;
		color: #1e293b;
		border-color: #cbd5e1;
	}
	.btn-whatsapp:hover {
		background: #dcfce7;
		color: #166534;
		border-color: #bbf7d0;
	}

	.resi-text {
		font-family: monospace;
		font-size: 0.9rem;
		color: #1e293b;
		letter-spacing: 0.05em;
	}
	.btn-delete:hover {
		background: #fee2e2;
		color: #991b1b;
		border-color: #fecaca;
	}

	.bulk-actions {
		background: #1e293b;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		animation: slideDown 0.2s ease-out;
	}
	@keyframes slideDown {
		from {
			transform: translateY(-10px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.bulk-count {
		font-weight: 700;
		font-size: 0.9rem;
	}

	.btn-bulk {
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-print-inv {
		background: #4f46e5;
		color: white;
	}
	.btn-print-inv:hover {
		background: #4338ca;
	}
	.btn-print-resi {
		background: white;
		color: #1e293b;
	}
	.btn-print-resi:hover {
		background: #f1f5f9;
	}

	.checkbox-lg {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: #4f46e5;
	}

	tr.selected td {
		background-color: #f0fdf4;
	}

	.empty-state {
		text-align: center;
		padding: 3rem !important;
		color: #94a3b8;
		font-style: italic;
	}
</style>
