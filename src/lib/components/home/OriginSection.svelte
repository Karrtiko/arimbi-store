<script lang="ts">
	import { viewport } from '$lib/actions/viewport';

	let {
		countries,
		title = "Mau 'Jalan-Jalan' ke mana hari ini?",
		subtitle = 'Pilih negara favoritmu dan temukan oleh-oleh khasnya.'
	} = $props<{
		countries: Array<{
			slug: string;
			name: string;
			flag_emoji: string;
		}>;
		title?: string;
		subtitle?: string;
	}>();
</script>

<!-- Update href to filter homepage instead of navigating to /products -->
<section class="origin-section reveal" use:viewport>
	<div class="container">
		<div class="section-header">
			<h2 class="title">{title}</h2>
			<p class="subtitle">{subtitle}</p>
		</div>

		<div class="origin-scroll">
			<a href="/" class="origin-item" data-sveltekit-noscroll>
				<div class="flag-circle">🌍</div>
				<span class="origin-name">Semua</span>
			</a>
			{#each countries as country}
				<!-- Use query param for filtering homepage and disable scroll reset -->
				<a href="/?country={country.slug}" class="origin-item" data-sveltekit-noscroll>
					<div class="flag-circle">
						{country.flag_emoji}
					</div>
					<span class="origin-name">{country.name}</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<style>
	.origin-section {
		padding: var(--space-2xl) 0;
		background: white;
		border-bottom: 1px solid var(--gray-100);
	}

	.container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--space-lg);
	}

	.section-header {
		text-align: center;
		margin-bottom: var(--space-lg);
	}

	.title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--gray-900);
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--gray-500);
		font-size: 1rem;
	}

	.origin-scroll {
		display: flex;
		gap: var(--space-xl);
		overflow-x: auto;
		padding: var(--space-md) var(--space-lg);
		scrollbar-width: none;
		-ms-overflow-style: none;
		justify-content: center;
	}

	.origin-scroll::-webkit-scrollbar {
		display: none;
	}

	.origin-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		transition: transform 0.2s;
		min-width: 80px;
		cursor: pointer;
	}

	.origin-item:hover {
		transform: translateY(-4px);
	}

	.flag-circle {
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		background: white;
		border: 2px solid var(--gray-100);
		padding: 4px; /* Space between border and image */
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		box-shadow: var(--shadow-sm);
		transition: all 0.2s;
	}

	.origin-item:hover .flag-circle {
		border-color: var(--primary-400);
		box-shadow: 0 0 0 4px var(--primary-50);
	}

	.origin-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--gray-700);
	}

	@media (max-width: 768px) {
		.origin-scroll {
			justify-content: flex-start;
		}
	}
</style>
