<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';

	const API_BASE = env.PUBLIC_API_URL || 'https://api.yasssf.com';

	type DeckMeta = {
		id: string;
		title: string;
		description: string;
		author: string | null;
		organization: string | null;
		part: number | null;
		card_count: number;
	};

	type CategoryGroup = {
		category: string;
		decks: DeckMeta[];
	};

	type SubfolderGroup = {
		subfolder: string;
		level: string;
		categories: CategoryGroup[];
		total_cards: number;
	};

	type FolderGroup = {
		folder: string;
		subfolders: SubfolderGroup[];
		total_cards: number;
	};

	let collections = $state<FolderGroup[]>([]);
	let germanFolder = $derived(collections.find(c => c.folder === 'German'));
	let otherDecks = $derived(
		collections.filter(c => c.folder !== 'German').flatMap(c =>
			c.subfolders.flatMap(sf =>
				sf.categories.flatMap(cat => cat.decks)
			)
		)
	);

	let isLoading = $state(true);
	let loadError = $state('');

	type ProgressMap = Record<string, { correct: number; total: number }>;
	let progressMap = $state<ProgressMap>({});

	// Compute overall stats per folder
	function getFolderStats(folder: FolderGroup) {
		let correct = 0;
		let total = 0;
		let deckCount = 0;
		
		for (const sf of folder.subfolders) {
			for (const cat of sf.categories) {
				for (const deck of cat.decks) {
					correct += progressMap[deck.id]?.correct ?? 0;
					total += progressMap[deck.id]?.total ?? deck.card_count;
					deckCount++;
				}
			}
		}
		
		return {
			correct,
			total,
			percent: total === 0 ? 0 : Math.round((correct / total) * 100),
			deckCount
		};
	}

	function getSubfolderStats(subfolder: SubfolderGroup) {
		let correct = 0;
		let total = 0;
		for (const cat of subfolder.categories) {
			for (const deck of cat.decks) {
				correct += progressMap[deck.id]?.correct ?? 0;
				total += deck.card_count;
			}
		}
		return {
			correct,
			total,
			percent: total === 0 ? 0 : Math.round((correct / total) * 100)
		};
	}

	onMount(async () => {
		try {
			const res = await fetch(`${API_BASE}/collections`);
			if (!res.ok) throw new Error(`API error: ${res.status}`);
			collections = await res.json();
			
			if (browser) {
				const nextMap: ProgressMap = {};
				for (const folder of collections) {
					for (const sf of folder.subfolders) {
						for (const cat of sf.categories) {
							for (const deck of cat.decks) {
								const storageKey = `yasssf-progress:${deck.id}`;
								const raw = localStorage.getItem(storageKey);
								const parsed = raw ? JSON.parse(raw) : null;
								nextMap[deck.id] = {
									correct: Math.min(deck.card_count, parsed?.correctCount ?? 0),
									total: deck.card_count
								};
							}
						}
					}
				}
				progressMap = nextMap;
			}
		} catch (e: any) {
			console.error(e);
			loadError = e.message;
		} finally {
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Explore Decks - YASSSF</title>
</svelte:head>

<div class="card">
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
		<div>
			<h2>Flashcard Collections</h2>
			<p class="text-muted">Browse community created decks and collections.</p>
		</div>
		<a href="{base}/upload" class="btn btn-primary">+ Import Deck</a>
	</div>

	{#if isLoading}
		<div style="padding: 3rem; text-align: center;">
			<h3>Loading collections...</h3>
		</div>
	{:else if loadError}
		<div style="padding: 3rem; text-align: center; color: var(--danger-color);">
			<h3>Error loading collections: {loadError}</h3>
		</div>
	{:else}
		{#if germanFolder}
			{@const stats = getFolderStats(germanFolder)}
			
			<div class="german-folder-card">
				<div class="german-folder-header">
					<div>
						<h3>{germanFolder.folder}</h3>
						<p class="text-muted">{germanFolder.subfolders.length} subfolders • {stats.deckCount} decks • {stats.total} cards total</p>
					</div>
					<div class="progress-summary">
						<span>{stats.correct} / {stats.total}</span>
						<strong>{stats.percent}%</strong>
					</div>
				</div>

				<div class="performance-block">
					<div class="performance-meta">
						<span>Overall performance</span>
						<span>{stats.percent}% complete</span>
					</div>
					<div class="performance-bar-track">
						<div class="performance-bar-fill" style={`width: ${stats.percent}%`}></div>
					</div>
				</div>

				<div class="level-groups">
					{#each germanFolder.subfolders as subfolder}
						{@const sfStats = getSubfolderStats(subfolder)}
						<div class="level-card">
							<div class="subfolder-head" style="margin-bottom: 1rem;">
								<div>
									<h5>{subfolder.level || subfolder.subfolder || 'General'}</h5>
									{#if subfolder.subfolder && subfolder.level !== subfolder.subfolder}
										<p class="deck-path">{germanFolder.folder} / {subfolder.subfolder}</p>
									{/if}
								</div>
								<div class="mini-progress wide">
									<span>{sfStats.correct} / {sfStats.total}</span>
									<div class="mini-progress-track">
										<div class="mini-progress-fill" style={`width: ${sfStats.percent}%`}></div>
									</div>
								</div>
							</div>

							<div class="category-list">
								{#each subfolder.categories as catGroup}
									<div class="category-group">
										<h6 class="category-heading">{catGroup.category}</h6>
										<div class="category-parts">
											{#each catGroup.decks as deck}
												<div class="deck-row">
													<div class="deck-row-copy">
														<span class="part-label">{deck.part != null ? `Part ${deck.part}` : deck.title}</span>
														<p class="text-muted">{deck.card_count} cards</p>
														{#if deck.author || deck.organization}
															<p class="text-muted" style="font-size: 0.75rem; margin-top: 0.25rem;">
																By: {deck.author || 'Unknown'} {#if deck.organization} ({deck.organization}) {/if}
															</p>
														{/if}
													</div>
													<div class="deck-row-actions">
														<div class="mini-progress">
															<span>{progressMap[deck.id]?.correct ?? 0} / {deck.card_count}</span>
															<div class="mini-progress-track">
																<div class="mini-progress-fill" style={`width: ${Math.round(((progressMap[deck.id]?.correct ?? 0) / deck.card_count) * 100)}%`}></div>
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
		{/if}

		{#if otherDecks.length > 0}
			<div style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
				<h3 style="margin-bottom: 0.5rem; margin-top: 1rem;">Community & Public Decks</h3>
				{#each otherDecks as deck}
					<div class="legacy-deck-card">
						<div>
							<h3 style="margin-bottom: 0.25rem;">{deck.title}</h3>
							<p class="text-muted" style="font-size: 0.875rem;">{deck.description}</p>
							{#if deck.author || deck.organization}
								<p class="text-muted" style="font-size: 0.75rem; margin-top: 0.25rem;">
									By: {deck.author || 'Unknown'} {#if deck.organization} ({deck.organization}) {/if}
								</p>
							{/if}
						</div>
						<a href={`${base}/play/${deck.id}`} class="btn btn-primary">Play Deck</a>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
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
	.subfolder-head {
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
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.level-card {
		border: 1px solid var(--border-color);
		padding: 1.25rem;
		border-radius: 0.875rem;
		background: white;
	}

	.deck-path {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.category-list {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.category-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.category-heading {
		text-transform: capitalize;
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--accent-color);
		margin: 0.5rem 0 0;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid var(--border-color);
	}

	.category-parts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
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
		background: var(--surface-color);
	}

	.deck-row-copy h6,
	.subfolder-head h5 {
		margin-bottom: 0.2rem;
		text-transform: capitalize;
	}

	.deck-row-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		min-width: 100px;
	}

	.legacy-deck-card {
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 1.25rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: white;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.legacy-deck-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
