<script lang="ts">
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>Explore Decks - YASSSF</title>
</svelte:head>

<div class="card">
	<h2>Public Flashcard Decks</h2>
	<p class="text-muted">Browse community created decks and collections.</p>

	<div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
		<div
			style="border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;"
		>
			<div>
				<h3 style="margin-bottom: 0.25rem;">German Idioms & Nuances</h3>
				<p class="text-muted" style="font-size: 0.875rem;">
					10 cards • Advanced German vocabulary and expressions
				</p>
			</div>
			<a href={`${base}/play/german-idioms`} class="btn btn-primary">Play Deck</a>
		</div>

		<div
			style="border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;"
		>
			<div>
				<h3 style="margin-bottom: 0.25rem;">German Words</h3>
				<p class="text-muted" style="font-size: 0.875rem;">
					10 cards • Basic German nouns and translations
				</p>
			</div>
			<a href={`${base}/play/german-words`} class="btn btn-primary">Play Deck</a>
		</div>
	</div>
</div>
