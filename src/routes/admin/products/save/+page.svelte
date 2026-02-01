<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props<{ data: any }>();

	let { product, categories, countries } = data;
	let isEdit = !!product.id;

	// Image Management
	let currentImages = product.images || (product.image_url ? [product.image_url] : []);
	let selectedThumbnail = product.image_url || (currentImages.length > 0 ? currentImages[0] : '');

	let newPreviews: { file: File; url: string }[] = [];

	// File Management with DataTransfer for cumulative uploads
	let dt = new DataTransfer();

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			Array.from(target.files).forEach((file) => {
				// Add to DataTransfer
				dt.items.add(file);
				// Add to preview list
				newPreviews = [...newPreviews, { file, url: URL.createObjectURL(file) }];
			});

			// Sync input with DataTransfer
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
		// Remove from DataTransfer
		dt.items.remove(index);

		// Sync input
		const input = document.getElementById('new_images') as HTMLInputElement;
		if (input) {
			input.files = dt.files;
		}

		// Update previews
		newPreviews = newPreviews.filter((_, i) => i !== index);
	}

	// Attributes
	// Ensure product.attributes is an object before mapping
	const rawAttrs = product.attributes || {};
	let attributeList = $state(
		Object.entries(rawAttrs).map(([key, value]) => ({
			key,
			value: String(value)
		}))
	);

	function addAttribute() {
		attributeList = [...attributeList, { key: '', value: '' }];
	}

	function removeAttribute(index: number) {
		attributeList = attributeList.filter((_, i) => i !== index);
	}
</script>

<div class="page-header">
	<h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
	<div class="header-actions">
		<a href="/admin/products" class="btn-secondary">Cancel</a>
		<button type="submit" form="product-form" class="btn-primary">💾 Save Product</button>
	</div>
</div>

