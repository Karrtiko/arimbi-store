<script lang="ts">
	let {
		currentPage = 1,
		totalPages = 1,
		totalItems = 0,
		perPage = 15,
		baseUrl = '/products'
	} = $props<{
		currentPage?: number;
		totalPages?: number;
		totalItems?: number;
		perPage?: number;
		baseUrl?: string;
	}>();

	// Calculate item range for display
	const itemRange = $derived.by(() => {
		const start = (currentPage - 1) * perPage + 1;
		const end = Math.min(currentPage * perPage, totalItems);
		return { start, end };
	});

	// Generate page numbers to show
	const pageNumbers = $derived.by(() => {
		const pages: (number | string)[] = [];
		const maxVisible = 7; // Show max 7 page buttons

		if (totalPages <= maxVisible) {
			// Show all pages
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push('...');
			}

			// Show pages around current
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push('...');
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	});

	function getPageUrl(page: number): string {
		const url = new URL(baseUrl, window.location.origin);
		const currentParams = new URLSearchParams(window.location.search);
		currentParams.set('page', page.toString());
		return `${url.pathname}?${currentParams.toString()}`;
	}
</script>

<!-- Item Count Info - Always show -->
{#if totalItems > 0}
	<div class="pagination-info">
		Menampilkan <strong>{itemRange.start}-{itemRange.end}</strong> dari
		<strong>{totalItems}</strong> produk
	</div>
{/if}

<!-- Pagination Controls - Only show if multiple pages -->
{#if totalPages > 1}
	<nav class="pagination" aria-label="Pagination">
		<!-- Previous Button -->
		{#if currentPage > 1}
			<a href={getPageUrl(currentPage - 1)} class="pagination-btn"> ← Previous </a>
		{:else}
			<span class="pagination-btn disabled">← Previous</span>
		{/if}

		<!-- Page Numbers -->
		<div class="pagination-numbers">
			{#each pageNumbers as page}
				{#if page === '...'}
					<span class="pagination-ellipsis">...</span>
				{:else if typeof page === 'number'}
					{#if page === currentPage}
						<span class="pagination-number active">{page}</span>
					{:else}
						<a href={getPageUrl(page)} class="pagination-number">{page}</a>
					{/if}
				{/if}
			{/each}
		</div>

		<!-- Next Button -->
		{#if currentPage < totalPages}
			<a href={getPageUrl(currentPage + 1)} class="pagination-btn"> Next → </a>
		{:else}
			<span class="pagination-btn disabled">Next →</span>
		{/if}
	</nav>
{/if}

<style>
	.pagination-info {
		text-align: center;
		color: #6b7280;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	.pagination-info strong {
		color: #374151;
		font-weight: 600;
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 3rem 0;
		flex-wrap: wrap;
	}

	.pagination-btn {
		padding: 0.625rem 1rem;
		border: 1px solid #d1d5db;
		background: white;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		color: #374151;
		text-decoration: none;
		transition: all 0.2s;
	}

	.pagination-btn:hover:not(.disabled) {
		background: var(--primary-50);
		border-color: var(--primary-600);
		color: var(--primary-600);
	}

	.pagination-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pagination-numbers {
		display: flex;
		gap: 0.25rem;
	}

	.pagination-number {
		min-width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #d1d5db;
		background: white;
		border-radius: 0.5rem;
		font-weight: 500;
		font-size: 0.875rem;
		color: #374151;
		text-decoration: none;
		transition: all 0.2s;
	}

	.pagination-number:hover:not(.active) {
		background: var(--primary-50);
		border-color: var(--primary-600);
		color: var(--primary-600);
	}

	.pagination-number.active {
		background: var(--primary-600);
		border-color: var(--primary-600);
		color: white;
		font-weight: 700;
	}

	.pagination-ellipsis {
		min-width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		font-weight: 600;
	}

	@media (max-width: 640px) {
		.pagination {
			gap: 0.25rem;
		}

		.pagination-btn {
			padding: 0.5rem 0.75rem;
			font-size: 0.8125rem;
		}

		.pagination-number {
			min-width: 2.25rem;
			height: 2.25rem;
			font-size: 0.8125rem;
		}
	}
</style>
