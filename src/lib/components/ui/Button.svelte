<script lang="ts">
	let {
		href = undefined,
		variant = 'primary',
		size = 'md',
		children,
		onclick,
		...props
	} = $props();

	let baseClass = 'btn';
	let variantClass = $derived(`btn-${variant}`);
	let sizeClass = $derived(`btn-${size}`);
</script>

{#if href}
	<a {href} class="{baseClass} {variantClass} {sizeClass}" {...props}>
		{@render children?.()}
	</a>
{:else}
	<button class="{baseClass} {variantClass} {sizeClass}" {onclick} {...props}>
		{@render children?.()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		text-decoration: none;
		font-family: var(--font-body);
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.btn:active {
		transform: translateY(0);
	}

	.btn-primary {
		background: linear-gradient(135deg, var(--primary-600), var(--primary-500));
		color: white;
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, var(--primary-700), var(--primary-600));
	}

	.btn-secondary {
		background: linear-gradient(135deg, var(--accent-600), var(--accent-500));
		color: white;
	}

	.btn-secondary:hover {
		background: linear-gradient(135deg, var(--accent-700), var(--accent-600));
	}

	.btn-outline {
		background: transparent;
		border: 2px solid var(--primary-600);
		color: var(--primary-600);
	}

	.btn-outline:hover {
		background: var(--primary-50);
	}

	.btn-ghost {
		background: transparent;
		color: var(--gray-700);
	}

	.btn-ghost:hover {
		background: var(--gray-100);
	}

	.btn-sm {
		padding: var(--space-xs) var(--space-md);
		font-size: 0.875rem;
	}

	.btn-md {
		padding: var(--space-sm) var(--space-lg);
		font-size: 1rem;
	}

	.btn-lg {
		padding: var(--space-md) var(--space-xl);
		font-size: 1.125rem;
	}

	.btn-xl {
		padding: 1rem 2rem;
		font-size: 1.25rem;
		border-radius: var(--radius-xl);
	}
</style>