<div class="card form-container">
	<form id="product-form" method="POST" action="?/save" enctype="multipart/form-data" use:enhance>
		{#if isEdit}
			<input type="hidden" name="id" value={product.id} />
		{/if}
		<div class="form-grid">
			<!-- Basic Info -->
			<div class="field full">
				<label for="name">Product Name</label>
				<input type="text" id="name" name="name" value={product.name || ''} required />
			</div>

			<div class="field">
				<label for="category_id">Category</label>
				<select id="category_id" name="category_id" required>
					{#each categories as cat}
						<option value={cat.id} selected={product.category_id === cat.id}>{cat.name}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="country_id">Country</label>
				<select id="country_id" name="country_id" required>
					{#each countries as country}
						<option value={country.id} selected={product.country_id === country.id}>
							{country.flag_emoji}
							{country.name}
						</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="price">Price (IDR)</label>
				<input type="number" id="price" name="price" value={product.price || ''} required />
			</div>

			<div class="field">
				<label for="stock">Stock</label>
				<input type="number" id="stock" name="stock" value={product.stock ?? 100} required />
			</div>

			<div class="field checkbox-field">
				<label class="checkbox-label">
					<input
						type="checkbox"
						name="is_active"
						value="1"
						checked={product.is_active !== 0 && product.is_active !== false}
					/>
					<span>Active (Show in catalog)</span>
				</label>
				<small>Uncheck to hide this product from catalog and homepage</small>
			</div>

			<!-- Image Gallery Manager -->
			<div class="field full">
				<label>Product Images (Gallery)</label>

				<!-- Hidden inputs -->
				<input type="hidden" name="existing_images" value={JSON.stringify(currentImages)} />
				<input type="hidden" name="selected_thumbnail" value={selectedThumbnail} />

				<!-- File Upload -->
				<div class="upload-area">
					<input
						type="file"
						name="new_images"
						id="new_images"
						accept="image/*,video/*"
						multiple
						onchange={handleFileSelect}
					/>
					<label for="new_images" class="upload-btn">
						<div class="upload-icon">📸🎥</div>
						<div class="upload-text">Upload Images & Videos</div>
						<div class="upload-hint">(Multi-select supported)</div>
					</label>
				</div>

				<!-- Previews -->
				{#if currentImages.length > 0 || newPreviews.length > 0}
					<div class="gallery-grid">
						<!-- Existing Images -->
						{#each currentImages as img, i}
							<div class="img-card" class:selected={selectedThumbnail === img}>
								{#if img.match(/\.(mp4|webm|ogg)$/i)}
									<video src={img} controls preload="metadata">
										<track kind="captions" />
									</video>
								{:else}
									<img src={img} alt="Product" />
								{/if}
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
								{#if preview.file.type.startsWith('video/')}
									<video src={preview.url} controls preload="metadata">
										<track kind="captions" />
									</video>
								{:else}
									<img src={preview.url} alt="New Upload" />
								{/if}
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

			<div class="field full">
				<label for="description">Description</label>
				<textarea id="description" name="description" rows="4">{product.description || ''}</textarea
				>
			</div>

			<!-- Dynamic Attributes -->
			<div class="field full section-label">
				<h3>Spesifikasi / Atribut Produk</h3>
				<span class="text-sm text-gray-500"
					>Tambahkan detail seperti Berat, Dimensi, Rasa, dll.</span
				>
			</div>

			<div class="field full attribute-container">
				<div class="attr-header">
					<div class="col-label">Nama Atribut</div>
					<div class="col-label">Nilai</div>
					<div class="col-action"></div>
				</div>

				{#each attributeList as attr, i}
					<div class="attr-row">
						<input
							type="text"
							name="attr_keys"
							placeholder="Cth: Berat"
							bind:value={attr.key}
							class="attr-input"
							required
						/>
						<input
							type="text"
							name="attr_values"
							placeholder="Cth: 200g"
							bind:value={attr.value}
							class="attr-input"
							required
						/>
						<button
							type="button"
							class="btn-icon delete"
							title="Hapus"
							onclick={() => removeAttribute(i)}
						>
							🗑️
						</button>
					</div>
				{/each}

				{#if attributeList.length === 0}
					<div class="empty-state">
						<p>Belum ada atribut yang ditambahkan.</p>
					</div>
				{/if}

				<button type="button" class="btn-secondary btn-add-attr" onclick={addAttribute}>
					+ Tambah Atribut Baru
				</button>
			</div>

			<div class="field full mt-4">
				<button type="submit" class="btn-primary w-full">Save Product</button>
			</div>
		</div>
	</form>
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		max-width: 800px;
		margin: 0 auto;
	}

	.btn-secondary {
		background: white;
		border: 1px solid #d1d5db;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		text-decoration: none;
		color: #374151;
		font-weight: 500;
	}
	.btn-primary {
		background-color: #059669; /* Fallback green */
		background: var(--primary-600, #059669);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		border: none;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}
	.btn-primary:hover {
		background-color: #047857;
		background: var(--primary-700, #047857);
	}

	.btn-sm {
		background: #e5e7eb;
		border: none;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.w-full {
		width: 100%;
	}
	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.field.full {
		grid-column: span 2;
	}

	.checkbox-field {
		grid-column: 1 / -1;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		font-weight: 500;
	}

	.checkbox-label input[type='checkbox'] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
	}

	.checkbox-field small {
		display: block;
		margin-top: 0.5rem;
		margin-left: 2rem;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.section-label {
		display: flex;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}
	input,
	select,
	textarea {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		width: 100%;
		box-sizing: border-box;
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
		background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
		border: 3px dashed #d1d5db;
		border-radius: 1rem;
		cursor: pointer;
		font-weight: 600;
		text-align: center;
		transition: all 0.3s ease;
		min-height: 150px;
	}
	.upload-btn:hover {
		border-color: var(--primary-600);
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	.upload-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}
	.upload-text {
		font-size: 1.125rem;
		color: #1f2937;
		font-weight: 600;
	}
	.upload-hint {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 400;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}
	.img-card {
		position: relative;
		border-radius: 0.75rem;
		overflow: hidden;
		aspect-ratio: 1;
		border: 3px solid transparent;
		background: #f3f4f6;
		transition: all 0.2s ease;
	}
	.img-card.selected {
		border-color: var(--primary-600);
		box-shadow: 0 0 0 3px var(--primary-100);
	}
	.img-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	.img-card img,
	.img-card video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.actions {
		position: absolute;
		top: 4px;
		right: 4px;
		display: flex;
		gap: 4px;
		opacity: 0;
		transition: opacity 0.2s;
	}
	.img-card:hover .actions {
		opacity: 1;
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
	.btn-star:hover {
		background: #eab308;
	}
	.btn-remove:hover {
		background: #ef4444;
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

	/* Attribute Styles */
	.attribute-container {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.attr-header {
		display: grid;
		grid-template-columns: 1fr 1fr 40px;
		gap: 1rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #4b5563;
		font-size: 0.875rem;
		padding: 0 0.5rem;
	}

	.attr-row {
		display: grid;
		grid-template-columns: 1fr 1fr 40px;
		gap: 1rem;
		margin-bottom: 0.75rem;
		align-items: center;
	}

	.attr-input {
		padding: 0.625rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		width: 100%;
		box-sizing: border-box;
		background: white;
	}

	.btn-add-attr {
		width: 100%;
		margin-top: 0.5rem;
		border-style: dashed;
		justify-content: center;
		color: #4b5563;
	}

	.btn-add-attr:hover {
		border-color: #9ca3af;
		background: #f3f4f6;
		color: #111827;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #9ca3af;
		font-style: italic;
		background: white;
		border-radius: 0.375rem;
		border: 1px dashed #e5e7eb;
		margin-bottom: 1rem;
	}

	.btn-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		background: white;
		cursor: pointer;
		color: #ef4444;
		transition: all 0.2s;
	}
	.btn-icon:hover {
		background: #fee2e2;
		border-color: #fca5a5;
		color: #991b1b;
	}
</style>
