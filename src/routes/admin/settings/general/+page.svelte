<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);
	let successMessage = $state('');

	function handleSubmit() {
		isSubmitting = true;
		successMessage = '';
		return async ({ result, update }: any) => {
			isSubmitting = false;
			if (result.type === 'success') {
				successMessage = 'Pengaturan berhasil disimpan!';
				setTimeout(() => (successMessage = ''), 3000);
			}
			await update();
		};
	}
</script>

<svelte:head>
	<title>Pengaturan Umum - Admin</title>
</svelte:head>

<div class="settings-container">
	<div class="header">
		<h1>⚙️ Pengaturan Umum</h1>
		<p class="subtitle">Konfigurasi pengaturan toko Anda</p>
	</div>

	{#if successMessage}
		<div class="alert alert-success">{successMessage}</div>
	{/if}

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	<form method="POST" action="?/updateSettings" use:enhance={handleSubmit}>
		<!-- WhatsApp Settings -->
		<div class="section">
			<h2 class="section-title">📱 WhatsApp Admin</h2>
			<p class="section-desc">Nomor WhatsApp untuk customer service</p>

			<div class="form-group">
				<label for="admin_whatsapp">Nomor WhatsApp</label>
				<input
					type="text"
					id="admin_whatsapp"
					name="admin_whatsapp"
					value={form?.admin_whatsapp || data.settings.admin_whatsapp}
					placeholder="Contoh: 62812345678 atau 60123456789"
					required
				/>
				<small
					>Format: Kode Negara + Nomor (Tanpa tanda +). Contoh: 628xxx (Indo), 601xxx (Malaysia)</small
				>
			</div>
		</div>

		<!-- Stock Settings -->
		<div class="section">
			<h2 class="section-title">📦 Pengaturan Stok</h2>
			<p class="section-desc">Threshold untuk badge "Tinggal Sedikit"</p>

			<div class="form-group">
				<label for="low_stock_threshold">Low Stock Threshold</label>
				<input
					type="number"
					id="low_stock_threshold"
					name="low_stock_threshold"
					value={data.settings.low_stock_threshold}
					min="1"
					max="100"
					required
				/>
				<small>Produk dengan stok ≤ nilai ini akan tampil badge warning</small>
			</div>
		</div>

		<!-- Display Settings -->
		<div class="section">
			<h2 class="section-title">🎨 Pengaturan Tampilan</h2>
			<p class="section-desc">Jumlah produk yang ditampilkan</p>

			<div class="form-row">
				<div class="form-group">
					<label for="products_per_page_catalog">Produk per Halaman (Katalog)</label>
					<input
						type="number"
						id="products_per_page_catalog"
						name="products_per_page_catalog"
						value={data.settings.products_per_page_catalog}
						min="5"
						max="100"
						required
					/>
				</div>

				<div class="form-group">
					<label for="products_per_category_home">Produk per Kategori (Home)</label>
					<input
						type="number"
						id="products_per_category_home"
						name="products_per_category_home"
						value={data.settings.products_per_category_home}
						min="3"
						max="20"
						required
					/>
				</div>
			</div>

			<div class="form-group">
				<label for="best_sellers_limit">Jumlah Produk Terlaris</label>
				<input
					type="number"
					id="best_sellers_limit"
					name="best_sellers_limit"
					value={data.settings.best_sellers_limit}
					min="5"
					max="50"
					required
				/>
				<small>Maksimal produk terlaris yang ditampilkan di homepage</small>
			</div>
		</div>

		<!-- Submit Button -->
		<div class="form-actions">
			<button type="submit" class="btn-primary" disabled={isSubmitting}>
				{#if isSubmitting}
					Menyimpan...
				{:else}
					💾 Simpan Pengaturan
				{/if}
			</button>
		</div>
	</form>
</div>

<style>
	.settings-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #6b7280;
		font-size: 1rem;
	}

	.alert {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.alert-success {
		background: #d1fae5;
		color: #065f46;
		border: 1px solid #10b981;
	}

	.alert-error {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #ef4444;
	}

	.section {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.section-desc {
		color: #6b7280;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group label {
		display: block;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		transition: all 0.2s;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--primary-600);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-group small {
		display: block;
		margin-top: 0.375rem;
		color: #6b7280;
		font-size: 0.8125rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.form-actions {
		margin-top: 2rem;
		display: flex;
		justify-content: flex-end;
	}

	.btn-primary {
		background: var(--primary-600);
		color: white;
		border: none;
		padding: 0.875rem 2rem;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-700);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
