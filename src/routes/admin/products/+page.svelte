<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props<{ data: any }>();

	// Format helper
	const formatPrice = (p: number) => new Intl.NumberFormat('id-ID').format(p);

	// Filter Logic
	let searchTimer: NodeJS.Timeout;
	function handleSearch(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			updateQuery('q', val);
		}, 300);
	}

	function updateQuery(key: string, value: string | number) {
		const url = new URL($page.url);
		if (value) url.searchParams.set(key, String(value));
		else url.searchParams.delete(key);
		goto(url, { keepFocus: true, noScroll: true });
	}
</script>

<div class="page-header">
	<h2>Manage Products ({data.products.length})</h2>
	<a href="/admin/products/save" class="btn-primary">+ Add New Product</a>
</div>

<!-- Filters Toolbar -->
<div class="filter-bar">
	<div class="search-box">
		<span class="icon">🔍</span>
		<input
			type="text"
			placeholder="Search products..."
			value={data.filters.search}
			oninput={handleSearch}
		/>
	</div>

	<select
		value={data.filters.categoryId}
		onchange={(e) => updateQuery('cat', e.target.value)}
		class="filter-select"
	>
		<option value="0">All Categories</option>
		{#each data.categories as cat}
			<option value={cat.id}>{cat.name}</option>
		{/each}
	</select>

	<select
		value={data.filters.sortBy}
		onchange={(e) => updateQuery('sort', e.target.value)}
		class="filter-select"
	>
		<option value="newest">Newest First</option>
		<option value="name">Name (A-Z)</option>
		<option value="stock_low">Stock (Low to High)</option>
		<option value="stock_high">Stock (High to Low)</option>
		<option value="price_low">Price (Low to High)</option>
		<option value="price_high">Price (High to Low)</option>
	</select>
</div>

<div class="card" in:fade>
	<table class="data-table">
		<thead>
			<tr>
				<th width="60">Img</th>
				<th>
					<button
						class="sort-btn"
						onclick={() =>
							updateQuery('sort', data.filters.sortBy === 'name' ? 'name_desc' : 'name')}
					>
						Name / Category
						{#if data.filters.sortBy === 'name'}↑{:else if data.filters.sortBy === 'name_desc'}↓{/if}
					</button>
				</th>
				<th>
					<button
						class="sort-btn"
						onclick={() =>
							updateQuery('sort', data.filters.sortBy === 'stock_low' ? 'stock_high' : 'stock_low')}
					>
						Stock
						{#if data.filters.sortBy === 'stock_low'}↑{:else if data.filters.sortBy === 'stock_high'}↓{/if}
					</button>
				</th>
				<th>
					<button
						class="sort-btn"
						onclick={() =>
							updateQuery('sort', data.filters.sortBy === 'price_low' ? 'price_high' : 'price_low')}
					>
						Price
						{#if data.filters.sortBy === 'price_low'}↑{:else if data.filters.sortBy === 'price_high'}↓{/if}
					</button>
				</th>
				<th>Status</th>
				<th width="100">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each data.products as product}
				<tr>
					<td>
						<img
							src={product.image_url}
							alt={product.name}
							class="thumb"
							onerror={(e) => (e.currentTarget.src = '/images/products/placeholder.jpg')}
						/>
					</td>
					<td>
						<div class="font-bold">{product.name}</div>
						<div class="meta">
							<span class="cat-badge">{product.category_name}</span>
							<span class="country-flag" title={product.country_name}>{product.country_flag}</span>
						</div>
					</td>
					<td>
						<div class="stock-badge" class:low={product.stock < 10} class:out={product.stock <= 0}>
							{product.stock ?? 0}
						</div>
					</td>
					<td>Rp {formatPrice(product.price)}</td>
					<td>
						<span class="badge" class:active={product.is_active}>
							{product.is_active ? 'Active' : 'Inactive'}
						</span>
					</td>
					<td>
						<div class="action-group">
							<a href="/admin/products/save?id={product.id}" class="btn-icon edit" title="Edit"
								>✏️</a
							>
							<form
								method="POST"
								action="?/delete"
								use:enhance
								onsubmit={(e) => !confirm('Delete this product?') && e.preventDefault()}
							>
								<input type="hidden" name="id" value={product.id} />
								<button type="submit" class="btn-icon delete" title="Delete">🗑️</button>
							</form>
						</div>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="6" class="empty-row">No products found matching your filters.</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.filter-bar {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}
	.search-box {
		position: relative;
		flex: 1;
		min-width: 200px;
	}
	.search-box input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 2.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		box-sizing: border-box;
	}
	.search-box .icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
	}

	.filter-select {
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background: white;
		min-width: 160px;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		min-width: 800px;
	}
	.data-table th {
		text-align: left;
		padding: 1rem;
		background: #f9fafb;
		font-size: 0.75rem;
		text-transform: uppercase;
		color: #6b7280;
		color: #6b7280;
		font-weight: 600;
	}

	.sort-btn {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-transform: inherit;
		font-weight: inherit;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.sort-btn:hover {
		color: var(--primary-600);
	}
	.data-table td {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		vertical-align: middle;
	}

	.thumb {
		width: 48px;
		height: 48px;
		border-radius: 8px;
		object-fit: cover;
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
	}

	.font-bold {
		font-weight: 600;
		color: #111827;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: #6b7280;
	}
	.cat-badge {
		background: #f3f4f6;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.stock-badge {
		font-weight: 600;
		font-family: monospace;
		font-size: 0.875rem;
	}
	.stock-badge.low {
		color: #d97706;
	}
	.stock-badge.out {
		color: #dc2626;
		background: #fee2e2;
		padding: 2px 6px;
		border-radius: 4px;
		display: inline-block;
	}

	.badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 99px;
		background: #f3f4f6;
		color: #6b7280;
	}
	.badge.active {
		background: #dcfce7;
		color: #166534;
	}

	.action-group {
		display: flex;
		gap: 0.5rem;
	}
	.btn-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		background: white;
		cursor: pointer;
		text-decoration: none;
		font-size: 1rem;
	}
	.btn-icon:hover {
		background: #f3f4f6;
	}
	.btn-icon.delete:hover {
		background: #fee2e2;
		border-color: #fee2e2;
	}

	.btn-primary {
		background: var(--primary-600);
		color: white;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		text-decoration: none;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.empty-row {
		text-align: center;
		color: #6b7280;
		padding: 3rem;
	}
</style>
