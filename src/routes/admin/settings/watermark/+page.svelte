<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props<{ data: any; form: any }>();
	let settings = $derived(data.settings);

	// Local reactive state for live preview
	let opacity = $state(settings.watermark_opacity || 0.5);
	let scale = $state(settings.watermark_scale || 0.2);
	let position = $state(settings.watermark_position || 'bottom-right');
	let watermarkPreview = $state(settings.watermark_path || null);

	// Track uploaded file for instant preview
	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			watermarkPreview = URL.createObjectURL(target.files[0]);
		}
	}
</script>

<div class="page-header">
	<h2>Watermark Settings</h2>
</div>

<div class="grid-layout">
	<!-- Form -->
	<div class="card">
		<form method="POST" action="?/save" enctype="multipart/form-data" use:enhance>
			<input type="hidden" name="current_watermark_path" value={settings.watermark_path} />

			<div class="field">
				<label for="watermark_file">Upload Watermark (PNG recommended)</label>
				<input
					type="file"
					id="watermark_file"
					name="watermark_file"
					accept="image/*"
					onchange={handleFileChange}
				/>
			</div>

			<div class="field">
				<label for="opacity">Opacity ({opacity.toFixed(1)})</label>
				<input
					type="range"
					id="opacity"
					name="opacity"
					min="0.1"
					max="1"
					step="0.1"
					bind:value={opacity}
				/>
			</div>

			<div class="field">
				<label for="scale">Size Scale ({Math.round(scale * 100)}%)</label>
				<input
					type="range"
					id="scale"
					name="scale"
					min="0.1"
					max="0.8"
					step="0.05"
					bind:value={scale}
				/>
			</div>

			<div class="field">
				<label for="position">Position</label>
				<select id="position" name="position" bind:value={position}>
					<option value="center">Center</option>
					<option value="top-left">Top Left</option>
					<option value="top-right">Top Right</option>
					<option value="bottom-left">Bottom Left</option>
					<option value="bottom-right">Bottom Right</option>
				</select>
			</div>

			<button type="submit" class="btn-primary">Save Settings</button>

			{#if form?.success}
				<p class="success-msg">Settings saved successfully!</p>
			{/if}
		</form>
	</div>

	<!-- Live Preview -->
	<div class="card preview-card">
		<h3>Preview (Live) ✨</h3>
		<p class="hint-top">Preview langsung update pas geser slider!</p>
		<div class="preview-container">
			{#if data.sampleImageUrl}
				<!-- Base product image -->
				<img
					src={data.sampleImageUrl}
					alt="Product Preview"
					class="preview-base-image"
					onerror={(e) => {
						const target = e.currentTarget as HTMLImageElement;
						target.src = 'https://placehold.co/600x400?text=Product+Image';
					}}
				/>

				<!-- Live watermark overlay with CSS positioning -->
				{#if watermarkPreview}
					<img
						src={watermarkPreview}
						alt="Watermark Preview"
						class="watermark-overlay-live"
						style="
							opacity: {opacity};
							width: {scale * 100}%;
							{position.includes('top') ? 'top: 1rem;' : ''}
							{position.includes('bottom') ? 'bottom: 1rem;' : ''}
							{position.includes('left') ? 'left: 1rem;' : ''}
							{position.includes('right') ? 'right: 1rem;' : ''}
							{position === 'center' ? 'top: 50%; left: 50%; transform: translate(-50%, -50%);' : ''}
						"
					/>
				{/if}
			{:else}
				<div class="no-watermark-msg">
					<p>📦 Upload gambar produk dulu</p>
				</div>
			{/if}
		</div>
		<p class="hint">Ini preview CSS real-time. Setelah save, hasil server akan sama persis!</p>
	</div>
</div>

<style>
	.grid-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	@media (max-width: 768px) {
		.grid-layout {
			grid-template-columns: 1fr;
		}
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.field {
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 500;
		font-size: 0.9rem;
	}

	input[type='range'] {
		width: 100%;
	}

	select,
	input[type='file'] {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
	}

	.btn-primary {
		background: var(--primary-600);
		color: white;
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
	}

	.success-msg {
		color: green;
		font-weight: 600;
		margin-top: 1rem;
	}

	/* Preview Styles */
	.preview-container {
		position: relative;
		width: 100%;
		aspect-ratio: 4/3;
		background: #f3f4f6;
		overflow: hidden;
		border-radius: 0.5rem;
		border: 2px solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-base-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.watermark-overlay-live {
		position: absolute;
		pointer-events: none;
		transition: all 0.15s ease; /* Smooth transitions when slider moves */
	}

	.no-watermark-msg {
		text-align: center;
		color: #9ca3af;
		font-size: 1.2rem;
	}

	.hint-top {
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 1rem;
		font-style: italic;
	}

	.hint {
		font-size: 0.8rem;
		color: #666;
		margin-top: 0.5rem;
		font-style: italic;
	}
</style>
