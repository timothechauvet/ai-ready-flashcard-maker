<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { getGermanSubfolderDefinitions, publicDecks, type DeckDefinition } from '$lib/deck_loader';

	const germanSubfolders = getGermanSubfolderDefinitions();
	const otherDecks = publicDecks.filter((deck) => deck.folder !== 'German');

	const germanLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => ({
		level,
		subfolders: germanSubfolders.filter((group) => group.subfolder.startsWith(`${level}/`))
	}));

	function groupByCategory(decks: DeckDefinition[]): { category: string; parts: DeckDefinition[] }[] {
		const map = new Map<string, DeckDefinition[]>();
		for (const deck of decks) {
			const cat = deck.category ?? 'other';
			map.set(cat, [...(map.get(cat) ?? []), deck]);
		}
		return [...map.entries()].map(([category, parts]) => ({
			category,
			parts: parts.sort((a, b) => (a.part ?? 0) - (b.part ?? 0))
		}));
	}

	const totalDeckCount = germanSubfolders.reduce((sum, sf) => sum + sf.decks.length, 0);

	type ProgressMap = Record<string, { correct: number; total: number }>;
	let progressMap = $state<ProgressMap>({});
	let allGermanDecks = $derived(germanSubfolders.flatMap((group) => group.decks));
	let overallCorrect = $derived(
		allGermanDecks.reduce((sum, deck) => sum + (progressMap[deck.id]?.correct ?? 0), 0)
	);
	let overallTotal = $derived(
		allGermanDecks.reduce((sum, deck) => sum + (progressMap[deck.id]?.total ?? deck.cards.length), 0)
	);
	let overallPercent = $derived(overallTotal === 0 ? 0 : Math.round((overallCorrect / overallTotal) * 100));

	onMount(() => {
		if (!browser) return;

		const nextMap: ProgressMap = {};
		for (const deck of allGermanDecks) {
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

	function subfolderProgress(subfolder: (typeof germanSubfolders)[number]) {
		const correct = subfolder.decks.reduce((sum, deck) => sum + (progressMap[deck.id]?.correct ?? 0), 0);
		const total = subfolder.decks.reduce((sum, deck) => sum + deck.cards.length, 0);
		return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
	}
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
					<p class="text-muted">6 levels • 12 subfolders • {totalDeckCount} decks (max 20 cards each) • {overallTotal} cards total</p>
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
						<span>{levelGroup.subfolders.length} subfolders</span>
					</div>
					<div class="sublevel-list">
						{#each levelGroup.subfolders as subfolder}
							{@const progress = subfolderProgress(subfolder)}
							<div class="subfolder-card">
								<div class="subfolder-head">
									<div>
										<h5>{subfolder.level}</h5>
										<p class="deck-path">German / {subfolder.subfolder}</p>
									</div>
									<div class="mini-progress wide">
										<span>{progress.correct} / {progress.total}</span>
										<div class="mini-progress-track">
											<div class="mini-progress-fill" style={`width: ${progress.percent}%`}></div>
										</div>
									</div>
								</div>

								<div class="category-list">
									{#each groupByCategory(subfolder.decks) as catGroup}
										<div class="category-group">
											<h6 class="category-heading">{catGroup.category}</h6>
											<div class="category-parts">
												{#each catGroup.parts as deck}
													<div class="deck-row">
														<div class="deck-row-copy">
															<span class="part-label">{deck.part != null ? `Part ${deck.part}` : catGroup.category}</span>
															<p class="text-muted">{deck.cards.length} cards</p>
														</div>
														<div class="deck-row-actions">
															<div class="mini-progress">
																<span>{progressMap[deck.id]?.correct ?? 0} / {deck.cards.length}</span>
																<div class="mini-progress-track">
																	<div class="mini-progress-fill" style={`width: ${Math.round(((progressMap[deck.id]?.correct ?? 0) / deck.cards.length) * 100)}%`}></div>
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

	.german-folder-header,
	.subfolder-head,
	.level-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.german-folder-header {
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
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	.level-card,
	.legacy-deck-card,
	.subfolder-card {
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

	.level-card-header,
	.subfolder-head {
		margin-bottom: 0.75rem;
	}

	.level-card-header span,
	.deck-path {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.sublevel-list,
	.category-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.category-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.category-heading {
		text-transform: capitalize;
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--accent-color);
		margin: 0.5rem 0 0;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid var(--border-color);
	}

	.category-parts {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.part-label {
		font-size: 0.85rem;
		font-weight: 600;
	}

	.deck-row {
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 0.75rem;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: center;
	}

	.deck-row-copy h6,
	.subfolder-card h5 {
		margin-bottom: 0.2rem;
		text-transform: capitalize;
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

	.mini-progress.wide {
		max-width: 180px;
	}

	.mini-progress-track {
		height: 0.45rem;
		margin-top: 0.35rem;
	}

	@media (max-width: 640px) {
		.german-folder-header,
		.deck-row,
		.legacy-deck-card,
		.subfolder-head {
			flex-direction: column;
			align-items: stretch;
		}

		.progress-summary,
		.deck-row-actions {
			align-items: stretch;
		}

		.mini-progress.wide {
			max-width: none;
		}
	}
</style>
