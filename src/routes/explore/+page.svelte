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

		<div
			style="border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;"
		>
			<div>
				<h3 style="margin-bottom: 0.25rem;">German C1.1</h3>
				<p class="text-muted" style="font-size: 0.875rem;">
					51 cards • German C1.1 vocabulary list
				</p>
			</div>
			<a href={`${base}/play/german-c1`} class="btn btn-primary">Play Deck</a>
		</div>

		<div
			style="border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;"
		>
			<div>
				<h3 style="margin-bottom: 0.25rem;">Most-Used German Nouns</h3>
				<p class="text-muted" style="font-size: 0.875rem;">
					1781 cards • Most frequent German nouns with articles
				</p>
			</div>
			<a href={`${base}/play/german-nouns`} class="btn btn-primary">Play Deck</a>
		</div>

		<div
			style="border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;"
		>
			<div>
				<h3 style="margin-bottom: 0.25rem;">German Partizipialgruppen</h3>
				<p class="text-muted" style="font-size: 0.875rem;">
					18 cards • Partizipialgruppen als feste Wendungen (C1)
				</p>
			</div>
			<a href={`${base}/play/german-partizipien`} class="btn btn-primary">Play Deck</a>
		</div>

		<div
			style="border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;"
		>
			<div>
				<h3 style="margin-bottom: 0.25rem;">German Sayings & Idioms</h3>
				<p class="text-muted" style="font-size: 0.875rem;">
					66 cards • Fixed expressions, idioms, and sayings (C1)
				</p>
			</div>
			<a href={`${base}/play/german-sayings`} class="btn btn-primary">Play Deck</a>
		</div>

		<div
			style="border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;"
		>
			<div>
				<h3 style="margin-bottom: 0.25rem;">German Wortschatz</h3>
				<p class="text-muted" style="font-size: 0.875rem;">
					338 cards • General C1 vocabulary list
				</p>
			</div>
			<a href={`${base}/play/german-wortschatz`} class="btn btn-primary">Play Deck</a>
		</div>
	</div>
</div>
