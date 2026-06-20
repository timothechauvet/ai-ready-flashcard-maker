<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { getGermanDeckDefinitions, publicDecks } from '$lib/deck_loader';

	const germanDecks = getGermanDeckDefinitions();
	const otherDecks = publicDecks.filter((deck) => deck.folder !== 'German');

	const germanLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => ({
		level,
		decks: germanDecks.filter((deck) => deck.subfolder?.startsWith(`${level}/`))
	}));

	type ProgressMap = Record<string, { correct: number; total: number }>;
	let progressMap = $state<ProgressMap>({});
	let overallCorrect = $derived(
		germanDecks.reduce((sum, deck) => sum + (progressMap[deck.id]?.correct ?? 0), 0)
	);
	let overallTotal = $derived(
		germanDecks.reduce((sum, deck) => sum + (progressMap[deck.id]?.total ?? deck.cards.length), 0)
	);
	let overallPercent = $derived(overallTotal === 0 ? 0 : Math.round((overallCorrect / overallTotal) * 100));

	onMount(() => {
		if (!browser) return;

		const nextMap: ProgressMap = {};
		for (const deck of germanDecks) {
			const storageKey = `yasssf-progress:${deck.id}`;
			const raw = localStorage.getItem(storageKey);
			const parsed = raw ? JSON.parse(raw) : null;
			nextMap[deck.id] = {
				correct: Math.min(deck.cards.length, parsed?.correctCount ?? 0),
				total: deck.cards.length
			};
		}
		progressMap = nextMap;
	});
</script>

<svelte:head>
	<title>Explore Decks - YASSSF</title>
</svelte:head>

<div class="card">
	<h2>Public Flashcard Decks</h2>
	<p class="text-muted">Browse community created decks and collections.</p>

	<div class="german-folder-card">
		<div class="german-folder-header">
			<div>
				<h3>German</h3>
				<p class="text-muted">6 levels • 12 subfolders • {overallTotal} cards total</p>
			</div>
			<div class="progress-summary">
				<span>{overallCorrect} / {overallTotal}</span>
				<strong>{overallPercent}%</strong>
			</div>
		</div>

		<div class="performance-block">
			<div class="performance-meta">
				<span>Overall performance</span>
				<span>{overallPercent}% complete</span>
			</div>
			<div class="performance-bar-track">
				<div class="performance-bar-fill" style={`width: ${overallPercent}%`}></div>
			</div>
		</div>

		<div class="level-groups">
			{#each germanLevels as levelGroup}
				<div class="level-card">
					<div class="level-card-header">
						<h4>{levelGroup.level}</h4>
						<span>{levelGroup.decks.length} folders</span>
					</div>
					<div class="sublevel-list">
						{#each levelGroup.decks as deck}
							<div class="deck-row">
								<div class="deck-row-copy">
									<h5>{deck.level}</h5>
									<p class="text-muted">{deck.cards.length} cards</p>
									<p class="deck-path">German / {deck.subfolder}</p>
								</div>
								<div class="deck-row-actions">
									<div class="mini-progress">
										<span>{progressMap[deck.id]?.correct ?? 0} / {deck.cards.length}</span>
										<div class="mini-progress-track">
											<div
												class="mini-progress-fill"
												style={`width: ${Math.round(((progressMap[deck.id]?.correct ?? 0) / deck.cards.length) * 100)}%`}
											></div>
										</div>
									</div>
									<a href={`${base}/play/${deck.id}`} class="btn btn-primary">Play</a>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
		{#each otherDecks as deck}
			<div class="legacy-deck-card">
				<div>
					<h3 style="margin-bottom: 0.25rem;">{deck.title}</h3>
					<p class="text-muted" style="font-size: 0.875rem;">{deck.description}</p>
				</div>
				<a href={`${base}/play/${deck.id}`} class="btn btn-primary">Play Deck</a>
			</div>
		{/each}
	</div>
</div>

<style>
	.german-folder-card {
		margin-top: 2rem;
		padding: 1.25rem;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
	}

	.german-folder-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.progress-summary {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.progress-summary strong {
		font-size: 1.35rem;
		color: var(--accent-color);
	}

	.performance-block {
		padding: 1rem;
		border-radius: 0.875rem;
		background: var(--surface-color);
		margin-bottom: 1.25rem;
	}

	.performance-meta {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.625rem;
	}

	.performance-bar-track,
	.mini-progress-track {
		width: 100%;
		height: 0.75rem;
		background: #dbe3ea;
		border-radius: 999px;
		overflow: hidden;
	}

	.performance-bar-fill,
	.mini-progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent-light) 0%, var(--accent-color) 100%);
		border-radius: inherit;
	}

	.level-groups {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.level-card,
	.legacy-deck-card {
		border: 1px solid var(--border-color);
		padding: 1rem;
		border-radius: 0.875rem;
		background: white;
	}

	.legacy-deck-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.level-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.level-card-header span,
	.deck-path {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.sublevel-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.deck-row {
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 0.875rem;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: center;
	}

	.deck-row-copy h5 {
		margin-bottom: 0.2rem;
	}

	.deck-row-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		min-width: 120px;
	}

	.mini-progress {
		width: 100%;
		font-size: 0.75rem;
		color: var(--text-muted);
		text-align: right;
	}

	.mini-progress-track {
		height: 0.45rem;
		margin-top: 0.35rem;
	}

	@media (max-width: 640px) {
		.german-folder-header,
		.deck-row,
		.legacy-deck-card {
			flex-direction: column;
			align-items: stretch;
		}

		.progress-summary,
		.deck-row-actions {
			align-items: stretch;
		}
	}
</style>
