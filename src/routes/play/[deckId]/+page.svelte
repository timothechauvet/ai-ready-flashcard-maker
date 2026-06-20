<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { getDeckById, type Flashcard } from '$lib/deck_loader';
	import { onMount, tick } from 'svelte';
	import { base } from '$app/paths';
	import { env } from '$env/dynamic/public';
	import confetti from 'canvas-confetti';

	const API_BASE = env.PUBLIC_API_URL || 'https://api.yasssf.com';

	let deckId = $derived($page.params.deckId ?? '');

	// Flashcard state
	let cards = $state<Flashcard[]>([]);
	let isLoading = $state(true);
	let loadError = $state('');
	let activeIndices = $state<number[]>([]);
	let currentActivePointer = $state(0);
	// We want to hold a separate display index that updates immediately on next card IF the card is NOT flipped.
	// But if the card IS flipped, we transition/flip it back first, and only update the display index AFTER the flip animation completes (e.g. 300-600ms).
	let displayActivePointer = $state(0);
	let isFlipped = $state(false);
	let correctCount = $state(0);
	let incorrectCount = $state(0);
	let showFinishScreen = $state(false);
	let skipFlipAnimation = $state(false);
	let isRandom = $state(false);
	let autoListen = $state(false);
	let flipCount = $state(0);
	let showFlipClue = $state(true);
	let currentUtterance: SpeechSynthesisUtterance | null = null;
	let speechStartedAt = 0;
	const LISTEN_INTERRUPT_DELAY_MS = 3000;

	// Undo stack
	interface HistoryState {
		activeIndices: number[];
		currentActivePointer: number;
		isFlipped: boolean;
		correctCount: number;
		incorrectCount: number;
		showFinishScreen: boolean;
		isRandom: boolean;
		autoListen: boolean;
	}
	let history = $state<HistoryState[]>([]);

	onMount(() => {
		const match = document.cookie.match(/(?:^|; )flipCount=([^;]*)/);
		if (match) {
			flipCount = parseInt(match[1], 10) || 0;
			if (flipCount >= 3) {
				showFlipClue = false;
			}
		}
	});

	$effect(() => {
		if (!browser) return;
		localStorage.setItem(
			`yasssf-progress:${deckId}`,
			JSON.stringify({ correctCount, incorrectCount, remainingCount: activeIndices.length })
		);
	});

	$effect(() => {
		// Reset state when deckId changes
		isFlipped = false;
		correctCount = 0;
		incorrectCount = 0;
		showFinishScreen = false;
		history = [];
		currentActivePointer = 0;
		displayActivePointer = 0;
		isLoading = true;
		loadError = '';

		let loadedCards = getDeckById(deckId);
		
		if (loadedCards.length > 0) {
			cards = loadedCards;
			activeIndices = loadedCards.map((_, i) => i);
			displayActivePointer = 0;
			isLoading = false;
		} else {
			// Fetch from backend
			fetch(`${API_BASE}/decks/${deckId}`)
				.then(res => {
					if (!res.ok) throw new Error('Deck not found');
					return res.json();
				})
				.then(data => {
					cards = data.cards || [];
					activeIndices = cards.map((_, i) => i);
					displayActivePointer = 0;
					isLoading = false;
				})
				.catch(err => {
					console.error(err);
					loadError = 'Could not load deck. It may have been deleted or is unavailable.';
					isLoading = false;
				});
		}
	});

	const currentCardIndex = $derived(activeIndices[displayActivePointer] ?? -1);
	const currentCard = $derived(currentCardIndex !== -1 ? cards[currentCardIndex] : null);

	function saveToHistory() {
		history.push({
			activeIndices: [...activeIndices],
			currentActivePointer: displayActivePointer,
			isFlipped,
			correctCount,
			incorrectCount,
			showFinishScreen,
			isRandom,
			autoListen
		});
	}

	function handleFlip() {
		isFlipped = !isFlipped;
		if (isFlipped && showFlipClue) {
			flipCount++;
			document.cookie = `flipCount=${flipCount}; path=/; max-age=31536000`;
			if (flipCount >= 3) {
				showFlipClue = false;
			}
		}
	}

	function speakWord(text: string | undefined, options?: { allowInterrupt?: boolean }) {
		if (!text) return;

		const now = Date.now();
		const isSpeaking = window.speechSynthesis.speaking;
		const canInterrupt = now - speechStartedAt >= LISTEN_INTERRUPT_DELAY_MS;

		if (isSpeaking) {
			if (!options?.allowInterrupt || !canInterrupt) return;
			window.speechSynthesis.cancel();
		}

		const cleanText = text.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
		const utterance = new SpeechSynthesisUtterance(cleanText);
		currentUtterance = utterance;

		utterance.onstart = () => {
			speechStartedAt = Date.now();
		};

		utterance.onend = () => {
			if (currentUtterance === utterance) {
				currentUtterance = null;
				speechStartedAt = 0;
			}
		};

		utterance.onerror = () => {
			if (currentUtterance === utterance) {
				currentUtterance = null;
				speechStartedAt = 0;
			}
		};
		
		// Set language dynamically
		if (deckId.startsWith('kannada-')) {
			utterance.lang = 'kn-IN';
			const voices = window.speechSynthesis.getVoices();
			const knVoice = voices.find(v => v.lang.startsWith('kn'));
			if (knVoice) {
				utterance.voice = knVoice;
			}
		} else {
			utterance.lang = 'de-DE';
			const voices = window.speechSynthesis.getVoices();
			const deVoice = voices.find(v => v.lang.startsWith('de'));
			if (deVoice) {
				utterance.voice = deVoice;
			}
		}
		
		window.speechSynthesis.speak(utterance);
	}

	function handleSwipeLeft() {
		if (!currentCard) return;
		saveToHistory();
		incorrectCount += 1;
		nextCard(false);
	}

	async function handleSwipeRight() {
		if (!currentCard) return;
		saveToHistory();
		correctCount += 1;
		nextCard(true);
	}

	function nextCard(isKnown: boolean) {
		const originalActivePointer = displayActivePointer;
		let nextPointer = displayActivePointer;

		if (isKnown) {
			// Remove card from active list
			activeIndices = activeIndices.filter((_, idx) => idx !== originalActivePointer);
			// Determine next index
			if (activeIndices.length > 0) {
				if (isRandom) {
					nextPointer = Math.floor(Math.random() * activeIndices.length);
				} else if (displayActivePointer >= activeIndices.length) {
					nextPointer = 0;
				}
			}
		} else {
			// Kept in deck, advance pointer to next active card
			if (activeIndices.length > 0) {
				if (isRandom) {
					// Pick a random index that is different if possible
					if (activeIndices.length > 1) {
						let newPointer = displayActivePointer;
						while (newPointer === displayActivePointer) {
							newPointer = Math.floor(Math.random() * activeIndices.length);
						}
						nextPointer = newPointer;
					}
				} else {
					nextPointer = (displayActivePointer + 1) % activeIndices.length;
				}
			}
		}

		if (activeIndices.length === 0) {
			isFlipped = false;
			showFinishScreen = true;
			triggerConfetti();
		} else {
			if (isFlipped) {
				// Instantly snap to the front without animation, showing the next card
				skipFlipAnimation = true;
				isFlipped = false;
				displayActivePointer = nextPointer;
				if (autoListen) {
					tick().then(() => {
						speakWord(currentCard?.indication);
					});
				}
				// Restore animation class after the browser processes the instant snap
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						skipFlipAnimation = false;
					});
				});
			} else {
				// If the card is NOT flipped (still showing the front), update displayActivePointer immediately.
				displayActivePointer = nextPointer;
				if (autoListen) {
					tick().then(() => {
						speakWord(currentCard?.indication);
					});
				}
			}
		}
	}

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 }
		});
	}

	function handleUndo() {
		if (history.length === 0) return;
		const previous = history.pop()!;
		activeIndices = previous.activeIndices;
		displayActivePointer = previous.currentActivePointer;
		isFlipped = previous.isFlipped;
		correctCount = previous.correctCount;
		incorrectCount = previous.incorrectCount;
		showFinishScreen = previous.showFinishScreen;
		isRandom = previous.isRandom;
		autoListen = previous.autoListen;
	}

	function handleReplay() {
		saveToHistory();
		activeIndices = cards.map((_, i) => i);
		isFlipped = false;
		correctCount = 0;
		incorrectCount = 0;
		showFinishScreen = false;
		if (isRandom) {
			displayActivePointer = Math.floor(Math.random() * activeIndices.length);
		} else {
			displayActivePointer = 0;
		}
	}

	function toggleRandom() {
		saveToHistory();
		isRandom = !isRandom;
		if (isRandom && activeIndices.length > 0) {
			displayActivePointer = Math.floor(Math.random() * activeIndices.length);
		}
	}
