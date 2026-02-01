<script lang="ts">
	import { page } from '$app/stores';

	// Improved active helper that supports sub-routes
	// e.g., /admin/products/new should satisfy /admin/products
	const isActive = (path: string) => {
		if (path === '/admin') {
			return $page.url.pathname === '/admin';
		}
		return $page.url.pathname.startsWith(path);
	};

	// Sidebar State
	let isSidebarOpen = false;

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	// Close sidebar on navigation (mobile)
	$: if ($page.url.pathname) {
		isSidebarOpen = false;
	}

	// Helper to get readable title from path
	const getPageTitle = (path: string) => {
		const segment = path.split('/').pop();
		if (!segment || segment === 'admin') return 'Dashboard';
		return segment.charAt(0).toUpperCase() + segment.slice(1);
	};
</script>

<div class="admin-layout">
	<!-- Mobile Overlay -->
	{#if isSidebarOpen}
		<div
			class="overlay"
			onclick={() => (isSidebarOpen = false)}
			role="button"
			tabindex="0"
			onkeydown={() => {}}
		></div>
	{/if}

	<aside class="sidebar" class:open={isSidebarOpen}>
		<div class="brand">
			<h1>Arimbi<span class="highlight">Admin</span></h1>
			<button class="close-sidebar" onclick={() => (isSidebarOpen = false)}>&times;</button>
		</div>

		<nav class="nav-menu">
			<a href="/admin" class="nav-item" class:active={isActive('/admin')}>
				<span class="icon">📊</span> Dashboard
			</a>
			<a href="/admin/products" class="nav-item" class:active={isActive('/admin/products')}>
				<span class="icon">📦</span> Products
			</a>
			<a href="/admin/transactions" class="nav-item" class:active={isActive('/admin/transactions')}>
				<span class="icon">📝</span> Transaksi
			</a>
			<a href="/admin/bundles" class="nav-item" class:active={isActive('/admin/bundles')}>
				<span class="icon">🛍️</span> Paket / Bundles
			</a>
			<a href="/admin/pages" class="nav-item" class:active={isActive('/admin/pages')}>
				<span class="icon">📄</span> Halaman (CMS)
			</a>
			<a
				href="/admin/settings/watermark"
				class="nav-item"
				class:active={isActive('/admin/settings/watermark')}
			>
				<span class="icon">💧</span> Watermark
			</a>
			<a
				href="/admin/cms/countries"
				class="nav-item"
				class:active={isActive('/admin/cms/countries')}
			>
				<span class="icon">🌍</span> Countries
			</a>
			<a
				href="/admin/settings/general"
				class="nav-item"
				class:active={isActive('/admin/settings/general')}
			>
				<span class="icon">⚙️</span> Pengaturan Umum
			</a>
			<div class="divider"></div>
			<a href="/admin/users" class="nav-item" class:active={isActive('/admin/users')}>
				<span class="icon">👥</span> Users
			</a>
			<div class="divider"></div>
			<a href="/" class="nav-item">
				<span class="icon">🏠</span> Back to Store
			</a>
			<form action="/logout" method="POST" style="margin-top: auto;">
				<button type="submit" class="nav-item logout-btn">
					<span class="icon">🚪</span> Logout
				</button>
			</form>
		</nav>
	</aside>

	<main class="main-content">
		<header class="topbar">
			<div class="left-head">
				<button class="hamburger" onclick={toggleSidebar}>☰</button>
				<div class="breadcrumbs">
					Admin Panel / <span class="current">{getPageTitle($page.url.pathname)}</span>
				</div>
			</div>
			<div class="user-profile">
				<span>Administrator</span>
				<div class="avatar">A</div>
			</div>
		</header>

		<div class="page-content">
			<slot />
		</div>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: var(--font-body);
		background-color: #f3f4f6;
	}

	.admin-layout {
		display: flex;
		min-height: 100vh;
	}

	.sidebar {
		width: 260px;
		background: white;
		border-right: 1px solid #e5e7eb;
		display: flex;
		flex-direction: column;
		position: fixed;
		height: 100vh;
		z-index: 50;
		transition: transform 0.3s ease;
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 40;
	}

	.brand {
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.close-sidebar {
		display: none; /* Desktop hidden */
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
	}

	.brand h1 {
		font-size: 1.25rem;
		font-weight: 800;
		color: #111827;
		margin: 0;
	}

	.brand .highlight {
		color: var(--primary-600);
	}

	.nav-menu {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		text-decoration: none;
		color: #4b5563;
		font-weight: 500;
		transition: all 0.2s;
		border: none;
		background: none;
		width: 100%;
		cursor: pointer;
		font-family: inherit;
		font-size: 1rem;
	}

	.logout-btn {
		color: #ef4444;
	}

	.logout-btn:hover {
		background: #fee2e2;
		color: #dc2626;
	}

	.nav-item:hover,
	.nav-item.active {
		background: #f9fafb;
		color: var(--primary-600);
	}

	.nav-item.active {
		background: var(--primary-50);
		font-weight: 600;
	}

	.icon {
		font-size: 1.25rem;
	}

	.divider {
		height: 1px;
		background: #e5e7eb;
		margin: 0.5rem 0;
	}

	.main-content {
		flex: 1;
		margin-left: 260px;
		display: flex;
		flex-direction: column;
		width: 100%; /* Ensure full width */
		transition: margin-left 0.3s ease;
	}

	/* Topbar */
	.left-head {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.hamburger {
		display: none;
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #374151;
		padding: 0;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
		}
		.sidebar.open {
			transform: translateX(0);
		}

		.main-content {
			margin-left: 0;
		}

		.hamburger,
		.close-sidebar {
			display: block;
		}

		.breadcrumbs {
			font-size: 0.8rem;
		}
	}

	.topbar {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.breadcrumbs {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.current {
		font-weight: 600;
		color: #111827;
		text-transform: capitalize;
	}

	.user-profile {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.avatar {
		width: 32px;
		height: 32px;
		background: var(--primary-600);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.page-content {
		padding: 2rem;
		flex: 1;
		overflow-y: auto;
	}
</style>
