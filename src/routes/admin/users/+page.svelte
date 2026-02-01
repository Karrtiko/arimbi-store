<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<div class="page-header">
	<div class="header-content">
		<h1>Users</h1>
		<p class="subtitle">Manage admin access</p>
	</div>
	<Button href="/admin/users/new" variant="primary">+ Add User</Button>
</div>

<div class="card">
	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>Username</th>
					<th>Role</th>
					<th>Created At</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as user}
					<tr>
						<td>
							<div class="user-info">
								<span class="username">{user.username}</span>
								{#if user.id === 1}
									<span class="badge">Super Admin</span>
								{/if}
							</div>
						</td>
						<td>{user.role}</td>
						<td>{new Date(user.created_at).toLocaleDateString()}</td>
						<td>
							<div class="actions">
								<a href="/admin/users/{user.id}" class="btn-icon" title="Edit">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg
									>
								</a>
								{#if user.id !== 1}
									<form action="?/delete" method="POST" use:enhance>
										<input type="hidden" name="id" value={user.id} />
										<button
											type="submit"
											class="btn-icon delete"
											title="Delete"
											onclick={() => confirm('Are you sure?')}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><polyline points="3 6 5 6 21 6"></polyline><path
													d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
												></path></svg
											>
										</button>
									</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 1.875rem;
		font-weight: 800;
		color: var(--gray-900);
		margin: 0;
	}

	.subtitle {
		color: var(--gray-500);
		margin: 0;
	}

	.card {
		background: white;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--gray-200);
		overflow: hidden;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 1rem 1.5rem;
		background: var(--gray-50);
		border-bottom: 1px solid var(--gray-200);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--gray-500);
		font-weight: 600;
	}

	td {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--gray-100);
		color: var(--gray-700);
	}

	tr:last-child td {
		border-bottom: none;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.username {
		font-weight: 600;
		color: var(--gray-900);
	}

	.badge {
		background: var(--primary-100);
		color: var(--primary-700);
		font-size: 0.7rem;
		padding: 0.125rem 0.375rem;
		border-radius: var(--radius-full);
		font-weight: 600;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-md);
		background: var(--gray-50);
		color: var(--gray-600);
		transition: all 0.2s;
		border: none;
		cursor: pointer;
	}

	.btn-icon:hover {
		background: var(--gray-100);
		color: var(--gray-900);
	}

	.btn-icon.delete:hover {
		background: #fee2e2;
		color: #ef4444;
	}
</style>
