<script lang="ts">
	import { page } from '$app/stores';
</script>

<footer>
	<div class="footer-container">
		<div class="footer-brand">
			<h3>ArimbiStore.ID</h3>
			<p>
				Destinasi utama untuk menemukan snack autentik dan skincare premium dari berbagai belahan
				dunia. Curated with love.
			</p>
		</div>
		<div>
			<h4 class="footer-heading">Menu</h4>
			<div class="footer-links">
				<a href="/" class="footer-link">Home</a>
				<a href="/products" class="footer-link">All Products</a>
				<a href="/products?category=snack" class="footer-link">Snacks</a>
				<a href="/products?category=skincare" class="footer-link">Skincare</a>
				<a href="/about" class="footer-link">About Us</a>
			</div>
		</div>
		<div>
			<h4 class="footer-heading">Contact</h4>
			<div class="contact-info">
				<p>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path
							d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
						/></svg
					>
					{$page.data.settings?.admin_whatsapp || '+62 812-3456-7890'}
				</p>
				<p>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect width="20" height="16" x="2" y="4" rx="2" /><path
							d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
						/></svg
					>
					hello@arimbistore.com
				</p>
			</div>
		</div>
	</div>
	<div class="copyright">© 2026 ArimbiStore.ID. All rights reserved.</div>
</footer>

<style>
	footer {
		background: white;
		border-top: 1px solid var(--gray-200);
		color: var(--gray-600);
		padding: var(--space-3xl) 0 var(--space-xl);
		margin-top: auto;
	}

	.footer-container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--space-lg);
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: var(--space-2xl);
	}

	.footer-brand h3 {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--gray-900);
		margin-bottom: var(--space-md);
		letter-spacing: -0.02em;
	}

	.footer-brand p {
		line-height: 1.6;
		max-width: 300px;
	}

	.footer-heading {
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--gray-900);
		margin-bottom: var(--space-lg);
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.footer-link {
		color: var(--gray-500);
		text-decoration: none;
		transition: color 0.2s;
	}

	.footer-link:hover {
		color: var(--primary-600);
	}

	.contact-info p {
		margin-bottom: var(--space-sm);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.copyright {
		border-top: 1px solid var(--gray-100);
		margin-top: var(--space-3xl);
		padding-top: var(--space-lg);
		text-align: center;
		color: var(--gray-400);
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.footer-container {
			grid-template-columns: 1fr;
			gap: var(--space-xl);
		}
	}
</style>
