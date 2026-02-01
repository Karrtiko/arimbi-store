<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { data } = $props<{ data: any }>();

	// Local state for the form
	let name = $state(data.bundle?.name || '');
	let description = $state(data.bundle?.description || '');
	// let imageUrl = data.bundle?.image_url || '/uploads/bundles/default_bundle.png'; // Deprecated
	let price = $state(data.bundle?.price || 0);
	let stock = $state(data.bundle?.stock ?? 0);
	let isActive = $state(data.bundle?.is_active ?? true);

	// Image Management
	let currentImages = $state(
		data.bundle?.images || (data.bundle?.image_url ? [data.bundle.image_url] : [])
	);
	let selectedThumbnail = $state(
		data.bundle?.image_url || (currentImages.length > 0 ? currentImages[0] : '')
	);

	let newPreviews: { file: File; url: string }[] = $state([]);
	let dt: DataTransfer;

	onMount(() => {
		dt = new DataTransfer();
	});

	function handleFileSelect(e: Event) {
		if (!dt) dt = new DataTransfer(); // Safety fallback
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			Array.from(target.files).forEach((file) => {
				dt.items.add(file);
				// Assign to a new array to trigger reactivity for array push if it were not a proxy (but strict array spread is safer)
				newPreviews = [...newPreviews, { file, url: URL.createObjectURL(file) }];
			});
			// IMPORTANT: Update the input's files with the accumulated DataTransfer files
			target.files = dt.files;
		}
	}

	function removeExisting(index: number) {
		const removed = currentImages[index];
		currentImages = currentImages.filter((_, i) => i !== index);
		if (selectedThumbnail === removed) {
			selectedThumbnail = currentImages.length > 0 ? currentImages[0] : '';
		}
	}

	function removeNewFile(index: number) {
		dt.items.remove(index);
		const input = document.getElementById('new_images') as HTMLInputElement;
		if (input) {
			input.files = dt.files;
		}
		newPreviews = newPreviews.filter((_, i) => i !== index);
	}

	// Computed for thumbnail selection on new uploads
	let selectedNewIndex = $derived(newPreviews.findIndex((p) => p.url === selectedThumbnail));

	// Bundle Items State
	let items = $state(data.bundle?.items || []);
	let availableProducts = data.products;

	// Computed
	let originalPrice = $derived(
		items.reduce((sum, item) => {
			// If item has product_price (from server enrichment), use it.
			// Otherwise find in availableProducts
			const prod = availableProducts.find((p) => p.id === item.product_id);
			const pPrice = item.product_price || prod?.price || 0;
			return sum + pPrice * item.quantity;
		}, 0)
	);

	// Product Search State
	// Product Search State
	let searchTerm = $state('');
	let searchFocused = $state(false);
	let filteredProducts = $derived(
		searchTerm
			? availableProducts
					.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
					.slice(0, 5)
			: availableProducts.slice(0, 5) // Show top 5 when empty
	);

	function addProduct(product: any) {
		const existing = items.find((i) => i.product_id === product.id);

		if (existing) {
			existing.quantity += 1;
			items = [...items];
		} else {
			items = [
				...items,
				{
					product_id: product.id,
					quantity: 1,
					product_name: product.name,
					product_price: product.price,
					product_image: product.image_url
				}
			];
		}
		searchTerm = ''; // clear search after adding
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	function updateQuantity(index: number, delta: number) {
		const item = items[index];
		const newQty = item.quantity + delta;
		if (newQty > 0) {
			item.quantity = newQty;
			// items = items; // Trigger reactivity
			items = [...items];
		}
	}
</script>

<div class="page-header">
	<a href="/admin/bundles" class="back-link">← Back to Bundles</a>
	<div class="header-content">
		<h1>{data.bundle ? 'Edit Bundle' : 'Create New Bundle'}</h1>
		<div class="header-actions">
			<a href="/admin/bundles" class="btn-secondary">Cancel</a>
			<button type="submit" form="bundle-form" class="btn-primary">💾 Save Bundle</button>
		</div>
	</div>
</div>

<div class="grid">
	<!-- Form Section -->
	<div class="card form-card">
		<form
			id="bundle-form"
			action="?/save"
			method="POST"
			enctype="multipart/form-data"
			use:enhance={() => {
				return async ({ update, result }) => {
					await update();
					if (result.type === 'success' || result.type === 'redirect') {
						// Sync state with fresh data from server
						const b = data.bundle;
						if (b) {
							name = b.name;
							description = b.description;
							price = b.price;
							stock = b.stock;
							isActive = b.is_active;
							items = b.items || [];
							currentImages = b.images || (b.image_url ? [b.image_url] : []);
							selectedThumbnail = b.image_url || (currentImages.length > 0 ? currentImages[0] : '');

							// Reset Uploads
							newPreviews = [];
							dt = new DataTransfer();
							const input = document.getElementById('new_images') as HTMLInputElement;
							if (input) input.value = '';
						}
					}
				};
			}}
		>
			<div class="form-group">
				<label for="name">Bundle Name</label>
				<input
					type="text"
					id="name"
					name="name"
					bind:value={name}
					required
					placeholder="e.g. Paket Hemat A"
				/>
			</div>

			<div class="form-group">
				<label for="description">Description</label>
				<textarea
					id="description"
					name="description"
					bind:value={description}
					rows="3"
					placeholder="Describe what's inside..."
				></textarea>
			</div>

			<div class="form-group full">
				<label for="stock">Stock</label>
				<input type="number" id="stock" name="stock" bind:value={stock} required min="0" />
			</div>

			<!-- Image Gallery Manager -->
			<div class="form-group full">
				<label>Bundle Create (Images)</label>

				<!-- Hidden inputs -->
				<input type="hidden" name="images" value={JSON.stringify(currentImages)} />
				<input type="hidden" name="selected_thumbnail" value={selectedThumbnail} />
				<input type="hidden" name="selected_new_index" value={selectedNewIndex} />
				<input type="hidden" name="items" value={JSON.stringify(items)} />

				<!-- File Upload -->
				<div class="upload-area">
					<input
						type="file"
						name="new_images"
						id="new_images"
						accept="image/*"
						multiple
						onchange={handleFileSelect}
						onclick={(e) => ((e.target as HTMLInputElement).value = '')}
					/>
					<label for="new_images" class="upload-btn">
						<div class="upload-icon">📸</div>
						<div class="upload-text">Upload Images</div>
					</label>
				</div>

				<!-- Previews -->
				{#if currentImages.length > 0 || newPreviews.length > 0}
					<div class="gallery-grid">
						<!-- Existing Images -->
						{#each currentImages as img, i}
							<div class="img-card" class:selected={selectedThumbnail === img}>
								<img src={img} alt="Bundle" />
								<div class="actions">
									<button
										type="button"
										class="btn-star"
										title="Set as Thumbnail"
										onclick={() => (selectedThumbnail = img)}
									>
										{selectedThumbnail === img ? '⭐' : '☆'}
									</button>
									<button type="button" class="btn-remove" onclick={() => removeExisting(i)}
										>🗑️</button
									>
								</div>
								{#if selectedThumbnail === img}<div class="badge-main">Main</div>{/if}
							</div>
						{/each}

						<!-- New File Previews -->
						{#each newPreviews as preview, i}
							<div class="img-card new-file">
								<img src={preview.url} alt="New Upload" />
								<div class="actions">
									<span class="label-new">New</span>
									<button type="button" class="btn-remove" onclick={() => removeNewFile(i)}
										>❌</button
									>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="form-group checkbox-group">
				<input type="checkbox" id="is_active" name="is_active" checked={isActive} />
				<label for="is_active">Active (Visible to customers)</label>
			</div>

			<div class="divider"></div>

			<div class="price-section">
				<div class="price-info">
					<span class="label">Total Original Price:</span>
					<span class="value strikethrough">Rp {originalPrice.toLocaleString()}</span>
				</div>

				<div class="form-group">
					<label for="price">Bundle Price (Selling Price)</label>
					<div class="input-currency">
						<span>Rp</span>
						<input type="number" id="price" name="price" bind:value={price} required min="0" />
					</div>
				</div>
			</div>

			<!-- Hidden input to send items data -->
			<input type="hidden" name="items" value={JSON.stringify(items)} />

			<div class="form-actions mt-8">
				<button type="submit" class="btn-primary w-full">Save Bundle</button>
			</div>
		</form>
	</div>

	<!-- Items Manager Section -->
	<div class="card items-card">
		<h2>Bundle Contents</h2>

		<div class="product-search-box">
			<div class="search-input-wrapper">
				<input
					type="text"
					placeholder="Search product to add..."
					bind:value={searchTerm}
					onfocus={() => (searchFocused = true)}
					onblur={() => setTimeout(() => (searchFocused = false), 200)}
					class="search-input"
				/>
				<span class="search-icon">🔍</span>
			</div>

			{#if searchTerm || searchFocused}
				<!-- mousedown handler prevents blur from firing before click is registered -->
				<div class="search-results" role="listbox" onmousedown={(e) => e.preventDefault()}>
					{#each filteredProducts as p}
						<button type="button" class="result-item" onclick={() => addProduct(p)}>
							<img src={p.image_url} alt={p.name} class="result-thumb" />
							<div class="result-info">
								<div class="result-name">{p.name}</div>
								<div class="result-price">Rp {p.price.toLocaleString()}</div>
							</div>
							<span class="add-icon">+</span>
						</button>
					{/each}
					{#if filteredProducts.length === 0}
						<div class="no-results">
							{searchTerm ? 'No products found' : 'Start typing to search...'}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="items-list">
			{#if items.length === 0}
				<div class="empty-state">No products added yet.</div>
			{:else}
				{#each items as item, i}
					<div class="item-row">
						<img src={item.product_image} alt={item.product_name} class="item-thumb" />
						<div class="item-details">
							<div class="item-name">{item.product_name}</div>
							<div class="item-price">Rp {item.product_price?.toLocaleString()}</div>
						</div>
						<div class="item-qty">
							<button type="button" class="qty-btn" onclick={() => updateQuantity(i, -1)}>-</button>
							<span>{item.quantity}</span>
							<button type="button" class="qty-btn" onclick={() => updateQuantity(i, 1)}>+</button>
						</div>
						<button type="button" class="remove-btn" onclick={() => removeItem(i)}>×</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	.page-header {
		margin-bottom: 2rem;
	}

	.back-link {
		color: #6b7280;
		text-decoration: none;
		font-size: 0.875rem;
		display: inline-block;
		margin-bottom: 0.5rem;
	}

	h1 {
		font-size: 1.875rem;
		font-weight: 800;
		color: #111827;
		margin: 0;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	@media (max-width: 768px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		height: fit-content;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	input[type='text'],
	input[type='number'],
	textarea,
	select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 1rem;
	}

	.image-input-group {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.img-preview {
		width: 64px;
		height: 64px;
		object-fit: cover;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.checkbox-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.checkbox-group input {
		width: auto;
	}

	.checkbox-group label {
		margin: 0;
	}

	.divider {
		height: 1px;
		background: #e5e7eb;
		margin: 2rem 0;
	}

	.price-info {
		display: flex;
		justify-content: space-between;
		margin-bottom: 1rem;
		color: #6b7280;
	}

	.strikethrough {
		text-decoration: line-through;
	}

	.input-currency {
		position: relative;
	}

	.input-currency span {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: #6b7280;
	}

	.input-currency input {
		padding-left: 2.5rem;
	}

	.btn-primary {
		width: 100%;
		background: var(--primary-600);
		color: white;
		padding: 1rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: var(--primary-700);
	}

	/* Items Section */
	h2 {
		font-size: 1.25rem;
		margin-top: 0;
		margin-bottom: 1.5rem;
	}

	.add-item-box {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #111827;
		border: 1px solid #d1d5db;
		padding: 0 1rem;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.items-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.item-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		background: #f9fafb;
	}

	.item-thumb {
		width: 48px;
		height: 48px;
		border-radius: 0.375rem;
		object-fit: cover;
	}

	.item-details {
		flex: 1;
	}

	.item-name {
		font-weight: 600;
		font-size: 0.875rem;
		color: #111827;
	}

	.item-price {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.item-qty {
		display: flex;
		align-items: center;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
	}

	.qty-btn {
		background: none;
		border: none;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		color: #374151;
	}

	.qty-btn:hover {
		background: #f3f4f6;
	}

	.item-qty span {
		padding: 0 0.5rem;
		font-size: 0.875rem;
		min-width: 1.5rem;
		text-align: center;
	}

	.remove-btn {
		background: none;
		border: none;
		color: #ef4444;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0 0.5rem;
	}

	.remove-btn:hover {
		color: #dc2626;
	}

	.empty-state {
		text-align: center;
		color: #9ca3af;
		padding: 2rem;
		border: 2px dashed #e5e7eb;
		border-radius: 0.5rem;
	}

	/* Gallery Styles */
	.upload-area input {
		display: none;
	}
	.upload-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2rem;
		background: #f9fafb;
		border: 2px dashed #d1d5db;
		border-radius: 1rem;
		cursor: pointer;
		text-align: center;
		width: 100%;
		box-sizing: border-box;
	}
	.upload-btn:hover {
		border-color: var(--primary-600);
		background: #fdf2f8; /* slight pinkish tint or use primary tint */
	}
	.upload-icon {
		font-size: 2rem;
	}
	.upload-text {
		font-weight: 600;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Larger thumbnails */
		gap: 1.5rem;
		margin-top: 1.5rem;
	}
	.img-card {
		position: relative;
		border-radius: 0.5rem;
		overflow: hidden;
		aspect-ratio: 1;
		background: #f3f4f6;
		border: 2px solid transparent;
	}
	.img-card.selected {
		border-color: var(--primary-600);
	}
	.img-card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.actions {
		position: absolute;
		top: 4px;
		right: 4px;
		display: none; /* Show on hover */
		gap: 4px;
	}
	.img-card:hover .actions {
		display: flex;
	}

	.btn-star,
	.btn-remove {
		background: rgba(0, 0, 0, 0.6);
		color: white;
		border: none;
		width: 24px;
		height: 24px;
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
	}

	.badge-main {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--primary-600);
		color: white;
		font-size: 10px;
		text-align: center;
		padding: 2px 0;
		font-weight: bold;
	}
	.label-new {
		position: absolute;
		bottom: 4px;
		left: 4px;
		background: #22c55e;
		color: white;
		font-size: 10px;
		padding: 2px 4px;
		border-radius: 4px;
	}

	.form-group.full {
		grid-column: 1 / -1;
	}

	/* Header Actions Styles */
	.page-header {
		margin-bottom: 2rem;
	}
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
	}
	.header-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}
	.btn-secondary {
		background: white;
		border: 1px solid #d1d5db;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		text-decoration: none;
		color: #374151;
		font-weight: 500;
	}
	.btn-primary {
		background-color: #059669;
		background: var(--primary-600, #059669);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
	}
	.btn-primary:hover {
		background-color: #047857;
		background: var(--primary-700, #047857);
	}
	/* Search Box Styles */
	.product-search-box {
		position: relative;
		margin-bottom: 1.5rem;
	}

	.search-input-wrapper {
		position: relative;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 3rem; /* Increased padding */
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
		pointer-events: none;
	}

	.search-results {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		z-index: 50;
		max-height: 300px;
		overflow-y: auto;
		margin-top: 0.5rem;
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem;
		background: none;
		border: none;
		border-bottom: 1px solid #f3f4f6;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
	}

	.result-item:last-child {
		border-bottom: none;
	}

	.result-item:hover {
		background: #f9fafb;
	}

	.result-thumb {
		width: 40px;
		height: 40px;
		border-radius: 0.375rem;
		object-fit: cover;
		background: #f3f4f6;
	}

	.result-info {
		flex: 1;
	}

	.result-name {
		font-weight: 500;
		color: #111827;
		font-size: 0.875rem;
	}

	.result-price {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.add-icon {
		color: #059669;
		font-weight: bold;
		font-size: 1.25rem;
	}

	.no-results {
		padding: 1rem;
		text-align: center;
		color: #6b7280;
		font-size: 0.875rem;
	}
</style>
