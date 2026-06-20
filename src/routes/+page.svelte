<script lang="ts">
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Yet Another Simple Shared Study Flashcards</title>
	<meta
		name="description"
		content="Yet Another Simple Shared Study Flashcards. AI-ready, mobile-first, lightning fast learning."
	/>
</svelte:head>

<section class="hero-section">
	<div class="hero-content">
		<h1 class="animate-fade-in">
			Yet Another Simple Shared Study <span class="text-accent">Flashcards.</span>
		</h1>
		<p class="subtitle animate-fade-in" style="animation-delay: 0.1s;">
			YASSSF is the ultimate minimal flashcard tool. Generate decks with AI, share with your
			friends, and study on any device. Fast, free, and open-source.
		</p>
		<div class="cta-group animate-fade-in" style="animation-delay: 0.2s;">
			<a href={`${base}/upload`} class="btn btn-primary btn-lg">Create a Deck</a>
			<a href={`${base}/explore`} class="btn btn-secondary btn-lg">Explore Public Decks</a>
		</div>
	</div>

	<div class="features-grid">
		<div class="card animate-fade-in" style="animation-delay: 0.4s;">
			<div class="icon-box">🧠</div>
			<h3>AI-Powered</h3>
			<p class="text-muted">
				Generate entire study decks in seconds by talking to your favorite AI. Just copy the prompt
				and paste.
			</p>
		</div>
		<div class="card animate-fade-in" style="animation-delay: 0.5s;">
			<div class="icon-box">📁</div>
			<h3>YAML Ready</h3>
			<p class="text-muted">
				Import and export decks using clean YAML files. Perfect for power users who want full
				control over their data.
			</p>
		</div>
		<div class="card animate-fade-in" style="animation-delay: 0.6s;">
			<div class="icon-box">🚀</div>
			<h3>Shared Learning</h3>
			<p class="text-muted">
				No friction. Share your public decks with a link.
			</p>
		</div>
	</div>
</section>

<style>
	.hero-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 4rem;
		padding: 4rem 1rem;
	}

	.hero-content {
		max-width: 800px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.hero-content h1 {
		font-size: clamp(2.5rem, 8vw, 4rem);
		line-height: 1.1;
		margin-bottom: 0.5rem;
	}

	.text-accent {
		color: var(--accent-light);
	}

	.subtitle {
		font-size: clamp(1.1rem, 3vw, 1.35rem);
		color: var(--text-muted);
		line-height: 1.6;
		max-width: 700px;
		margin: 0 auto;
	}

	.cta-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1rem;
		flex-wrap: wrap;
	}

	.btn-lg {
		padding: 1rem 2.5rem;
		font-size: 1.125rem;
	}



	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		width: 100%;
		max-width: 1100px;
	}

	.features-grid .card {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		text-align: left;
		padding: 2.5rem;
		height: 100%;
	}

	.icon-box {
		width: 3.5rem;
		height: 3.5rem;
		background: var(--surface-color);
		border-radius: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		color: var(--accent-color);
	}

	.features-grid h3 {
		font-size: 1.5rem;
	}

	@media (max-width: 640px) {
		.hero-section {
			padding: 2rem 1rem;
			gap: 3rem;
		}
		.cta-group .btn {
			width: 100%;
		}
	}
</style>
