<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Image from '$lib/components/ui/Image.svelte';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { pageContent } = data;

	let visible = $state(false);

	onMount(() => {
		visible = true;
	});
</script>

<svelte:head>
	<title>Kenalan Yuk! - ArimbiStore.ID</title>
	<meta
		name="description"
		content="Cerita di balik Arimbi Store, tempat belanja snack impor dan skincare pilihan."
	/>
</svelte:head>

<Navbar />

<main>
	<!-- 1. Hero: Sapaan Hangat -->
	<section class="hero-section">
		<div class="hero-content">
			<span class="hero-tag" in:fly={{ y: 20, duration: 600, delay: 100 }}
				>{pageContent.hero_tag || '👋 Kenalan Yuk!'}</span
			>
			<h1 in:fly={{ y: 20, duration: 600, delay: 200 }}>
				{@html pageContent.hero_title ||
					'Bawa Pulang <span class="highlight">Jajanan Dunia</span><br />ke Rumahmu!'}
			</h1>
			<p class="hero-text" in:fly={{ y: 20, duration: 600, delay: 300 }}>
				{pageContent.hero_text ||
					'Hai! Selamat datang di Arimbi Store. Tempatnya kamu cari cemilan unik dari luar negeri dan rahasia kulit sehat yang sudah kami pilihkan khusus buat kamu.'}
			</p>
		</div>
		<div class="hero-image" in:fade={{ duration: 1000, delay: 200 }}>
			<!-- Placeholder for owner/snack pile image. Using a fun abstract shape or illustration concept for now -->
			<Image
				src={pageContent.hero_image ||
					'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=1000&auto=format&fit=crop'}
				alt="Happy Shopping"
				style="height: 100%; width: 100%; object-fit: cover;"
			/>
			<div class="hero-blob"></div>
		</div>
	</section>

	<!-- 2. Cerita Kami (The Story) -->
	<section class="story-section">
		<div class="container">
			<div class="story-grid">
				<div class="story-text">
					<h2>{pageContent.story_title || 'Gimana Awalnya? 🤔'}</h2>
					<p>
						{@html pageContent.story_text_1 ||
							'Berawal dari hobi jajan dan sering dititipin oleh-oleh sama temen, kami sadar kalau cari <strong class="text-accent">snack luar negeri</strong> yang asli itu gampang-gampang susah. Akhirnya, Arimbi Store hadir supaya kamu nggak perlu terbang jauh-jauh cuma buat ngerasain Pocky Jepang atau Keripik Korea.'}
					</p>
					<p>
						{@html pageContent.story_text_2 ||
							'Oh iya, nggak cuma buat perut, kami juga peduli sama penampilan kamu. Makanya, kami juga sediain koleksi <strong class="text-primary">skincare pilihan</strong> yang emang sudah terbukti bagus dan aman dipakai.'}
					</p>
				</div>
				<div class="story-visual">
					<div class="stat-card">
						<span class="stat-num">{pageContent.stats_1_num || '500+'}</span>
						<span class="stat-label">{pageContent.stats_1_label || 'Happy Customer'}</span>
					</div>
					<div class="stat-card delay">
						<span class="stat-num">{pageContent.stats_2_num || '100%'}</span>
						<span class="stat-label">{pageContent.stats_2_label || 'Original Items'}</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 3. Janji Kami (Point Plus) -->
	<section class="promise-section">
		<div class="container">
			<h2 class="section-title text-center">{pageContent.promise_title || '✋ Janji Kami'}</h2>
			<div class="promise-grid">
				<div class="promise-card">
					<div class="icon-box">✨</div>
					<h3>{pageContent.promise_1_title || 'Pasti Asli'}</h3>
					<p>
						{pageContent.promise_1_desc ||
							'Nggak perlu khawatir, semua barang di sini 100% original. No KW-KW club!'}
					</p>
				</div>

				<div class="promise-card">
					<div class="icon-box">🌏</div>
					<h3>{pageContent.promise_2_title || 'Snack Luar Negeri Asli'}</h3>
					<p>
						{pageContent.promise_2_desc ||
							'Semua jajanan kami bawa langsung dari negara asalnya (Jepang, Korea, Thailand, dll).'}
					</p>
				</div>

				<div class="promise-card">
					<div class="icon-box">🧖‍♀️</div>
					<h3>{pageContent.promise_3_title || 'Skincare Pilihan'}</h3>
					<p>
						{pageContent.promise_3_desc ||
							'Skincare yang kami jual sudah kami cek dulu kualitasnya, jadi kamu tinggal pakai aja.'}
					</p>
				</div>

				<div class="promise-card">
					<div class="icon-box">📦</div>
					<h3>{pageContent.promise_4_title || 'Packing Anti-Remuk'}</h3>
					<p>
						{pageContent.promise_4_desc ||
							'Kami tahu rasanya sedih kalau snack sampai dalam keadaan hancur. Perlindungan ekstra aman!'}
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- 4. Tombol Interaksi (CTA) -->
	<section class="cta-section">
		<div class="cta-content">
			<h2>Udah laper atau mau mulai perawatan?</h2>
			<p>Yuk, jangan cuma dilihat. Stok terbatas lho!</p>
			<div class="cta-buttons">
				<a href="/products?category=snack" class="btn btn-snack"> 🍿 Lihat Katalog Snack </a>
				<a href="/products?category=skincare" class="btn btn-skincare"> ✨ Cek Produk Skincare </a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	/* Section Basics */
	section {
		padding: var(--space-3xl) var(--space-lg);
	}

	.container {
		max-width: 1024px;
		margin: 0 auto;
	}

	.text-center {
		text-align: center;
	}
	.text-accent {
		color: var(--accent-600);
	}
	.text-primary {
		color: var(--primary-600);
	}

	/* 1. Hero Section */
	.hero-section {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-2xl);
		align-items: center;
		background: linear-gradient(135deg, #fff5f7 0%, #ffffff 100%); /* Soft warm bg */
		padding-top: calc(var(--space-3xl) + 60px); /* Navbar offset */
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.hero-section {
			grid-template-columns: 1fr 1fr;
			padding-left: var(--space-3xl);
			padding-right: var(--space-3xl);
			min-height: 80vh;
		}
	}

	.hero-tag {
		display: inline-block;
		background: white;
		padding: 0.5rem 1rem;
		border-radius: var(--radius-full);
		font-weight: 700;
		color: var(--primary-600);
		box-shadow: var(--shadow-md);
		margin-bottom: var(--space-md);
		font-size: 0.875rem;
	}

	.hero-content h1 {
		font-size: clamp(2rem, 5vw, 3.5rem);
		line-height: 1.1;
		font-weight: 800;
		color: var(--gray-900);
		margin-bottom: var(--space-lg);
	}

	.hero-content .highlight {
		color: var(--accent-500);
		position: relative;
		display: inline-block;
	}

	.hero-content .highlight::after {
		content: '';
		position: absolute;
		bottom: 5px;
		left: 0;
		width: 100%;
		height: 15px;
		background: var(--accent-200);
		z-index: -1;
		opacity: 0.5;
		transform: rotate(-2deg);
	}

	.hero-text {
		font-size: 1.125rem;
		color: var(--gray-600);
		line-height: 1.6;
		max-width: 500px;
	}

	.hero-image {
		position: relative;
		height: 400px;
		border-radius: var(--radius-2xl);
		overflow: hidden;
		box-shadow: var(--shadow-xl);
		transform: rotate(2deg);
		transition: transform 0.3s;
	}

	.hero-image:hover {
		transform: rotate(0deg) scale(1.02);
	}

	/* 2. Story Section */
	.story-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-2xl);
		align-items: center;
	}

	@media (min-width: 768px) {
		.story-grid {
			grid-template-columns: 1.5fr 1fr;
		}
	}

	.story-text h2 {
		font-size: 2rem;
		font-weight: 800;
		margin-bottom: var(--space-lg);
		color: var(--gray-900);
	}

	.story-text p {
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--gray-700);
		margin-bottom: var(--space-md);
	}

	.story-visual {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.stat-card {
		background: white;
		padding: 2rem;
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-lg);
		text-align: center;
		border: 1px solid var(--gray-100);
	}

	.stat-card.delay {
		transform: translateY(2rem); /* Staggered look */
	}

	.stat-num {
		display: block;
		font-size: 2.5rem;
		font-weight: 900;
		color: var(--primary-600);
		line-height: 1;
		margin-bottom: 0.5rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--gray-500);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* 3. Promise Section */
	.promise-section {
		background: var(--gray-50);
	}

	.section-title {
		font-size: 2rem;
		font-weight: 800;
		color: var(--gray-900);
		margin-bottom: var(--space-2xl);
	}

	.promise-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-xl);
	}

	.promise-card {
		background: white;
		padding: 2rem;
		border-radius: var(--radius-xl);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
		transition: all 0.3s;
		border: 1px solid transparent;
		text-align: center;
	}

	.promise-card:hover {
		transform: translateY(-5px);
		box-shadow: var(--shadow-xl);
		border-color: var(--primary-100);
	}

	.icon-box {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		display: inline-block;
		width: 64px;
		height: 64px;
		line-height: 64px;
		background: var(--bg-surface);
		border-radius: 50%;
		background: var(--gray-100);
	}

	.promise-card h3 {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
		color: var(--gray-900);
	}

	.promise-card p {
		font-size: 0.95rem;
		color: var(--gray-600);
		line-height: 1.6;
	}

	/* 4. CTA Section */
	.cta-section {
		text-align: center;
		background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
		color: white;
		margin: var(--space-xl);
		border-radius: var(--radius-2xl);
		padding: 4rem 2rem;
	}

	.cta-content h2 {
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 800;
		margin-bottom: 1rem;
	}

	.cta-content p {
		font-size: 1.125rem;
		opacity: 0.9;
		margin-bottom: 2.5rem;
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 1rem 2rem;
		border-radius: var(--radius-full);
		font-weight: 700;
		text-decoration: none;
		transition: transform 0.2s;
		font-size: 1rem;
	}

	.btn:hover {
		transform: scale(1.05);
	}

	.btn-snack {
		background: var(--accent-500);
		color: var(--accent-900);
	}

	.btn-skincare {
		background: white;
		color: var(--primary-700);
	}
</style>
