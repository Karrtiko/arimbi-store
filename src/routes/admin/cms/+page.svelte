<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	let { data } = $props<{ data: any }>();
</script>

<div class="page-header">
	<h2>Content Management (CMS)</h2>
</div>

<div class="cms-grid">
	<!-- Hero Section Editor -->
	<div class="card" in:fade>
		<div class="card-header">
			<h3>🏠 Home Hero Section</h3>
		</div>
		<form method="POST" action="?/updateHero" use:enhance>
			<div class="form-body">
				<div class="field">
					<label>Title</label>
					<input type="text" name="title" value={data.cms.hero.title} />
				</div>
				<div class="field">
					<label>Subtitle</label>
					<textarea name="subtitle" rows="3">{data.cms.hero.subtitle}</textarea>
				</div>
				<div class="field">
					<label>Button Text</label>
					<input type="text" name="button_text" value={data.cms.hero.button_text} />
				</div>
				<div class="actions">
					<button type="submit" class="btn-primary">Update Hero</button>
				</div>
			</div>
		</form>
	</div>

	<!-- Country Manager -->
	<div class="card" in:fade={{ delay: 100 }}>
		<div class="card-header">
			<h3>🌏 Active Countries</h3>
		</div>
		<div class="country-list">
			{#each data.countries as country}
				<div class="country-item">
					<div class="country-info">
						<span class="flag">{country.flag_emoji}</span>
						<span class="name">{country.name}</span>
					</div>
					<form method="POST" action="?/toggleCountry" use:enhance>
						<input type="hidden" name="id" value={country.id} />
						<label class="switch">
							<input
								type="checkbox"
								name="is_active"
								checked={country.is_active}
								onchange={(e) => e.target.form.requestSubmit()}
							/>
							<span class="slider round"></span>
						</label>
					</form>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.page-header {
		margin-bottom: 2rem;
	}

	.cms-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
	}

	.card {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}
	.card-header {
		background: #f9fafb;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		font-weight: 600;
		color: #374151;
	}

	.form-body {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
	}
	input,
	textarea {
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		width: 100%;
		box-sizing: border-box;
	}

	.country-list {
		padding: 1rem;
	}
	.country-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border-bottom: 1px solid #f3f4f6;
	}
	.country-item:last-child {
		border-bottom: none;
	}
	.country-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-weight: 600;
	}
	.flag {
		font-size: 1.5rem;
	}

	.btn-primary {
		background: var(--primary-600);
		color: white;
		padding: 0.75rem;
		border: none;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		margin-top: 1rem;
	}

	/* Toggle Switch */
	.switch {
		position: relative;
		display: inline-block;
		width: 40px;
		height: 24px;
	}
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		transition: 0.4s;
		border-radius: 24px;
	}
	.slider:before {
		position: absolute;
		content: '';
		height: 16px;
		width: 16px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: 0.4s;
		border-radius: 50%;
	}
	input:checked + .slider {
		background-color: var(--primary-600);
	}
	input:checked + .slider:before {
		transform: translateX(16px);
	}
</style>
