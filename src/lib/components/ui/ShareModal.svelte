<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	let {
		isOpen = $bindable(false),
		productName,
		productUrl
	} = $props<{
		isOpen: boolean;
		productName: string;
		productUrl: string;
	}>();

	let copied = $state(false);

	function close() {
		isOpen = false;
		copied = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) close();
	}

	function copyLink() {
		navigator.clipboard.writeText(productUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	// Social Share Links
	const shareLinks = $derived({
		whatsapp: `https://wa.me/?text=${encodeURIComponent(`Cek produk ini: ${productName} \n${productUrl}`)}`,
		twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Cek produk ini: ${productName}`)}&url=${encodeURIComponent(productUrl)}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
		telegram: `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(`Cek produk ini: ${productName}`)}`,
		threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(`Cek produk ini: ${productName} ${productUrl}`)}`,
		email: `mailto:?subject=${encodeURIComponent(`Rekomendasi Produk: ${productName}`)}&body=${encodeURIComponent(`Hai, cek produk menarik ini: ${productName}\n\nLink: ${productUrl}`)}`
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div class="backdrop" onclick={close} transition:fade={{ duration: 200 }}>
		<div
			class="modal-content"
			onclick={(e) => e.stopPropagation()}
			transition:fly={{ y: 50, duration: 300 }}
		>
			<div class="modal-header">
				<h3>Bagikan Produk</h3>
				<button class="close-btn" onclick={close} aria-label="Close">✕</button>
			</div>

			<div class="share-grid">
				<!-- WhatsApp -->
				<a
					href={shareLinks.whatsapp}
					target="_blank"
					rel="noopener noreferrer"
					class="share-item whatsapp"
				>
					<div class="icon-circle whatsapp-bg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path
								d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"
							/></svg
						>
					</div>
					<span>WhatsApp</span>
				</a>

				<!-- Telegram -->
				<a
					href={shareLinks.telegram}
					target="_blank"
					rel="noopener noreferrer"
					class="share-item telegram"
				>
					<div class="icon-circle telegram-bg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><line x1="22" y1="2" x2="11" y2="13" /><polygon
								points="22 2 15 22 11 13 2 9 22 2"
							/></svg
						>
					</div>
					<span>Telegram</span>
				</a>

				<!-- Instagram (Copy Link Trick) -->
				<button onclick={copyLink} class="share-item instagram">
					<div class="icon-circle instagram-bg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path
								d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
							/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg
						>
					</div>
					<span>Instagram</span>
				</button>

				<!-- Threads -->
				<a
					href={shareLinks.threads}
					target="_blank"
					rel="noopener noreferrer"
					class="share-item threads"
				>
					<div class="icon-circle threads-bg">
						<!-- Simple @ symbol as Threads icon substitute for now -->
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><circle cx="12" cy="12" r="4" /><path
								d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"
							/></svg
						>
					</div>
					<span>Threads</span>
				</a>

				<!-- Twitter/X -->
				<a
					href={shareLinks.twitter}
					target="_blank"
					rel="noopener noreferrer"
					class="share-item twitter"
				>
					<div class="icon-circle twitter-bg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M4 4l11.733 16h4.667L8.667 4z" /><path
								d="M4 20l6.768-6.768m2.46-2.46L20 4"
							/></svg
						>
					</div>
					<span>Twitter</span>
				</a>

				<!-- Facebook -->
				<a
					href={shareLinks.facebook}
					target="_blank"
					rel="noopener noreferrer"
					class="share-item facebook"
				>
					<div class="icon-circle facebook-bg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg
						>
					</div>
					<span>Facebook</span>
				</a>

				<!-- Email -->
				<a href={shareLinks.email} class="share-item email">
					<div class="icon-circle email-bg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
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
					</div>
					<span>Email</span>
				</a>

				<!-- Copy Link (Icon Only) -->
				<button onclick={copyLink} class="share-item copy">
					<div class="icon-circle copy-bg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
								d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
							/></svg
						>
					</div>
					<span>{copied ? 'Salin!' : 'Salin Link'}</span>
				</button>
			</div>

			<!-- Removed the bottom copy section since we have it in grid now for consistency -->
			<!-- <div class="copy-link-section">...</div> -->
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: white;
		border-radius: var(--radius-xl);
		width: 100%;
		max-width: 450px;
		box-shadow: var(--shadow-xl);
		overflow: hidden;
		border: 1px solid var(--gray-100);
	}

	.modal-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--gray-100);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h3 {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--gray-900);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		color: var(--gray-400);
		cursor: pointer;
		padding: 0.5rem;
		line-height: 1;
		border-radius: 50%;
		transition: all 0.2s;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		background: var(--gray-50);
		color: var(--gray-900);
	}

	.share-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.5rem 1rem;
		padding: 2rem 1.5rem;
	}

	.share-item {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--gray-600);
		font-size: 0.75rem;
		font-weight: 600;
		transition: transform 0.2s;
		padding: 0;
	}

	.share-item:hover {
		transform: translateY(-4px);
		color: var(--primary-600);
	}

	.icon-circle {
		width: 54px;
		height: 54px;
		border-radius: 20px; /* Squircle */
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.25rem;
		box-shadow: var(--shadow-sm);
	}

	.whatsapp-bg {
		background: #25d366;
	}
	.telegram-bg {
		background: #229ed9;
	}
	.instagram-bg {
		background: radial-gradient(
			circle at 30% 107%,
			#fdf497 0%,
			#fdf497 5%,
			#fd5949 45%,
			#d6249f 60%,
			#285aeb 90%
		);
	}
	.threads-bg {
		background: #000000;
	}
	.twitter-bg {
		background: #000000;
	}
	.facebook-bg {
		background: #1877f2;
	}
	.email-bg {
		background: var(--gray-500);
	}
	.copy-bg {
		background: var(--gray-800);
	}

	/* Mobile Slide Up */
	@media (max-width: 640px) {
		.backdrop {
			align-items: flex-end;
			padding: 0;
		}

		.modal-content {
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
			max-width: 100%;
		}

		.share-grid {
			grid-template-columns: repeat(4, 1fr); /* Keep 4 cols on mobile for density */
		}
	}
</style>
