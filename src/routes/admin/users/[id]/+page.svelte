<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';

	let { data, form } = $props();

	let password = $state('');
	let confirmPassword = $state('');

	function validate(e: Event) {
		if (password !== confirmPassword) {
			e.preventDefault();
			alert('Passwords do not match');
		}
	}
</script>

<div class="page-header">
	<a href="/admin/users" class="back-link">← Back to Users</a>
	<h1>{data.user ? 'Edit User' : 'Create New User'}</h1>
</div>

<div class="card">
	<form action="?/save" method="POST" use:enhance onsubmit={validate}>
		{#if form?.error}
			<div class="alert error">{form.error}</div>
		{/if}

		<div class="form-group">
			<label for="username">Username</label>
			<input
				type="text"
				id="username"
				name="username"
				value={data.user?.username || ''}
				required
				autocomplete="off"
			/>
		</div>

		<div class="form-group">
			<label for="role">Role</label>
			<select id="role" name="role" value={data.user?.role || 'staff'}>
				<option value="staff">Staff</option>
				<option value="admin">Admin</option>
			</select>
		</div>

		<div class="divider"></div>

		<div class="form-group">
			<label for="password"
				>{data.user ? 'New Password (leave blank to keep current)' : 'Password'}</label
			>
			<input
				type="password"
				id="password"
				name="password"
				bind:value={password}
				required={!data.user}
				autocomplete="new-password"
			/>
		</div>

		<div class="form-group">
			<label for="confirmPassword">Confirm Password</label>
			<input
				type="password"
				id="confirmPassword"
				bind:value={confirmPassword}
				required={!!password}
			/>
		</div>

		<div class="actions">
			<Button type="submit" variant="primary">Save User</Button>
		</div>
	</form>
</div>

<style>
	.page-header {
		margin-bottom: 2rem;
	}

	.back-link {
		color: var(--gray-500);
		text-decoration: none;
		font-size: 0.875rem;
		display: inline-block;
		margin-bottom: 0.5rem;
	}

	h1 {
		font-size: 1.875rem;
		font-weight: 800;
		color: var(--gray-900);
		margin: 0;
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--gray-200);
		max-width: 600px;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--gray-700);
		margin-bottom: 0.5rem;
	}

	input,
	select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--gray-300);
		border-radius: var(--radius-md);
		font-size: 1rem;
	}

	.divider {
		height: 1px;
		background: var(--gray-200);
		margin: 2rem 0;
	}

	.alert {
		padding: 1rem;
		border-radius: var(--radius-md);
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.alert.error {
		background: #fee2e2;
		color: #ef4444;
		border: 1px solid #fecaca;
	}
</style>
