<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let { data } = $props<{ data: any }>();
	let transactions = $derived(data.transactions || []);

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
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	function handlePrint() {
		window.print();
	}
</script>

<div class="print-toolbar no-print">
	<button onclick={() => window.history.back()} class="btn-back">← Kembali</button>
	<div class="info">
		<strong>{transactions.length} Dokumen Siap Cetak</strong>
		<span>Format A4 (Invoice + Resi)</span>
	</div>
	<button onclick={handlePrint} class="btn-print">🖨️ Cetak Sekarang</button>
</div>

<div class="print-area">
	{#each transactions as trx}
		<div class="page-container">
			<!-- TOP: INVOICE -->
			<div class="section invoice">
				<div class="header">
					<div class="brand">
						<h1>INVOICE</h1>
						<h2>Arimbi Store</h2>
						<p>Whatsapp: {$page.data.settings?.admin_whatsapp || '0812-3456-7890'}</p>
					</div>
					<div class="meta">
						<div class="row">
							<span class="label">No. Invoice</span>
							<span class="val">#{trx.id}</span>
						</div>
						<div class="row">
							<span class="label">Tanggal</span>
							<span class="val">{formatDate(trx.timestamp || trx.created_at)}</span>
						</div>
						<div class="row">
							<span class="label">Status</span>
							<span class="val status">{trx.status}</span>
						</div>
					</div>
				</div>

				<div class="customer-info">
					<div class="to">
						<h3>Kepada:</h3>
						<p class="name">{trx.receiver?.name || trx.buyer?.name}</p>
						<p class="phone">{trx.receiver?.phone || trx.buyer?.phone}</p>
						<p class="address">{trx.address || '-'}</p>
					</div>
				</div>

				<table class="items-table">
					<thead>
						<tr>
							<th>Produk</th>
							<th class="text-center">Qty</th>
							<th class="text-right">Harga</th>
							<th class="text-right">Total</th>
						</tr>
					</thead>
					<tbody>
						{#each trx.items || [] as item}
							<tr>
								<td>{item.product_name || item.name}</td>
								<td class="text-center">{item.qty}</td>
								<td class="text-right">{formatPrice(item.price || 0)}</td>
								<td class="text-right">{formatPrice((item.price || 0) * item.qty)}</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td colspan="3" class="text-right label-total">Total Tagihan</td>
							<td class="text-right value-total">{formatPrice(trx.total)}</td>
						</tr>
					</tfoot>
				</table>

				{#if trx.notes}
					<div class="notes">
						<strong>Catatan:</strong>
						{trx.notes}
					</div>
				{/if}

				<div class="footer">Terima kasih telah berbelanja di Arimbi Store!</div>
			</div>

			<!-- CUT LINE -->
			<div class="cut-line">
				<span>✂ Potong di sini</span>
			</div>

			<!-- BOTTOM: RESI -->
			<div class="section resi">
				<div class="resi-border">
					<div class="resi-header">
						<h2>RESI PENGIRIMAN</h2>
						<h1 class="resi-number">{trx.resi || '________________'}</h1>
					</div>

					<div class="sender-receiver">
						<div class="sender">
							<span class="label">Pengirim:</span>
							<span class="name">Arimbi Store</span>
							<span class="phone">{$page.data.settings?.admin_whatsapp || '0812-3456-7890'}</span>
						</div>
						<div class="receiver">
							<span class="label">Penerima:</span>
							<span class="name-lg">{trx.receiver?.name || trx.buyer?.name}</span>
							<span class="phone">{trx.receiver?.phone || trx.buyer?.phone}</span>
							<p class="address">{trx.address || 'Alamat tidak tersedia'}</p>
						</div>
					</div>

					<div class="package-content">
						<span class="label">Isi Paket:</span>
						<p>
							{(trx.items || [])
								.map((i: any) => `${i.qty}x ${i.product_name || i.name}`)
								.join(', ')}
						</p>
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	/* SCREEN STYLES */
	:global(body) {
		background: #525659; /* PDF viewer bg feel */
		margin: 0;
	}

	.print-toolbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 60px;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 2rem;
		z-index: 1000;
	}

	.info {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.info strong {
		color: #1e293b;
		font-size: 1rem;
	}
	.info span {
		font-size: 0.8rem;
		color: #64748b;
	}

	.btn-back {
		color: #64748b;
		background: none;
		border: none;
		cursor: pointer;
		font-weight: 500;
	}
	.btn-print {
		background: #4f46e5;
		color: white;
		border: none;
		padding: 0.5rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
	}
	.btn-print:hover {
		background: #4338ca;
	}

	.print-area {
		margin-top: 80px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding-bottom: 4rem;
	}

	/* A4 PAGE CONTAINER */
	.page-container {
		width: 210mm;
		height: 296mm; /* Slight sub-A4 to match printer margins */
		background: white;
		padding: 10mm;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		position: relative;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	/* INVOICE SECTION (TOP) */
	.section.invoice {
		flex: 1; /* Takes top half */
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
		justify-content: space-between;
		border-bottom: 2px solid #f1f5f9;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}
	.brand h1 {
		font-size: 1.5rem;
		color: #4f46e5;
		margin: 0;
	}
	.brand h2 {
		font-size: 1rem;
		margin: 0.2rem 0;
	}
	.meta .row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.2rem;
	}
	.meta .label {
		color: #64748b;
	}
	.meta .val {
		font-weight: 600;
	}

	.items-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
		font-size: 0.9rem;
	}
	.items-table th {
		background: #f8fafc;
		padding: 0.5rem;
		text-align: left;
		border-bottom: 1px solid #e2e8f0;
	}
	.items-table td {
		padding: 0.5rem;
		border-bottom: 1px solid #f1f5f9;
	}
	.text-center {
		text-align: center;
	}
	.text-right {
		text-align: right;
	}
	.label-total {
		font-weight: bold;
	}
	.value-total {
		font-weight: bold;
		font-size: 1.1rem;
		color: #4f46e5;
	}

	.footer {
		margin-top: auto;
		text-align: center;
		font-size: 0.8rem;
		color: #94a3b8;
		padding-top: 1rem;
	}

	/* CUT LINE */
	.cut-line {
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	.cut-line::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		border-top: 2px dashed #cbd5e1;
	}
	.cut-line span {
		background: white;
		padding: 0 1rem;
		color: #94a3b8;
		font-size: 0.8rem;
		position: relative;
		z-index: 1;
	}

	/* RESI SECTION (BOTTOM) */
	.section.resi {
		height: 125mm; /* Fixed height for resi area */
		padding-top: 1rem;
	}
	.resi-border {
		border: 1px solid #000;
		height: 100%;
		padding: 1rem;
		display: flex;
		flex-direction: column;
	}
	.resi-header {
		text-align: center;
		border-bottom: 1px solid #000;
		padding-bottom: 1rem;
	}
	.resi-header h2 {
		margin: 0;
		font-size: 1rem;
	}
	.resi-header h1 {
		margin: 0.5rem 0 0;
		font-size: 2rem;
		letter-spacing: 2px;
	}
	.sender-receiver {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		padding: 1rem 0;
		border-bottom: 1px solid #000;
	}
	.sender,
	.receiver {
		display: flex;
		flex-direction: column;
	}
	.label {
		font-size: 0.8rem;
		color: #64748b;
		margin-bottom: 0.2rem;
	}
	.name {
		font-weight: bold;
	}
	.name-lg {
		font-weight: bold;
		font-size: 1.2rem;
	}
	.address {
		margin-top: 0.5rem;
		font-size: 0.9rem;
		line-height: 1.4;
	}
	.package-content {
		padding-top: 1rem;
	}

	/* PRINT MEDIA QUERY */
	@media print {
		/* A4 Settings */
		@page {
			size: A4;
			margin: 0;
		}
		body {
			background: white;
		}

		.print-toolbar {
			display: none !important;
		}
		.print-area {
			margin: 0;
			padding: 0;
			display: block; /* Flow layout for print */
		}
		.page-container {
			box-shadow: none;
			margin: 0;
			width: 100%;
			height: 100vh; /* Use viewport unit for page break calc */
			page-break-after: always; /* Force new page for next container */
			break-after: page;
			border: none;
		}
		.no-print {
			display: none;
		}
	}
</style>
