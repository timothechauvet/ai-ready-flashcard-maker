<script lang="ts">
	import { page } from '$app/stores';
	import { getGermanIdiomsDeck, getGermanWordsDeck, type Flashcard } from '$lib/deck_loader';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let deckId = $derived($page.params.deckId);

	// Flashcard state
	let cards = $state<Flashcard[]>([]);
	let currentIndex = $state(0);
	let isFlipped = $state(false);
	let correctCount = $state(0);
	let incorrectCount = $state(0);

	// Undo stack
	interface HistoryState {
		currentIndex: number;
		isFlipped: boolean;
		correctCount: number;
		incorrectCount: number;
	}
	let history = $state<HistoryState[]>([]);

	onMount(() => {
		if (deckId === 'german-idioms') {
			cards = getGermanIdiomsDeck();
		} else if (deckId === 'german-words') {
			cards = getGermanWordsDeck();
		}
	});

	const currentCard = $derived(cards[currentIndex] || null);

	function saveToHistory() {
		history.push({
			currentIndex,
			isFlipped,
			correctCount,
			incorrectCount
		});
	}

	function handleFlip() {
		isFlipped = !isFlipped;
	}

	function handleSwipeLeft() {
		if (!currentCard) return;
		saveToHistory();
		incorrectCount += 1;
		nextCard();
	}

	function handleSwipeRight() {
		if (!currentCard) return;
		saveToHistory();
		correctCount += 1;
		nextCard();
	}

	function nextCard() {
		isFlipped = false;
		if (currentIndex < cards.length - 1) {
			currentIndex += 1;
		} else {
			// Loop or finish state: here loop back to start
			currentIndex = 0;
		}
	}

	function handleUndo() {
		if (history.length === 0) return;
		const previous = history.pop()!;
		currentIndex = previous.currentIndex;
		isFlipped = previous.isFlipped;
		correctCount = previous.correctCount;
		incorrectCount = previous.incorrectCount;
	}
</script>

<svelte:head>
	<title>Play Flashcards - YASSSF</title>
</svelte:head>

{#if cards.length === 0}
	<div
		class="card"
		style="max-width: 600px; margin: 0 auto; text-align: center; padding: 3rem 1.5rem;"
	>
		<h3>Loading Deck...</h3>
	</div>
{:else}
	<div class="play-container animate-fade-in">
		<!-- Top Bar Controls & Stats -->
		<div class="top-bar">
			<a href={`${base}/explore`} class="close-btn" aria-label="Exit session">✕</a>
			<span class="progress-indicator">
				{currentIndex + 1} / {cards.length}
			</span>
			<div style="width: 24px;"></div>
			<!-- spacer -->
		</div>

		<!-- Sub-Header Scoreboard -->
		<div class="scoreboard">
			<span class="score-incorrect">Need to revise: {incorrectCount}</span>
			<span class="score-correct">I know: {correctCount}</span>
		</div>

		<!-- Central Card Area -->
		<div
			class="flashcard-wrapper"
			onclick={handleFlip}
			onkeydown={(e) => e.key === ' ' && handleFlip()}
			role="button"
			tabindex="0"
		>
			<div class="flashcard {isFlipped ? 'flipped' : ''}">
				<div class="card-side card-front">
					<p class="card-text">{currentCard?.indication}</p>
				</div>
				<div class="card-side card-back">
					<p class="card-text">{currentCard?.result}</p>
				</div>
			</div>
		</div>

		<!-- Instructions / Curved arrows design -->
		<div class="flip-hint">
			<svg class="flip-arrow-icon" viewBox="0 0 24 24" width="24" height="24">
				<path
					fill="currentColor"
					d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1L5 16l4-4H6z"
				/>
			</svg>
			<span>Tap card to flip</span>
		</div>

		<!-- Bottom Bar Controls -->
		<div class="bottom-bar">
			<button
				class="action-btn undo-btn"
				onclick={handleUndo}
				disabled={history.length === 0}
				aria-label="Undo"
			>
				<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
					<path d="M3 3v5h5"/>
				</svg>
			</button>

			<div class="swipe-buttons">
				<button class="action-btn incorrect-btn" onclick={handleSwipeLeft}> ✕ Need to revise </button>
				<button class="action-btn correct-btn" onclick={handleSwipeRight}> ✓ I know </button>
			</div>
		</div>
	</div>
{/if}

<style>
	.play-container {
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0;
	}

	.top-bar {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 0.5rem;
	}

	.close-btn {
		font-size: 1.5rem;
		color: var(--text-muted);
		line-height: 1;
		cursor: pointer;
	}

	.progress-indicator {
		font-weight: 600;
		color: var(--text-muted);
	}

	.scoreboard {
		display: flex;
		gap: 2rem;
		font-size: 1.25rem;
		font-weight: 700;
	}

	.score-incorrect {
		color: var(--danger-color);
	}

	.score-correct {
		color: var(--success-color);
	}

	/* Central Card Area */
	.flashcard-wrapper {
		width: 100%;
		height: 280px;
		perspective: 1000px;
		cursor: pointer;
		outline: none;
	}

	.flashcard {
		position: relative;
		width: 100%;
		height: 100%;
		text-align: center;
		transition: transform 0.6s;
		transform-style: preserve-3d;
	}

	.flashcard.flipped {
		transform: rotateY(180deg);
	}

	.card-side {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		border-radius: 1.5rem;
		border: 1px solid var(--border-color);
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.05),
			0 4px 6px -2px rgba(0, 0, 0, 0.03);
		background-color: white;
	}

	.card-front {
		color: var(--text-color);
	}

	.card-back {
		transform: rotateY(180deg);
		background-color: var(--surface-color);
		color: var(--accent-color);
	}

	.card-category {
		position: absolute;
		top: 1.5rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 700;
		color: var(--accent-light);
		background-color: rgba(82, 121, 111, 0.1);
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
	}

	.card-text {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.5;
	}

	.flip-hint {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.flip-arrow-icon {
		color: var(--text-muted);
	}

	/* Bottom Bar Controls */
	.bottom-bar {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1rem;
	}

	.swipe-buttons {
		display: flex;
		gap: 1rem;
		flex: 1;
		justify-content: flex-end;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		border-radius: 0.75rem;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.undo-btn {
		width: 44px;
		height: 44px;
		background-color: var(--surface-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
	}

	.undo-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.undo-btn:not(:disabled):hover {
		background-color: var(--border-color);
	}

	.incorrect-btn {
		padding: 0.6rem 1rem;
		background-color: #fee2e2;
		color: #b91c1c;
		border: 1px solid #fca5a5;
		font-size: 0.9rem;
	}

	.incorrect-btn:hover {
		background-color: #fca5a5;
	}

	.correct-btn {
		padding: 0.6rem 1rem;
		background-color: #d1fae5;
		color: #047857;
		border: 1px solid #6ee7b7;
		font-size: 0.9rem;
	}

	.correct-btn:hover {
		background-color: #6ee7b7;
	}
</style>
