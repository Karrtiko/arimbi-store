<script lang="ts">
	import { page } from '$app/stores';

	let { data } = $props();
	let { pages = [] } = data;

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Manage Pages - Admin Arimbi Store</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<div>
			<h1 class="page-title">Manajemen Halaman</h1>
			<p class="page-subtitle">Edit konten halaman depan dan about us.</p>
		</div>
	</header>

	<div class="card">
		<table class="table">
			<thead>
				<tr>
					<th>Halaman</th>
					<th>Slug</th>
					<th>Terakhir Diupdate</th>
					<th class="text-right">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#each pages as p}
					<tr>
						<td class="font-bold">{p.title}</td>
						<td><span class="badge">{p.slug}</span></td>
						<td class="text-gray-500 text-sm">{formatDate(p.updated_at)}</td>
						<td class="text-right">
							<a href="/admin/pages/{p.slug}" class="btn-edit"> ✏️ Edit </a>
						</td>
					</tr>
				{/each}
				{#if pages.length === 0}
					<tr>
						<td colspan="4" class="text-center py-8 text-gray-400">
							Belum ada halaman yang terdaftar.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	.page-container {
		max-width: 1000px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-title {
		font-size: 1.875rem;
		font-weight: 800;
		color: var(--gray-900);
	}

	.page-subtitle {
		color: var(--gray-600);
		margin-top: 0.5rem;
	}

	.card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		border: 1px solid var(--gray-200);
	}

	.table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 1rem 1.5rem;
		background: var(--gray-50);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--gray-500);
		font-weight: 700;
		border-bottom: 1px solid var(--gray-200);
	}

	td {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--gray-100);
		vertical-align: middle;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.badge {
		background: var(--gray-100);
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		font-family: monospace;
		font-size: 0.875rem;
		color: var(--gray-700);
	}

	.btn-edit {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--primary-50);
		color: var(--primary-700);
		font-weight: 600;
		border-radius: 0.5rem;
		text-decoration: none;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.btn-edit:hover {
		background: var(--primary-100);
	}

	.text-right {
		text-align: right;
	}
	.text-center {
		text-align: center;
	}
	.font-bold {
		font-weight: 600;
	}
	.text-sm {
		font-size: 0.875rem;
	}
	.text-gray-500 {
		color: var(--gray-500);
	}
	.py-8 {
		padding-top: 2rem;
		padding-bottom: 2rem;
	}
	.text-gray-400 {
		color: var(--gray-400);
	}
</style>
