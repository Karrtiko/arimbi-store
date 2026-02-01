<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props<{ data: any }>();
</script>

<div class="header">
	<h1>Manage Bundles</h1>
	<a href="/admin/bundles/new" class="btn-primary">+ Create Bundle</a>
</div>

<div class="card">
	<table class="table">
		<thead>
			<tr>
				<th>Image</th>
				<th>Name</th>
				<th>Price</th>
				<th>Stock</th>
				<th>Items</th>
				<th>Status</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if data.bundles.length === 0}
				<tr>
					<td colspan="7" class="empty">No bundles found. Create one!</td>
				</tr>
			{:else}
				{#each data.bundles as bundle}
					<tr>
						<td>
							{#if bundle.image_url}
								<img src={bundle.image_url} alt={bundle.name} class="thumb" />
							{:else}
								<span class="no-img">📷</span>
							{/if}
						</td>
						<td>
							<div class="name">{bundle.name}</div>
							<small class="slug">/{bundle.slug}</small>
						</td>
						<td>
							<div class="price">Rp {bundle.price.toLocaleString()}</div>
						</td>
						<td>
							<div class="stock-badge" class:low={bundle.stock < 5} class:out={bundle.stock <= 0}>
								{bundle.stock ?? 0}
							</div>
						</td>
						<td>
							<span class="badge">{bundle.item_count} Items</span>
						</td>
						<td>
							<form action="?/toggle" method="POST" use:enhance>
								<input type="hidden" name="id" value={bundle.id} />
								<input type="hidden" name="current_state" value={bundle.is_active.toString()} />
								<button class="status-btn {bundle.is_active ? 'active' : 'inactive'}">
									{bundle.is_active ? 'Active' : 'Inactive'}
								</button>
							</form>
						</td>
						<td class="actions">
							<a href="/admin/bundles/{bundle.id}" class="btn-icon">✏️</a>
							<form action="?/delete" method="POST" use:enhance style="display:inline;">
								<input type="hidden" name="id" value={bundle.id} />
								<button
									type="submit"
									class="btn-icon delete"
									onclick={(e) => {
										if (!confirm('Are you sure?')) e.preventDefault();
									}}>🗑️</button
								>
							</form>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 1.875rem;
		font-weight: 800;
		color: #111827;
		margin: 0;
	}

	.btn-primary {
		background-color: var(--primary-600);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		text-decoration: none;
		font-weight: 600;
		transition: background-color 0.2s;
	}

	.btn-primary:hover {
		background-color: var(--primary-700);
	}

	.card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
	}

	.table th {
		text-align: left;
		padding: 1rem 1.5rem;
		background: #f9fafb;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 600;
	}

	.table td {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
		vertical-align: middle;
	}

	.thumb {
		width: 48px;
		height: 48px;
		border-radius: 0.5rem;
		object-fit: cover;
	}

	.no-img {
		width: 48px;
		height: 48px;
		background: #f3f4f6;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
	}

	.name {
		font-weight: 600;
		color: #111827;
	}

	.slug {
		color: #9ca3af;
	}

	.price {
		font-weight: 600;
		color: var(--primary-600);
	}

	.badge {
		background: #eff6ff;
		color: var(--primary-700);
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.status-btn {
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		border: none;
		cursor: pointer;
	}

	.status-btn.active {
		background: #def7ec;
		color: #03543f;
	}

	.status-btn.inactive {
		background: #fde8e8;
		color: #9b1c1c;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-icon {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.25rem;
		padding: 0.25rem;
		transition: transform 0.2s;
	}

	.btn-icon:hover {
		transform: scale(1.1);
	}

	.btn-icon.delete:hover {
		filter: hue-rotate(320deg); /* Make it reddish */
	}

	.empty {
		text-align: center;
		padding: 3rem;
		color: #6b7280;
	}
	/* Stock Badge */
	.stock-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		background: #d1fae5;
		color: #065f46;
	}
	.stock-badge.low {
		background: #ffedd5;
		color: #9a3412;
	}
	.stock-badge.out {
		background: #fee2e2;
		color: #991b1b;
	}
</style>
