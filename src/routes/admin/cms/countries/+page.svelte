<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props<{ data: any; form: any }>();

	let searchQuery = $state('');
	let showModal = $state(false);
	let adding = $state(false);
	let editMode = $state(false);
	let editingCountry = $state<any>(null);

	// Filter countries based on search
	let filteredCountries = $derived(() => {
		if (!searchQuery) return data.countries;
		const query = searchQuery.toLowerCase();
		return data.countries.filter(
			(country: any) =>
				country.name.toLowerCase().includes(query) ||
				(country.code && country.code.toLowerCase().includes(query))
		);
	});

	// Close modal after successful add/edit
	$effect(() => {
		if (form?.success && form?.message) {
			showModal = false;
			adding = false;
			editMode = false;
			editingCountry = null;
		}
	});

	function openAddModal() {
		editMode = false;
		editingCountry = null;
		showModal = true;
	}

	function openEditModal(country: any) {
		editMode = true;
		editingCountry = { ...country };
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editMode = false;
		editingCountry = null;
	}
</script>

<div class="page-header">
	<div>
		<h2>Countries Management</h2>
		<p class="subtitle">{data.countries.length} total countries</p>
	</div>
	<button class="btn-primary" onclick={openAddModal}> ➕ Add Country </button>
</div>

{#if form?.success && form?.message}
	<div class="success-banner">
		✅ {form.message}
	</div>
{/if}

{#if form?.error}
	<div class="error-banner">
		❌ {form.error}
	</div>
{/if}

<div class="card">
	<div class="search-bar">
		<input
			type="text"
			placeholder="🔍 Search countries by name or code..."
			bind:value={searchQuery}
		/>
		<span class="count">{filteredCountries().length} countries</span>
	</div>

	<div class="table-container">
		<table>
			<thead>
				<tr>
					<th>Flag</th>
					<th>Name</th>
					<th>Code</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredCountries() as country (country.id)}
					<tr class:inactive={country.is_active === false}>
						<td class="flag-cell">{country.flag_emoji}</td>
						<td class="name-cell">{country.name}</td>
						<td class="code-cell">{country.code || '-'}</td>
						<td class="code-cell">{country.code || '-'}</td>
						<td>
							{#if country.is_active}
								<span class="badge active">Active</span>
							{:else}
								<span class="badge inactive">Inactive</span>
							{/if}
						</td>
						<td>
							<div class="action-buttons">
								<button class="btn-edit" onclick={() => openEditModal(country)}> ✏️ Edit </button>
								<form method="POST" action="?/toggleCountry" use:enhance>
									<input type="hidden" name="id" value={country.id} />
									<input
										type="hidden"
										name="is_active"
										value={country.is_active ? 'false' : 'true'}
									/>
									<button type="submit" class="btn-toggle">
										{country.is_active ? 'Disable' : 'Enable'}
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Add/Edit Country Modal -->
{#if showModal}
	<div class="modal-overlay" onclick={closeModal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>{editMode ? 'Edit Country' : 'Add New Country'}</h3>
				<button class="close-btn" onclick={closeModal}>×</button>
			</div>

			<form
				method="POST"
				action={editMode ? '?/editCountry' : '?/addCountry'}
				use:enhance={() => {
					adding = true;
					return async ({ update }) => {
						await update();
						adding = false;
					};
				}}
			>
				{#if editMode && editingCountry}
					<input type="hidden" name="id" value={editingCountry.id} />
				{/if}

				<div class="modal-body">
					<div class="field">
						<label for="name">Country Name <span class="required">*</span></label>
						<input
							type="text"
							id="name"
							name="name"
							placeholder="e.g., Singapore"
							value={editingCountry?.name || ''}
							required
						/>
						<small>Code will be auto-generated from first 2 letters</small>
					</div>

					<div class="field">
						<label for="flag_emoji">Flag Emoji</label>
						<input
							type="text"
							id="flag_emoji"
							name="flag_emoji"
							placeholder="🇸🇬"
							value={editingCountry?.flag_emoji || ''}
							maxlength="4"
						/>
						<small
							>Optional - Copy from <a href="https://emojipedia.org/flags" target="_blank"
								>Emojipedia</a
							></small
						>
					</div>
				</div>

				<div class="modal-footer">
					<button type="button" class="btn-secondary" onclick={closeModal}> Cancel </button>
					<button type="submit" class="btn-primary" disabled={adding}>
						{adding
							? editMode
								? 'Updating...'
								: 'Adding...'
							: editMode
								? 'Update Country'
								: 'Add Country'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.subtitle {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 0.25rem;
	}

	.success-banner,
	.error-banner {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-weight: 500;
	}

	.success-banner {
		background: #dcfce7;
		color: #166534;
		border: 1px solid #86efac;
	}

	.error-banner {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fca5a5;
	}

	.card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.search-bar {
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.search-bar input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}

	.count {
		font-size: 0.875rem;
		color: #6b7280;
		white-space: nowrap;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: #f9fafb;
	}

	th {
		padding: 1rem;
		text-align: left;
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	tr.inactive {
		opacity: 0.5;
	}

	.flag-cell {
		font-size: 1.5rem;
		width: 60px;
	}

	.name-cell {
		font-weight: 500;
	}

	.code-cell {
		font-family: monospace;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.badge.active {
		background: #dcfce7;
		color: #166534;
	}

	.badge.inactive {
		background: #f3f4f6;
		color: #6b7280;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.btn-edit {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		background: white;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-edit:hover {
		background: #f9fafb;
		border-color: #3b82f6;
		color: #3b82f6;
	}

	.btn-primary {
		background: var(--primary-600);
		color: white;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-700);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: #374151;
		padding: 0.75rem 1.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary:hover {
		background: #f9fafb;
	}

	.btn-toggle {
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		background: white;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-toggle:hover {
		background: #f9fafb;
		border-color: var(--primary-600);
		color: var(--primary-600);
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: white;
		border-radius: 1rem;
		max-width: 500px;
		width: 100%;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}

	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 2rem;
		color: #9ca3af;
		cursor: pointer;
		line-height: 1;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		color: #374151;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.field {
		margin-bottom: 1.5rem;
	}

	.field:last-child {
		margin-bottom: 0;
	}

	.field label {
		display: block;
		font-weight: 500;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		color: #374151;
	}

	.required {
		color: #ef4444;
	}

	.field input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		box-sizing: border-box;
	}

	.field input:focus {
		outline: none;
		border-color: var(--primary-600);
		box-shadow: 0 0 0 3px var(--primary-100);
	}

	.field small {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.field small a {
		color: var(--primary-600);
		text-decoration: none;
	}

	.field small a:hover {
		text-decoration: underline;
	}

	.modal-footer {
		padding: 1.5rem;
		border-top: 1px solid #e5e7eb;
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}
</style>
