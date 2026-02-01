<script lang="ts">
	import Button from './ui/Button.svelte';
</script>

<style>
	nav {
		position: sticky;
		top: 0;
		z-index: 50;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--gray-200);
	}

	.nav-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: var(--space-sm) var(--space-lg);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 800;
		font-family: var(--font-heading);
		color: var(--primary-700);
		text-decoration: none;
        letter-spacing: -0.02em;
        display: flex;
        align-items: center;
        gap: 0.5rem;
	}
    
    .logo span {
        color: var(--gray-900);
    }

	.nav-links {
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.nav-link {
		color: var(--gray-600);
		text-decoration: none;
		font-weight: 500;
        font-size: 0.95rem;
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: var(--primary-700);
	}
    
    @media (max-width: 768px) {
        .nav-links {
            display: none;
        }
    }
</style>

<nav>
	<div class="nav-container">
		<a href="/" class="logo">
            <!-- Simple SVG Logo Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span>ArimbiStore</span>.ID
        </a>
		<div class="nav-links">
			<a href="/" class="nav-link">Home</a>
			<a href="/products" class="nav-link">Shop</a>
			<a href="/about" class="nav-link">About</a>
			<Button href="/products" variant="primary" size="sm">Shop Now</Button>
		</div>
	</div>
</nav>
