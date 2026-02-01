<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	export let form;
</script>

<div class="login-container">
	<div class="login-card" in:fade={{ duration: 400 }}>
		<div class="brand">
			<h1>Arimbi<span class="highlight">Admin</span></h1>
			<p>Please sign in to continue</p>
		</div>

		{#if form?.error}
			<div class="error-alert">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="username">Username</label>
				<input
					type="text"
					id="username"
					name="username"
					required
					placeholder="admin"
					autocomplete="off"
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input type="password" id="password" name="password" required placeholder="••••••" />
			</div>

			<button type="submit" class="btn-login"> Sign In </button>
		</form>

		<div class="footer">
			<a href="/">← Back to Store</a>
		</div>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		padding: 1rem;
	}

	.login-card {
		background: white;
		padding: 2.5rem;
		border-radius: 1rem;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		width: 100%;
		max-width: 400px;
	}

	.brand {
		text-align: center;
		margin-bottom: 2rem;
	}

	.brand h1 {
		font-size: 1.5rem;
		font-weight: 800;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	.highlight {
		color: var(--primary-600);
	}
	.brand p {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	input {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		transition: border-color 0.2s;
		box-sizing: border-box; /* Fix width overlap */
	}

	input:focus {
		outline: none;
		border-color: var(--primary-600);
		box-shadow: 0 0 0 3px var(--primary-100);
	}

	.btn-login {
		width: 100%;
		padding: 0.75rem;
		background: var(--primary-600);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
		margin-top: 0.5rem;
	}

	.btn-login:hover {
		background: var(--primary-700);
	}

	.error-alert {
		background: #fef2f2;
		color: #991b1b;
		padding: 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		margin-bottom: 1.5rem;
		text-align: center;
		border: 1px solid #fee2e2;
	}

	.footer {
		margin-top: 1.5rem;
		text-align: center;
	}
	.footer a {
		color: #6b7280;
		font-size: 0.875rem;
		text-decoration: none;
	}
	.footer a:hover {
		color: #111827;
	}
</style>