</script>

<svelte:head>
	<title>Play Flashcards - YASSSF</title>
</svelte:head>

{#if isLoading}
	<div class="card" style="max-width: 600px; margin: 0 auto; text-align: center; padding: 3rem 1.5rem;">
		<h3>Loading Deck...</h3>
	</div>
{:else if loadError}
	<div class="card" style="max-width: 600px; margin: 0 auto; text-align: center; padding: 3rem 1.5rem;">
		<h3 style="color: var(--danger-color);">{loadError}</h3>
		<a href="{base}/explore" class="btn btn-primary" style="margin-top: 1.5rem;">Back to Explore</a>
	</div>
{:else if cards.length === 0}
	<div class="card" style="max-width: 600px; margin: 0 auto; text-align: center; padding: 3rem 1.5rem;">
		<h3>Deck empty or not found.</h3>
		<a href="{base}/explore" class="btn btn-primary" style="margin-top: 1.5rem;">Back to Explore</a>
	</div>
{:else if showFinishScreen}
	<div class="play-container animate-fade-in finish-screen">
		<div class="finish-content card">
			<div class="trophy-icon">🎉</div>
			<h2>You got it!</h2>
			<p class="text-muted">You finished the deck. All cards are learned!</p>
			
			<div class="stats-summary">
				<div class="stat-box">
					<span class="stat-val">{correctCount}</span>
					<span class="stat-lbl">Known</span>
				</div>
				<div class="stat-box">
					<span class="stat-val">{incorrectCount}</span>
					<span class="stat-lbl">Revisions</span>
				</div>
			</div>

			<div class="finish-actions">
				<button class="btn btn-primary" onclick={handleReplay}>Replay Deck</button>
				<a href={`${base}/explore`} class="btn btn-secondary">Public Decks</a>
			</div>
		</div>
	</div>
{:else}
	<div class="play-container animate-fade-in">
		<!-- Top Bar Controls & Stats -->
		<div class="top-bar" style="justify-content: center;">
			<div style="display: flex; align-items: center; gap: 1rem;">
				<button
					class="action-btn icon-btn {isRandom ? 'icon-btn-active' : ''}"
					onclick={toggleRandom}
					aria-label="Shuffle deck"
					title="Shuffle deck"
				>
					<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="16 3 21 3 21 8"/>
						<line x1="4" y1="20" x2="21" y2="3"/>
						<polyline points="21 16 21 21 16 21"/>
						<line x1="15" y1="15" x2="21" y2="21"/>
						<line x1="4" y1="4" x2="9" y2="9"/>
					</svg>
				</button>
				<div class="scoreboard-inline">
					<span class="score-incorrect">Need to revise: {incorrectCount}</span>
					<span class="score-correct">I know: {correctCount}</span>
				</div>
			</div>
		</div>

		<!-- Central Card Area -->
		<div style="display: flex; flex-direction: column; width: 100%; align-items: center; gap: 0.5rem;">
			<div
				class="flashcard-wrapper"
				onclick={handleFlip}
				onkeydown={(e) => e.key === ' ' && handleFlip()}
				role="button"
				tabindex="0"
			>
				<div class="flashcard {isFlipped ? 'flipped' : ''} {skipFlipAnimation ? 'no-transition' : ''}">
					<div class="card-side card-front">
						<span class="card-counter">{displayActivePointer + 1} / {activeIndices.length}</span>
						<p class="card-text">{currentCard?.indication}</p>
						{#if currentCard?.clue && !deckId.startsWith('german-colors')}
							<p class="clue-text" style="color: var(--text-muted); font-size: 1.1rem; font-style: italic; margin-top: 0.5rem;">
								{currentCard.clue}
							</p>
						{/if}
						{#if currentCard?.pronunciation}
							<p class="pronunciation-text" style="color: var(--text-muted); font-size: 1.1rem; font-family: monospace; margin-top: 0.25rem;">
								{currentCard.pronunciation}
							</p>
						{/if}
					</div>
					<div class="card-side card-back">
						<span class="card-counter">{displayActivePointer + 1} / {activeIndices.length}</span>
						{#if deckId.startsWith('german-colors') && currentCard?.clue}
							<p class="card-text" style="color: {currentCard.clue}; font-weight: 700;">{currentCard?.result}</p>
						{:else}
							<p class="card-text">{currentCard?.result}</p>
						{/if}
						{#if currentCard?.clue && !deckId.startsWith('german-colors')}
							<p class="clue-text" style="color: var(--text-muted); font-size: 1.1rem; font-style: italic; margin-top: 0.5rem;">
								{currentCard.clue}
							</p>
						{/if}
					</div>
				</div>
			</div>

			<div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.25rem;">
				<button
					class="action-btn listen-btn"
					onclick={(e) => { e.stopPropagation(); speakWord(currentCard?.indication, { allowInterrupt: true }); }}
					aria-label="Speak pronunciation"
				>
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
						<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
					</svg>
					Listen
				</button>

				<button
					class="action-btn listen-btn {autoListen ? 'listen-btn-active' : ''}"
					onclick={(e) => { e.stopPropagation(); autoListen = !autoListen; }}
					aria-label="Toggle auto listen"
				>
					{#if autoListen}
						<!-- Volume Symbol -->
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
							<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
						</svg>
					{:else}
						<!-- Mute Symbol -->
						<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
							<line x1="23" y1="9" x2="17" y2="15"></line>
							<line x1="17" y1="9" x2="23" y2="15"></line>
						</svg>
					{/if}
					Auto listen
				</button>
			</div>
		</div>

		<!-- Instructions / Curved arrows design -->
		{#if showFlipClue}
			<div class="flip-hint" in:fade out:fade>
				<svg class="flip-arrow-icon" viewBox="0 0 24 24" width="24" height="24">
					<path
						fill="currentColor"
						d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1L5 16l4-4H6z"
					/>
				</svg>
				<span>Tap card to flip</span>
			</div>
		{/if}

		<!-- Bottom Bar Controls -->
		<div class="bottom-bar">
			<button
				class="action-btn undo-btn"
				onclick={handleUndo}
				disabled={history.length === 0}
				aria-label="Undo"
			>
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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

	.finish-screen {
		justify-content: center;
		padding-top: 2rem;
		gap: 1.5rem;
	}

	.finish-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 3rem 2rem;
		gap: 1rem;
	}

	.trophy-icon {
		font-size: 4rem;
	}

	.stats-summary {
		display: flex;
		gap: 2rem;
		margin: 1rem 0;
	}

	.stat-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--surface-color);
		padding: 0.75rem 1.5rem;
		border-radius: 1rem;
		min-width: 100px;
	}

	.stat-val {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--accent-color);
	}

	.stat-lbl {
		font-size: 0.8rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.finish-actions {
		display: flex;
		gap: 1rem;
		width: 100%;
		justify-content: center;
		margin-top: 1rem;
	}

	.finish-actions button, .finish-actions a {
		flex: 1;
		max-width: 180px;
		font-size: 0.9rem;
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

	.scoreboard-inline {
		display: flex;
		gap: 1.5rem;
		font-size: 0.95rem;
		font-weight: 700;
	}

	.random-toggle-label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		user-select: none;
	}

	.random-toggle-label input {
		width: auto;
		cursor: pointer;
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

	.flashcard.no-transition {
		transition: none !important;
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

	.card-counter {
		position: absolute;
		top: 1rem;
		left: 1rem;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-muted);
		background-color: rgba(0,0,0,0.05);
		padding: 0.25rem 0.6rem;
		border-radius: 0.5rem;
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

	/* Icon buttons (undo, shuffle) — same square style */
	.icon-btn,
	.undo-btn {
		width: 44px;
		height: 44px;
		background-color: var(--surface-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
	}

	.icon-btn-active {
		background-color: var(--accent-color);
		color: #ffffff;
		border-color: var(--accent-color);
	}

	.icon-btn:not(.icon-btn-active):hover,
	.undo-btn:not(:disabled):hover {
		background-color: var(--border-color);
	}

	.undo-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Listen / Auto-listen buttons — squircle like I-know / Need-to-revise */
	.listen-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		background-color: var(--surface-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		font-size: 0.9rem;
		font-weight: 700;
		border-radius: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.listen-btn:hover {
		background-color: var(--border-color);
	}

	.listen-btn-active {
		background-color: var(--accent-color);
		color: #ffffff;
		border-color: var(--accent-color);
	}

	.listen-btn-active:hover {
		background-color: var(--accent-hover);
		border-color: var(--accent-hover);
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
