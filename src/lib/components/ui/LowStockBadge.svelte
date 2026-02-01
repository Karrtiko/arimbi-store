<script lang="ts">
	// Simple low stock badge component
</script>

<div class="low-stock-badge">⚠️ Tinggal Sedikit!</div>

<style>
	.low-stock-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem 0.75rem;
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		color: #92400e;
		border: 1px solid #f59e0b;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.85;
		}
	}
</style>
