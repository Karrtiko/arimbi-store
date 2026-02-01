<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';

	let { data, form } = $props();
	let { page } = data;
	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return async ({ update }: { update: any }) => {
			await update();
			isSubmitting = false;
		};
	}
</script>

<svelte:head>
	<title>Edit {page.title} - Admin Arimbi Store</title>
</svelte:head>

<div class="editor-container">
	<header class="header">
		<div class="breadcrumb">
			<a href="/admin/pages">Halaman</a> / <span>Edit {page.title}</span>
		</div>
		<h1>Edit {page.title}</h1>
	</header>

	<form method="POST" use:enhance={handleSubmit} class="editor-form">
		<!-- Dynamic Fields based on Slug -->
		{#if page.slug === 'home'}
			<div class="section">
				<h3>Hero Section</h3>
				<div class="form-group">
					<label for="hero_title">Judul Utama (HTML allowed)</label>
					<textarea id="hero_title" name="hero_title" rows="2"
						>{page.content.hero_title || ''}</textarea
					>
					<small>Gunakan &lt;br&gt; untuk baris baru.</small>
				</div>
				<div class="form-group">
					<label for="hero_subtitle">Sub Judul</label>
					<textarea id="hero_subtitle" name="hero_subtitle" rows="3"
						>{page.content.hero_subtitle || ''}</textarea
					>
				</div>
			</div>

			<div class="section">
				<h3>Bagian Origin (Negara)</h3>
				<div class="form-group">
					<label for="origin_title">Judul</label>
					<input
						type="text"
						id="origin_title"
						name="origin_title"
						value={page.content.origin_title || ''}
					/>
				</div>
				<div class="form-group">
					<label for="origin_subtitle">Sub Judul</label>
					<input
						type="text"
						id="origin_subtitle"
						name="origin_subtitle"
						value={page.content.origin_subtitle || ''}
					/>
				</div>
			</div>

			<div class="section">
				<h3>Bagian Best Seller</h3>
				<div class="form-group">
					<label for="best_seller_title">Judul</label>
					<input
						type="text"
						id="best_seller_title"
						name="best_seller_title"
						value={page.content.best_seller_title || ''}
					/>
				</div>
				<div class="form-group">
					<label for="best_seller_subtitle">Sub Judul</label>
					<input
						type="text"
						id="best_seller_subtitle"
						name="best_seller_subtitle"
						value={page.content.best_seller_subtitle || ''}
					/>
				</div>
			</div>

			<div class="section">
				<h3>Bagian Low Stock</h3>
				<div class="form-group">
					<label for="low_stock_title">Judul</label>
					<input
						type="text"
						id="low_stock_title"
						name="low_stock_title"
						value={page.content.low_stock_title || ''}
					/>
				</div>
				<div class="form-group">
					<label for="low_stock_subtitle">Sub Judul</label>
					<input
						type="text"
						id="low_stock_subtitle"
						name="low_stock_subtitle"
						value={page.content.low_stock_subtitle || ''}
					/>
				</div>
			</div>
		{:else if page.slug === 'about'}
			<div class="section">
				<h3>Hero Section</h3>
				<div class="form-group">
					<label for="hero_tag">Tagline (Atas Judul)</label>
					<input type="text" id="hero_tag" name="hero_tag" value={page.content.hero_tag || ''} />
				</div>
				<div class="form-group">
					<label for="hero_title">Judul Utama (HTML)</label>
					<textarea id="hero_title" name="hero_title" rows="2"
						>{page.content.hero_title || ''}</textarea
					>
				</div>
				<div class="form-group">
					<label for="hero_text">Deskripsi</label>
					<textarea id="hero_text" name="hero_text" rows="3"
						>{page.content.hero_text || ''}</textarea
					>
				</div>
				<div class="form-group">
					<label for="hero_image">URL Gambar Hero</label>
					<input
						type="text"
						id="hero_image"
						name="hero_image"
						value={page.content.hero_image || ''}
						placeholder="https://..."
					/>
				</div>
			</div>

			<div class="section">
				<h3>Cerita Kami</h3>
				<div class="form-group">
					<label for="story_title">Judul Cerita</label>
					<input
						type="text"
						id="story_title"
						name="story_title"
						value={page.content.story_title || ''}
					/>
				</div>
				<div class="form-group">
					<label for="story_text_1">Paragraf 1 (HTML allowed)</label>
					<textarea id="story_text_1" name="story_text_1" rows="4"
						>{page.content.story_text_1 || ''}</textarea
					>
				</div>
				<div class="form-group">
					<label for="story_text_2">Paragraf 2 (HTML allowed)</label>
					<textarea id="story_text_2" name="story_text_2" rows="4"
						>{page.content.story_text_2 || ''}</textarea
					>
				</div>
			</div>

			<div class="section">
				<h3>Statistik</h3>
				<div class="row">
					<div class="col">
						<label for="stats_1_num">Angka 1</label>
						<input
							type="text"
							id="stats_1_num"
							name="stats_1_num"
							value={page.content.stats_1_num || ''}
						/>
						<label for="stats_1_label">Label 1</label>
						<input
							type="text"
							id="stats_1_label"
							name="stats_1_label"
							value={page.content.stats_1_label || ''}
						/>
					</div>
					<div class="col">
						<label for="stats_2_num">Angka 2</label>
						<input
							type="text"
							id="stats_2_num"
							name="stats_2_num"
							value={page.content.stats_2_num || ''}
						/>
						<label for="stats_2_label">Label 2</label>
						<input
							type="text"
							id="stats_2_label"
							name="stats_2_label"
							value={page.content.stats_2_label || ''}
						/>
					</div>
				</div>
			</div>

			<div class="section">
				<h3>Janji Kami</h3>
				<div class="form-group">
					<label for="promise_title">Judul Seksi</label>
					<input
						type="text"
						id="promise_title"
						name="promise_title"
						value={page.content.promise_title || ''}
					/>
				</div>

				<div class="card-grid">
					{#each [1, 2, 3, 4] as i}
						<div class="card-item">
							<h4>Janji #{i}</h4>
							<div class="form-group">
								<label for="promise_{i}_title">Judul</label>
								<input
									type="text"
									id="promise_{i}_title"
									name="promise_{i}_title"
									value={page.content[`promise_${i}_title`] || ''}
								/>
							</div>
							<div class="form-group">
								<label for="promise_{i}_desc">Deskripsi</label>
								<textarea id="promise_{i}_desc" name="promise_{i}_desc" rows="2"
									>{page.content[`promise_${i}_desc`] || ''}</textarea
								>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="sticky-footer">
			<a href="/admin/pages" class="btn-cancel">Batal</a>
			<button type="submit" class="btn-save" disabled={isSubmitting}>
				{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
			</button>
		</div>
	</form>

	{#if form?.success}
		<div class="toast" transition:fade>Berhasil disimpan!</div>
	{/if}
</div>

<style>
	.editor-container {
		max-width: 800px;
		margin: 0 auto;
		padding-bottom: 80px;
	}

	.header {
		margin-bottom: 2rem;
	}

	.breadcrumb {
		font-size: 0.875rem;
		color: var(--gray-500);
		margin-bottom: 0.5rem;
	}

	.breadcrumb a {
		color: var(--primary-600);
		text-decoration: none;
	}

	h1 {
		font-size: 1.875rem;
		font-weight: 800;
		color: var(--gray-900);
	}

	.section {
		background: white;
		padding: 1.5rem;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
		border: 1px solid var(--gray-200);
	}

	.section h3 {
		margin-top: 0;
		margin-bottom: 1.25rem;
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--gray-800);
		border-bottom: 1px solid var(--gray-100);
		padding-bottom: 0.75rem;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--gray-700);
		margin-bottom: 0.5rem;
	}

	input[type='text'],
	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--gray-300);
		border-radius: 0.5rem;
		font-family: inherit;
		font-size: 0.95rem;
		color: var(--gray-900);
		background: #fff;
	}

	input:focus,
	textarea:focus {
		border-color: var(--primary-500);
		outline: none;
		box-shadow: 0 0 0 3px var(--primary-100);
	}

	textarea {
		resize: vertical;
		line-height: 1.5;
	}

	small {
		display: block;
		margin-top: 0.25rem;
		color: var(--gray-500);
		font-size: 0.8rem;
	}

	.row {
		display: flex;
		gap: 1.5rem;
	}
	.col {
		flex: 1;
	}

	.card-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr 1fr;
	}

	.card-item {
		background: var(--gray-50);
		padding: 1rem;
		border-radius: 0.5rem;
		border: 1px solid var(--gray-200);
	}

	.card-item h4 {
		margin: 0 0 0.75rem 0;
		font-size: 0.9rem;
		color: var(--gray-600);
		text-transform: uppercase;
		font-weight: 700;
	}

	.sticky-footer {
		position: fixed;
		bottom: 0;
		left: 260px; /* Sidebar width */
		right: 0;
		background: white;
		padding: 1rem 2rem;
		border-top: 1px solid var(--gray-200);
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;
		z-index: 40;
	}

	@media (max-width: 768px) {
		.sticky-footer {
			left: 0;
		}
		.card-grid {
			grid-template-columns: 1fr;
		}
	}

	.btn-save {
		background: var(--primary-600);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-save:hover {
		background: var(--primary-700);
	}
	.btn-save:disabled {
		background: var(--gray-400);
		cursor: not-allowed;
	}

	.btn-cancel {
		text-decoration: none;
		color: var(--gray-600);
		font-weight: 600;
	}

	.toast {
		position: fixed;
		top: 2rem;
		right: 2rem;
		background: var(--green-600); /* Use specific color normally, e.g. #059669 */
		background-color: #059669;
		color: white;
		padding: 1rem 2rem;
		border-radius: 0.5rem;
		font-weight: 600;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}
</style>
