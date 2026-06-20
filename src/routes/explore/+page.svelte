<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { fade } from 'svelte/transition';

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
	let isLoading = $state(true);
	let loadError = $state('');

	// Navigation state
	let selectedFolder = $state<string | null>(null);
	let selectedSubfolder = $state<string | null>(null);
	let selectedCategory = $state<string | null>(null);

	// Derived data based on navigation
	let currentFolder = $derived(collections.find(c => c.folder === selectedFolder) ?? null);
	let currentSubfolder = $derived(
		currentFolder?.subfolders.find(sf => (sf.level || sf.subfolder) === selectedSubfolder) ?? null
	);
	let currentCategory = $derived(
		currentSubfolder?.categories.find(cat => cat.category === selectedCategory) ?? null
	);

	let otherDecks = $derived(
		collections.filter(c => c.folder !== 'German').flatMap(c =>
			c.subfolders.flatMap(sf =>
				sf.categories.flatMap(cat => cat.decks)
			)
		)
	);

	type ProgressMap = Record<string, { correct: number; total: number }>;
	let progressMap = $state<ProgressMap>({});

	function getFolderStats(folder: FolderGroup) {
		let correct = 0;
		let total = 0;
		let deckCount = 0;
		for (const sf of folder.subfolders) {
			for (const cat of sf.categories) {
				for (const deck of cat.decks) {
					correct += progressMap[deck.id]?.correct ?? 0;
					total += deck.card_count;
					deckCount++;
				}
			}
		}
		return {
			correct, total, deckCount,
			percent: total === 0 ? 0 : Math.round((correct / total) * 100)
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
			correct, total,
			percent: total === 0 ? 0 : Math.round((correct / total) * 100)
		};
	}

	function getCategoryStats(catGroup: CategoryGroup) {
		let correct = 0;
		let total = 0;
		for (const deck of catGroup.decks) {
			correct += progressMap[deck.id]?.correct ?? 0;
			total += deck.card_count;
		}
		return {
			correct, total,
			percent: total === 0 ? 0 : Math.round((correct / total) * 100)
		};
	}

	function navigateToFolder(folder: string) {
		selectedFolder = folder;
		selectedSubfolder = null;
		selectedCategory = null;
	}

	function navigateToSubfolder(subfolder: SubfolderGroup) {
		selectedSubfolder = subfolder.level || subfolder.subfolder;
		selectedCategory = null;
	}

	function navigateToCategory(category: string) {
		selectedCategory = category;
	}

	function navigateToRoot() {
		selectedFolder = null;
		selectedSubfolder = null;
		selectedCategory = null;
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
								const raw = localStorage.getItem(`yasssf-progress:${deck.id}`);
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
		<!-- Breadcrumb -->
		{#if selectedFolder}
			<nav class="breadcrumb" in:fade>
				<button class="breadcrumb-link" onclick={navigateToRoot}>📚 All Collections</button>
				<span class="breadcrumb-sep">›</span>
				{#if selectedSubfolder}
					<button class="breadcrumb-link" onclick={() => { selectedSubfolder = null; selectedCategory = null; }}>{selectedFolder}</button>
					<span class="breadcrumb-sep">›</span>
					{#if selectedCategory}
						<button class="breadcrumb-link" onclick={() => { selectedCategory = null; }}>{selectedSubfolder}</button>
						<span class="breadcrumb-sep">›</span>
						<span class="breadcrumb-current">{selectedCategory}</span>
					{:else}
						<span class="breadcrumb-current">{selectedSubfolder}</span>
					{/if}
				{:else}
					<span class="breadcrumb-current">{selectedFolder}</span>
				{/if}
			</nav>
		{/if}

		<!-- Level 0: Root — show all folders -->
		{#if !selectedFolder}
			<div class="folder-grid" in:fade>
				{#each collections.filter(c => c.folder === 'German') as folder}
					{@const stats = getFolderStats(folder)}
					<button class="folder-tile" onclick={() => navigateToFolder(folder.folder)}>
						<div class="folder-tile-icon">🇩🇪</div>
						<div class="folder-tile-info">
							<h3>{folder.folder}</h3>
							<p class="text-muted">{folder.subfolders.length} levels • {stats.deckCount} decks • {stats.total} cards</p>
						</div>
						<div class="folder-tile-progress">
							<div class="mini-progress-track">
								<div class="mini-progress-fill" style={`width: ${stats.percent}%`}></div>
							</div>
							<span class="folder-percent">{stats.percent}%</span>
						</div>
						<div class="folder-tile-arrow">›</div>
					</button>
				{/each}

				{#if otherDecks.length > 0}
					<div class="other-decks-section">
						<h3 style="margin: 1.5rem 0 0.75rem;">Community & Public Decks</h3>
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
			</div>

		<!-- Level 1: Inside a folder — show subfolders -->
		{:else if !selectedSubfolder && currentFolder}
			<div class="subfolder-grid" in:fade>
				{#each currentFolder.subfolders as subfolder}
					{@const sfStats = getSubfolderStats(subfolder)}
					<button class="subfolder-tile" onclick={() => navigateToSubfolder(subfolder)}>
						<div class="subfolder-tile-info">
							<h4>{subfolder.level || subfolder.subfolder || 'General'}</h4>
							<p class="text-muted">{subfolder.categories.length} categories • {subfolder.total_cards} cards</p>
						</div>
						<div class="subfolder-tile-progress">
							<div class="mini-progress-track">
								<div class="mini-progress-fill" style={`width: ${sfStats.percent}%`}></div>
							</div>
							<span class="folder-percent">{sfStats.correct} / {sfStats.total}</span>
						</div>
						<div class="folder-tile-arrow">›</div>
					</button>
				{/each}
			</div>

		<!-- Level 2: Inside a subfolder — show categories -->
		{:else if !selectedCategory && currentSubfolder}
			<div class="category-grid" in:fade>
				{#each currentSubfolder.categories as catGroup}
					{@const catStats = getCategoryStats(catGroup)}
					<button class="category-tile" onclick={() => navigateToCategory(catGroup.category)}>
						<div class="category-tile-info">
							<h5>{catGroup.category}</h5>
							<p class="text-muted">{catGroup.decks.length} decks • {catStats.total} cards</p>
						</div>
						<div class="subfolder-tile-progress">
							<div class="mini-progress-track">
								<div class="mini-progress-fill" style={`width: ${catStats.percent}%`}></div>
							</div>
							<span class="folder-percent">{catStats.correct} / {catStats.total}</span>
						</div>
						<div class="folder-tile-arrow">›</div>
					</button>
				{/each}
			</div>

		<!-- Level 3: Inside a category — show decks -->
		{:else if currentCategory}
			<div class="deck-list" in:fade>
				{#each currentCategory.decks as deck}
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
		{/if}
	{/if}
</div>

<style>
	/* Breadcrumb */
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-bottom: 1.5rem;
		padding: 0.75rem 1rem;
		background: var(--surface-color);
		border-radius: 0.75rem;
		font-size: 0.9rem;
		flex-wrap: wrap;
	}

	.breadcrumb-link {
		background: none;
		border: none;
		color: var(--accent-color);
		cursor: pointer;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		transition: background 0.15s ease;
	}

	.breadcrumb-link:hover {
		background: rgba(var(--accent-color-rgb, 74, 144, 226), 0.1);
	}

	.breadcrumb-sep {
		color: var(--text-muted);
		font-weight: 700;
	}

	.breadcrumb-current {
		font-weight: 700;
		color: var(--text-color);
		text-transform: capitalize;
	}

	/* Folder tiles */
	.folder-grid,
	.subfolder-grid,
	.category-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.folder-tile,
	.subfolder-tile,
	.category-tile {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		background: white;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
		text-align: left;
		width: 100%;
	}

	.folder-tile:hover,
	.subfolder-tile:hover,
	.category-tile:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
		border-color: var(--accent-color);
	}

	.folder-tile-icon {
		font-size: 2.25rem;
		flex-shrink: 0;
	}

	.folder-tile-info,
	.subfolder-tile-info,
	.category-tile-info {
		flex: 1;
		min-width: 0;
	}

	.folder-tile-info h3,
	.subfolder-tile-info h4,
	.category-tile-info h5 {
		margin: 0 0 0.25rem;
		text-transform: capitalize;
	}

	.folder-tile-progress,
	.subfolder-tile-progress {
		width: 120px;
		flex-shrink: 0;
		text-align: right;
	}

	.folder-percent {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-weight: 600;
		margin-top: 0.25rem;
		display: block;
	}

	.folder-tile-arrow {
		font-size: 1.5rem;
		color: var(--text-muted);
		font-weight: 700;
		flex-shrink: 0;
		transition: transform 0.15s ease, color 0.15s ease;
	}

	.folder-tile:hover .folder-tile-arrow,
	.subfolder-tile:hover .folder-tile-arrow,
	.category-tile:hover .folder-tile-arrow {
		transform: translateX(4px);
		color: var(--accent-color);
	}

	/* Deck list */
	.deck-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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

	.part-label {
		font-size: 0.85rem;
		font-weight: 600;
	}

	.deck-row-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		min-width: 100px;
	}

	/* Legacy public decks */
	.other-decks-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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

	/* Progress bars */
	.mini-progress {
		width: 100%;
		font-size: 0.75rem;
		color: var(--text-muted);
		text-align: right;
	}

	.mini-progress-track {
		width: 100%;
		height: 0.45rem;
		background: #dbe3ea;
		border-radius: 999px;
		overflow: hidden;
		margin-top: 0.35rem;
	}

	.mini-progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent-light) 0%, var(--accent-color) 100%);
		border-radius: inherit;
	}

	@media (max-width: 640px) {
		.folder-tile,
		.subfolder-tile,
		.category-tile {
			flex-wrap: wrap;
		}

		.folder-tile-progress,
		.subfolder-tile-progress {
			width: 100%;
		}

		.deck-row {
			flex-direction: column;
			align-items: stretch;
		}

		.deck-row-actions {
			align-items: stretch;
		}
	}
</style>
