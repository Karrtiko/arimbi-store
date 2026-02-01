<script lang="ts">
	let { adminPhone = '6281234567890', productName = '' } = $props<{
		adminPhone?: string;
		productName?: string;
	}>();

	let name = $state('');
	let question = $state('');
	let isOpen = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!name.trim() || !question.trim()) {
			alert('Mohon lengkapi nama dan pertanyaan Anda');
			return;
		}

		// Build WhatsApp message
		let message = `Halo Admin Arimbi Store!\n\n`;
		message += `Nama: ${name}\n`;
		if (productName) {
			message += `Produk: ${productName}\n`;
		}
		message += `\nPertanyaan:\n${question}`;

		// Encode message for URL
		const encodedMessage = encodeURIComponent(message);
		const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

		// Open WhatsApp in new tab
		window.open(whatsappUrl, '_blank');

		// Reset form and close modal
		name = '';
		question = '';
		isOpen = false;
	}
</script>

<!-- Floating WhatsApp Button -->
<button class="wa-float-btn" onclick={() => (isOpen = true)} title="Chat dengan Admin">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path
			d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
		/>
	</svg>
	<span>Chat Admin</span>
</button>

<!-- Modal -->
{#if isOpen}
	<div class="modal-overlay" onclick={() => (isOpen = false)}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>💬 Chat dengan Admin</h3>
				<button class="close-btn" onclick={() => (isOpen = false)}>✕</button>
			</div>

			<form onsubmit={handleSubmit}>
				<div class="form-group">
					<label for="wa-name">Nama Anda</label>
					<input
						id="wa-name"
						type="text"
						bind:value={name}
						placeholder="Masukkan nama Anda"
						required
					/>
				</div>

				<div class="form-group">
					<label for="wa-question">Pertanyaan</label>
					<textarea
						id="wa-question"
						bind:value={question}
						placeholder="Apa yang ingin Anda tanyakan?"
						rows="4"
						required
					></textarea>
				</div>

				<button type="submit" class="submit-btn">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
						/>
					</svg>
					Kirim via WhatsApp
				</button>
			</form>
		</div>
	</div>
{/if}

<style>
	.wa-float-btn {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		background: #25d366;
		color: white;
		border: none;
		border-radius: 50px;
		padding: 1rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
		transition: all 0.3s;
		z-index: 999;
	}

	.wa-float-btn:hover {
		background: #20ba5a;
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(37, 211, 102, 0.5);
	}

	.wa-float-btn svg {
		width: 24px;
		height: 24px;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: white;
		border-radius: 1rem;
		max-width: 500px;
		width: 100%;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #1f2937;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #9ca3af;
		cursor: pointer;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	form {
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #374151;
		font-size: 0.875rem;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		font-family: inherit;
		transition: all 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #25d366;
		box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 100px;
	}

	.submit-btn {
		width: 100%;
		background: #25d366;
		color: white;
		border: none;
		border-radius: 0.5rem;
		padding: 0.875rem 1.5rem;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: all 0.2s;
	}

	.submit-btn:hover {
		background: #20ba5a;
	}

	.submit-btn svg {
		width: 20px;
		height: 20px;
	}

	@media (max-width: 640px) {
		.wa-float-btn span {
			display: none;
		}

		.wa-float-btn {
			padding: 1rem;
			border-radius: 50%;
		}
	}
</style>
