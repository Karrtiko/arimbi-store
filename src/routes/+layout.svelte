<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import FloatingCart from '$lib/components/cart/FloatingCart.svelte';
	import CheckoutModal from '$lib/components/product/CheckoutModal.svelte';
	import WhatsAppContact from '$lib/components/ui/WhatsAppContact.svelte';

	import { page } from '$app/stores';

	let { children, data } = $props();

	// Check if we are in admin area
	const isAdmin = $derived(
		$page.url.pathname.startsWith('/admin') || $page.url.pathname.startsWith('/login')
	);
</script>

<!-- Render Children -->
{@render children()}

<!-- Global Cart Components (Only for Customer) -->
{#if !isAdmin}
	<FloatingCart />
	<CheckoutModal settings={data.settings} />
	<WhatsAppContact adminPhone={data.settings?.admin_whatsapp} />
{/if}
