import yaml from 'js-yaml';
import sampleYaml from './sample_deck.yaml?raw';
import kannadaColorsYaml from './kannada_colors.yaml?raw';
import german_a11_adjectivesYaml from './german/A1/A1.1/adjectives.yaml?raw';
import german_a11_adverbsYaml from './german/A1/A1.1/adverbs.yaml?raw';
import german_a11_nounsYaml from './german/A1/A1.1/nouns.yaml?raw';
import german_a11_phrasesYaml from './german/A1/A1.1/phrases.yaml?raw';
import german_a11_verbsYaml from './german/A1/A1.1/verbs.yaml?raw';
import german_a12_adjectivesYaml from './german/A1/A1.2/adjectives.yaml?raw';
import german_a12_adverbsYaml from './german/A1/A1.2/adverbs.yaml?raw';
import german_a12_nounsYaml from './german/A1/A1.2/nouns.yaml?raw';
import german_a12_phrasesYaml from './german/A1/A1.2/phrases.yaml?raw';
import german_a12_verbsYaml from './german/A1/A1.2/verbs.yaml?raw';
import german_a21_adjectivesYaml from './german/A2/A2.1/adjectives.yaml?raw';
import german_a21_adverbsYaml from './german/A2/A2.1/adverbs.yaml?raw';
import german_a21_nounsYaml from './german/A2/A2.1/nouns.yaml?raw';
import german_a21_phrasesYaml from './german/A2/A2.1/phrases.yaml?raw';
import german_a21_verbsYaml from './german/A2/A2.1/verbs.yaml?raw';
import german_a22_adjectivesYaml from './german/A2/A2.2/adjectives.yaml?raw';
import german_a22_adverbsYaml from './german/A2/A2.2/adverbs.yaml?raw';
import german_a22_nounsYaml from './german/A2/A2.2/nouns.yaml?raw';
import german_a22_phrasesYaml from './german/A2/A2.2/phrases.yaml?raw';
import german_a22_verbsYaml from './german/A2/A2.2/verbs.yaml?raw';
import german_b11_adjectivesYaml from './german/B1/B1.1/adjectives.yaml?raw';
import german_b11_adverbsYaml from './german/B1/B1.1/adverbs.yaml?raw';
import german_b11_nounsYaml from './german/B1/B1.1/nouns.yaml?raw';
import german_b11_phrasesYaml from './german/B1/B1.1/phrases.yaml?raw';
import german_b11_verbsYaml from './german/B1/B1.1/verbs.yaml?raw';
import german_b12_adjectivesYaml from './german/B1/B1.2/adjectives.yaml?raw';
import german_b12_adverbsYaml from './german/B1/B1.2/adverbs.yaml?raw';
import german_b12_nounsYaml from './german/B1/B1.2/nouns.yaml?raw';
import german_b12_phrasesYaml from './german/B1/B1.2/phrases.yaml?raw';
import german_b12_verbsYaml from './german/B1/B1.2/verbs.yaml?raw';
import german_b21_adjectivesYaml from './german/B2/B2.1/adjectives.yaml?raw';
import german_b21_adverbsYaml from './german/B2/B2.1/adverbs.yaml?raw';
import german_b21_nounsYaml from './german/B2/B2.1/nouns.yaml?raw';
import german_b21_phrasesYaml from './german/B2/B2.1/phrases.yaml?raw';
import german_b21_verbsYaml from './german/B2/B2.1/verbs.yaml?raw';
import german_b22_adjectivesYaml from './german/B2/B2.2/adjectives.yaml?raw';
import german_b22_adverbsYaml from './german/B2/B2.2/adverbs.yaml?raw';
import german_b22_nounsYaml from './german/B2/B2.2/nouns.yaml?raw';
import german_b22_phrasesYaml from './german/B2/B2.2/phrases.yaml?raw';
import german_b22_verbsYaml from './german/B2/B2.2/verbs.yaml?raw';
import german_c11_adjectivesYaml from './german/C1/C1.1/adjectives.yaml?raw';
import german_c11_adverbsYaml from './german/C1/C1.1/adverbs.yaml?raw';
import german_c11_nounsYaml from './german/C1/C1.1/nouns.yaml?raw';
import german_c11_phrasesYaml from './german/C1/C1.1/phrases.yaml?raw';
import german_c11_verbsYaml from './german/C1/C1.1/verbs.yaml?raw';
import german_c12_adjectivesYaml from './german/C1/C1.2/adjectives.yaml?raw';
import german_c12_adverbsYaml from './german/C1/C1.2/adverbs.yaml?raw';
import german_c12_nounsYaml from './german/C1/C1.2/nouns.yaml?raw';
import german_c12_phrasesYaml from './german/C1/C1.2/phrases.yaml?raw';
import german_c12_verbsYaml from './german/C1/C1.2/verbs.yaml?raw';
import german_c21_adjectivesYaml from './german/C2/C2.1/adjectives.yaml?raw';
import german_c21_adverbsYaml from './german/C2/C2.1/adverbs.yaml?raw';
import german_c21_nounsYaml from './german/C2/C2.1/nouns.yaml?raw';
import german_c21_phrasesYaml from './german/C2/C2.1/phrases.yaml?raw';
import german_c21_verbsYaml from './german/C2/C2.1/verbs.yaml?raw';
import german_c22_adjectivesYaml from './german/C2/C2.2/adjectives.yaml?raw';
import german_c22_adverbsYaml from './german/C2/C2.2/adverbs.yaml?raw';
import german_c22_nounsYaml from './german/C2/C2.2/nouns.yaml?raw';
import german_c22_phrasesYaml from './german/C2/C2.2/phrases.yaml?raw';
import german_c22_verbsYaml from './german/C2/C2.2/verbs.yaml?raw';

export interface Flashcard {
	indication: string;
	result: string;
	pronunciation?: string;
	clue?: string;
}

export interface DeckDefinition {
	id: string;
	title: string;
	description: string;
	folder?: string;
	subfolder?: string;
	level?: string;
	category?: string;
	cards: Flashcard[];
}

function parseDeck(rawYaml: string, label: string): Flashcard[] {
	try {
		return (yaml.load(rawYaml) as Flashcard[]) ?? [];
	} catch (e) {
		console.error(`Failed to parse ${label} yaml`, e);
		return [];
	}
}

const germanDeckDefinitions: DeckDefinition[] = [
	(() => {
		const german_a11_adjectivesCards = parseDeck(german_a11_adjectivesYaml, 'german A1.1 adjectives');
		return {
			id: 'german-a1-1-adjectives',
			title: 'German A1.1 • Adjectives',
			description: `${german_a11_adjectivesCards.length} cards • Adjectives deck for A1.1`,
			folder: 'German',
			subfolder: 'A1/A1.1',
			level: 'A1.1',
			category: 'adjectives',
			cards: german_a11_adjectivesCards
		};
	})(),
	(() => {
		const german_a11_adverbsCards = parseDeck(german_a11_adverbsYaml, 'german A1.1 adverbs');
		return {
			id: 'german-a1-1-adverbs',
			title: 'German A1.1 • Adverbs',
			description: `${german_a11_adverbsCards.length} cards • Adverbs deck for A1.1`,
			folder: 'German',
			subfolder: 'A1/A1.1',
			level: 'A1.1',
			category: 'adverbs',
			cards: german_a11_adverbsCards
		};
	})(),
	(() => {
		const german_a11_nounsCards = parseDeck(german_a11_nounsYaml, 'german A1.1 nouns');
		return {
			id: 'german-a1-1-nouns',
			title: 'German A1.1 • Nouns',
			description: `${german_a11_nounsCards.length} cards • Nouns deck for A1.1`,
			folder: 'German',
			subfolder: 'A1/A1.1',
			level: 'A1.1',
			category: 'nouns',
			cards: german_a11_nounsCards
		};
	})(),
	(() => {
		const german_a11_phrasesCards = parseDeck(german_a11_phrasesYaml, 'german A1.1 phrases');
		return {
			id: 'german-a1-1-phrases',
			title: 'German A1.1 • Phrases',
			description: `${german_a11_phrasesCards.length} cards • Phrases deck for A1.1`,
			folder: 'German',
			subfolder: 'A1/A1.1',
			level: 'A1.1',
			category: 'phrases',
			cards: german_a11_phrasesCards
		};
	})(),
	(() => {
		const german_a11_verbsCards = parseDeck(german_a11_verbsYaml, 'german A1.1 verbs');
		return {
			id: 'german-a1-1-verbs',
			title: 'German A1.1 • Verbs',
			description: `${german_a11_verbsCards.length} cards • Verbs deck for A1.1`,
			folder: 'German',
			subfolder: 'A1/A1.1',
			level: 'A1.1',
			category: 'verbs',
			cards: german_a11_verbsCards
		};
	})(),
	(() => {
		const german_a12_adjectivesCards = parseDeck(german_a12_adjectivesYaml, 'german A1.2 adjectives');
		return {
			id: 'german-a1-2-adjectives',
			title: 'German A1.2 • Adjectives',
			description: `${german_a12_adjectivesCards.length} cards • Adjectives deck for A1.2`,
			folder: 'German',
			subfolder: 'A1/A1.2',
			level: 'A1.2',
			category: 'adjectives',
			cards: german_a12_adjectivesCards
		};
	})(),
	(() => {
		const german_a12_adverbsCards = parseDeck(german_a12_adverbsYaml, 'german A1.2 adverbs');
		return {
			id: 'german-a1-2-adverbs',
			title: 'German A1.2 • Adverbs',
			description: `${german_a12_adverbsCards.length} cards • Adverbs deck for A1.2`,
			folder: 'German',
			subfolder: 'A1/A1.2',
			level: 'A1.2',
			category: 'adverbs',
			cards: german_a12_adverbsCards
		};
	})(),
	(() => {
		const german_a12_nounsCards = parseDeck(german_a12_nounsYaml, 'german A1.2 nouns');
		return {
			id: 'german-a1-2-nouns',
			title: 'German A1.2 • Nouns',
			description: `${german_a12_nounsCards.length} cards • Nouns deck for A1.2`,
			folder: 'German',
			subfolder: 'A1/A1.2',
			level: 'A1.2',
			category: 'nouns',
			cards: german_a12_nounsCards
		};
	})(),
	(() => {
		const german_a12_phrasesCards = parseDeck(german_a12_phrasesYaml, 'german A1.2 phrases');
		return {
			id: 'german-a1-2-phrases',
			title: 'German A1.2 • Phrases',
			description: `${german_a12_phrasesCards.length} cards • Phrases deck for A1.2`,
			folder: 'German',
			subfolder: 'A1/A1.2',
			level: 'A1.2',
			category: 'phrases',
			cards: german_a12_phrasesCards
		};
	})(),
	(() => {
		const german_a12_verbsCards = parseDeck(german_a12_verbsYaml, 'german A1.2 verbs');
		return {
			id: 'german-a1-2-verbs',
			title: 'German A1.2 • Verbs',
			description: `${german_a12_verbsCards.length} cards • Verbs deck for A1.2`,
			folder: 'German',
			subfolder: 'A1/A1.2',
			level: 'A1.2',
			category: 'verbs',
			cards: german_a12_verbsCards
		};
	})(),
	(() => {
		const german_a21_adjectivesCards = parseDeck(german_a21_adjectivesYaml, 'german A2.1 adjectives');
		return {
			id: 'german-a2-1-adjectives',
			title: 'German A2.1 • Adjectives',
			description: `${german_a21_adjectivesCards.length} cards • Adjectives deck for A2.1`,
			folder: 'German',
			subfolder: 'A2/A2.1',
			level: 'A2.1',
			category: 'adjectives',
			cards: german_a21_adjectivesCards
		};
	})(),
	(() => {
		const german_a21_adverbsCards = parseDeck(german_a21_adverbsYaml, 'german A2.1 adverbs');
		return {
			id: 'german-a2-1-adverbs',
			title: 'German A2.1 • Adverbs',
			description: `${german_a21_adverbsCards.length} cards • Adverbs deck for A2.1`,
			folder: 'German',
			subfolder: 'A2/A2.1',
			level: 'A2.1',
			category: 'adverbs',
			cards: german_a21_adverbsCards
		};
	})(),
	(() => {
		const german_a21_nounsCards = parseDeck(german_a21_nounsYaml, 'german A2.1 nouns');
		return {
			id: 'german-a2-1-nouns',
			title: 'German A2.1 • Nouns',
			description: `${german_a21_nounsCards.length} cards • Nouns deck for A2.1`,
			folder: 'German',
			subfolder: 'A2/A2.1',
			level: 'A2.1',
			category: 'nouns',
			cards: german_a21_nounsCards
		};
	})(),
	(() => {
		const german_a21_phrasesCards = parseDeck(german_a21_phrasesYaml, 'german A2.1 phrases');
		return {
			id: 'german-a2-1-phrases',
			title: 'German A2.1 • Phrases',
			description: `${german_a21_phrasesCards.length} cards • Phrases deck for A2.1`,
			folder: 'German',
			subfolder: 'A2/A2.1',
			level: 'A2.1',
			category: 'phrases',
			cards: german_a21_phrasesCards
		};
	})(),
	(() => {
		const german_a21_verbsCards = parseDeck(german_a21_verbsYaml, 'german A2.1 verbs');
		return {
			id: 'german-a2-1-verbs',
			title: 'German A2.1 • Verbs',
			description: `${german_a21_verbsCards.length} cards • Verbs deck for A2.1`,
			folder: 'German',
			subfolder: 'A2/A2.1',
			level: 'A2.1',
			category: 'verbs',
			cards: german_a21_verbsCards
		};
	})(),
	(() => {
		const german_a22_adjectivesCards = parseDeck(german_a22_adjectivesYaml, 'german A2.2 adjectives');
		return {
			id: 'german-a2-2-adjectives',
			title: 'German A2.2 • Adjectives',
			description: `${german_a22_adjectivesCards.length} cards • Adjectives deck for A2.2`,
			folder: 'German',
			subfolder: 'A2/A2.2',
			level: 'A2.2',
			category: 'adjectives',
			cards: german_a22_adjectivesCards
		};
	})(),
	(() => {
		const german_a22_adverbsCards = parseDeck(german_a22_adverbsYaml, 'german A2.2 adverbs');
		return {
			id: 'german-a2-2-adverbs',
			title: 'German A2.2 • Adverbs',
			description: `${german_a22_adverbsCards.length} cards • Adverbs deck for A2.2`,
			folder: 'German',
			subfolder: 'A2/A2.2',
			level: 'A2.2',
			category: 'adverbs',
			cards: german_a22_adverbsCards
		};
	})(),
	(() => {
		const german_a22_nounsCards = parseDeck(german_a22_nounsYaml, 'german A2.2 nouns');
		return {
			id: 'german-a2-2-nouns',
			title: 'German A2.2 • Nouns',
			description: `${german_a22_nounsCards.length} cards • Nouns deck for A2.2`,
			folder: 'German',
			subfolder: 'A2/A2.2',
			level: 'A2.2',
			category: 'nouns',
			cards: german_a22_nounsCards
		};
	})(),
	(() => {
		const german_a22_phrasesCards = parseDeck(german_a22_phrasesYaml, 'german A2.2 phrases');
		return {
			id: 'german-a2-2-phrases',
			title: 'German A2.2 • Phrases',
			description: `${german_a22_phrasesCards.length} cards • Phrases deck for A2.2`,
			folder: 'German',
			subfolder: 'A2/A2.2',
			level: 'A2.2',
			category: 'phrases',
			cards: german_a22_phrasesCards
		};
	})(),
	(() => {
		const german_a22_verbsCards = parseDeck(german_a22_verbsYaml, 'german A2.2 verbs');
		return {
			id: 'german-a2-2-verbs',
			title: 'German A2.2 • Verbs',
			description: `${german_a22_verbsCards.length} cards • Verbs deck for A2.2`,
			folder: 'German',
			subfolder: 'A2/A2.2',
			level: 'A2.2',
			category: 'verbs',
			cards: german_a22_verbsCards
		};
	})(),
	(() => {
		const german_b11_adjectivesCards = parseDeck(german_b11_adjectivesYaml, 'german B1.1 adjectives');
		return {
			id: 'german-b1-1-adjectives',
			title: 'German B1.1 • Adjectives',
			description: `${german_b11_adjectivesCards.length} cards • Adjectives deck for B1.1`,
			folder: 'German',
			subfolder: 'B1/B1.1',
			level: 'B1.1',
			category: 'adjectives',
			cards: german_b11_adjectivesCards
		};
	})(),
	(() => {
		const german_b11_adverbsCards = parseDeck(german_b11_adverbsYaml, 'german B1.1 adverbs');
		return {
			id: 'german-b1-1-adverbs',
			title: 'German B1.1 • Adverbs',
			description: `${german_b11_adverbsCards.length} cards • Adverbs deck for B1.1`,
			folder: 'German',
			subfolder: 'B1/B1.1',
			level: 'B1.1',
			category: 'adverbs',
			cards: german_b11_adverbsCards
		};
	})(),
	(() => {
		const german_b11_nounsCards = parseDeck(german_b11_nounsYaml, 'german B1.1 nouns');
		return {
			id: 'german-b1-1-nouns',
			title: 'German B1.1 • Nouns',
			description: `${german_b11_nounsCards.length} cards • Nouns deck for B1.1`,
			folder: 'German',
			subfolder: 'B1/B1.1',
			level: 'B1.1',
			category: 'nouns',
			cards: german_b11_nounsCards
		};
	})(),
	(() => {
		const german_b11_phrasesCards = parseDeck(german_b11_phrasesYaml, 'german B1.1 phrases');
		return {
			id: 'german-b1-1-phrases',
			title: 'German B1.1 • Phrases',
			description: `${german_b11_phrasesCards.length} cards • Phrases deck for B1.1`,
			folder: 'German',
			subfolder: 'B1/B1.1',
			level: 'B1.1',
			category: 'phrases',
			cards: german_b11_phrasesCards
		};
	})(),
	(() => {
		const german_b11_verbsCards = parseDeck(german_b11_verbsYaml, 'german B1.1 verbs');
		return {
			id: 'german-b1-1-verbs',
			title: 'German B1.1 • Verbs',
			description: `${german_b11_verbsCards.length} cards • Verbs deck for B1.1`,
			folder: 'German',
			subfolder: 'B1/B1.1',
			level: 'B1.1',
			category: 'verbs',
			cards: german_b11_verbsCards
		};
	})(),
	(() => {
		const german_b12_adjectivesCards = parseDeck(german_b12_adjectivesYaml, 'german B1.2 adjectives');
		return {
			id: 'german-b1-2-adjectives',
			title: 'German B1.2 • Adjectives',
			description: `${german_b12_adjectivesCards.length} cards • Adjectives deck for B1.2`,
			folder: 'German',
			subfolder: 'B1/B1.2',
			level: 'B1.2',
			category: 'adjectives',
			cards: german_b12_adjectivesCards
		};
	})(),
	(() => {
		const german_b12_adverbsCards = parseDeck(german_b12_adverbsYaml, 'german B1.2 adverbs');
		return {
			id: 'german-b1-2-adverbs',
			title: 'German B1.2 • Adverbs',
			description: `${german_b12_adverbsCards.length} cards • Adverbs deck for B1.2`,
			folder: 'German',
			subfolder: 'B1/B1.2',
			level: 'B1.2',
			category: 'adverbs',
			cards: german_b12_adverbsCards
		};
	})(),
	(() => {
		const german_b12_nounsCards = parseDeck(german_b12_nounsYaml, 'german B1.2 nouns');
		return {
			id: 'german-b1-2-nouns',
			title: 'German B1.2 • Nouns',
			description: `${german_b12_nounsCards.length} cards • Nouns deck for B1.2`,
			folder: 'German',
			subfolder: 'B1/B1.2',
			level: 'B1.2',
			category: 'nouns',
			cards: german_b12_nounsCards
		};
	})(),
	(() => {
		const german_b12_phrasesCards = parseDeck(german_b12_phrasesYaml, 'german B1.2 phrases');
		return {
			id: 'german-b1-2-phrases',
			title: 'German B1.2 • Phrases',
			description: `${german_b12_phrasesCards.length} cards • Phrases deck for B1.2`,
			folder: 'German',
			subfolder: 'B1/B1.2',
			level: 'B1.2',
			category: 'phrases',
			cards: german_b12_phrasesCards
		};
	})(),
	(() => {
		const german_b12_verbsCards = parseDeck(german_b12_verbsYaml, 'german B1.2 verbs');
		return {
			id: 'german-b1-2-verbs',
			title: 'German B1.2 • Verbs',
			description: `${german_b12_verbsCards.length} cards • Verbs deck for B1.2`,
			folder: 'German',
			subfolder: 'B1/B1.2',
			level: 'B1.2',
			category: 'verbs',
			cards: german_b12_verbsCards
		};
	})(),
	(() => {
		const german_b21_adjectivesCards = parseDeck(german_b21_adjectivesYaml, 'german B2.1 adjectives');
		return {
			id: 'german-b2-1-adjectives',
			title: 'German B2.1 • Adjectives',
			description: `${german_b21_adjectivesCards.length} cards • Adjectives deck for B2.1`,
			folder: 'German',
			subfolder: 'B2/B2.1',
			level: 'B2.1',
			category: 'adjectives',
			cards: german_b21_adjectivesCards
		};
	})(),
	(() => {
		const german_b21_adverbsCards = parseDeck(german_b21_adverbsYaml, 'german B2.1 adverbs');
		return {
			id: 'german-b2-1-adverbs',
			title: 'German B2.1 • Adverbs',
			description: `${german_b21_adverbsCards.length} cards • Adverbs deck for B2.1`,
			folder: 'German',
			subfolder: 'B2/B2.1',
			level: 'B2.1',
			category: 'adverbs',
			cards: german_b21_adverbsCards
		};
	})(),
	(() => {
		const german_b21_nounsCards = parseDeck(german_b21_nounsYaml, 'german B2.1 nouns');
		return {
			id: 'german-b2-1-nouns',
			title: 'German B2.1 • Nouns',
			description: `${german_b21_nounsCards.length} cards • Nouns deck for B2.1`,
			folder: 'German',
			subfolder: 'B2/B2.1',
			level: 'B2.1',
			category: 'nouns',
			cards: german_b21_nounsCards
		};
	})(),
	(() => {
		const german_b21_phrasesCards = parseDeck(german_b21_phrasesYaml, 'german B2.1 phrases');
		return {
			id: 'german-b2-1-phrases',
			title: 'German B2.1 • Phrases',
			description: `${german_b21_phrasesCards.length} cards • Phrases deck for B2.1`,
			folder: 'German',
			subfolder: 'B2/B2.1',
			level: 'B2.1',
			category: 'phrases',
			cards: german_b21_phrasesCards
		};
	})(),
	(() => {
		const german_b21_verbsCards = parseDeck(german_b21_verbsYaml, 'german B2.1 verbs');
		return {
			id: 'german-b2-1-verbs',
			title: 'German B2.1 • Verbs',
			description: `${german_b21_verbsCards.length} cards • Verbs deck for B2.1`,
			folder: 'German',
			subfolder: 'B2/B2.1',
			level: 'B2.1',
			category: 'verbs',
			cards: german_b21_verbsCards
		};
	})(),
	(() => {
		const german_b22_adjectivesCards = parseDeck(german_b22_adjectivesYaml, 'german B2.2 adjectives');
		return {
			id: 'german-b2-2-adjectives',
			title: 'German B2.2 • Adjectives',
			description: `${german_b22_adjectivesCards.length} cards • Adjectives deck for B2.2`,
			folder: 'German',
			subfolder: 'B2/B2.2',
			level: 'B2.2',
			category: 'adjectives',
			cards: german_b22_adjectivesCards
		};
	})(),
	(() => {
		const german_b22_adverbsCards = parseDeck(german_b22_adverbsYaml, 'german B2.2 adverbs');
		return {
			id: 'german-b2-2-adverbs',
			title: 'German B2.2 • Adverbs',
			description: `${german_b22_adverbsCards.length} cards • Adverbs deck for B2.2`,
			folder: 'German',
			subfolder: 'B2/B2.2',
			level: 'B2.2',
			category: 'adverbs',
			cards: german_b22_adverbsCards
		};
	})(),
	(() => {
		const german_b22_nounsCards = parseDeck(german_b22_nounsYaml, 'german B2.2 nouns');
		return {
			id: 'german-b2-2-nouns',
			title: 'German B2.2 • Nouns',
			description: `${german_b22_nounsCards.length} cards • Nouns deck for B2.2`,
			folder: 'German',
			subfolder: 'B2/B2.2',
			level: 'B2.2',
			category: 'nouns',
			cards: german_b22_nounsCards
		};
	})(),
	(() => {
		const german_b22_phrasesCards = parseDeck(german_b22_phrasesYaml, 'german B2.2 phrases');
		return {
			id: 'german-b2-2-phrases',
			title: 'German B2.2 • Phrases',
			description: `${german_b22_phrasesCards.length} cards • Phrases deck for B2.2`,
			folder: 'German',
			subfolder: 'B2/B2.2',
			level: 'B2.2',
			category: 'phrases',
			cards: german_b22_phrasesCards
		};
	})(),
	(() => {
		const german_b22_verbsCards = parseDeck(german_b22_verbsYaml, 'german B2.2 verbs');
		return {
			id: 'german-b2-2-verbs',
			title: 'German B2.2 • Verbs',
			description: `${german_b22_verbsCards.length} cards • Verbs deck for B2.2`,
			folder: 'German',
			subfolder: 'B2/B2.2',
			level: 'B2.2',
			category: 'verbs',
			cards: german_b22_verbsCards
		};
	})(),
	(() => {
		const german_c11_adjectivesCards = parseDeck(german_c11_adjectivesYaml, 'german C1.1 adjectives');
		return {
			id: 'german-c1-1-adjectives',
			title: 'German C1.1 • Adjectives',
			description: `${german_c11_adjectivesCards.length} cards • Adjectives deck for C1.1`,
			folder: 'German',
			subfolder: 'C1/C1.1',
			level: 'C1.1',
			category: 'adjectives',
			cards: german_c11_adjectivesCards
		};
	})(),
	(() => {
		const german_c11_adverbsCards = parseDeck(german_c11_adverbsYaml, 'german C1.1 adverbs');
		return {
			id: 'german-c1-1-adverbs',
			title: 'German C1.1 • Adverbs',
			description: `${german_c11_adverbsCards.length} cards • Adverbs deck for C1.1`,
			folder: 'German',
			subfolder: 'C1/C1.1',
			level: 'C1.1',
			category: 'adverbs',
			cards: german_c11_adverbsCards
		};
	})(),
	(() => {
		const german_c11_nounsCards = parseDeck(german_c11_nounsYaml, 'german C1.1 nouns');
		return {
			id: 'german-c1-1-nouns',
			title: 'German C1.1 • Nouns',
			description: `${german_c11_nounsCards.length} cards • Nouns deck for C1.1`,
			folder: 'German',
			subfolder: 'C1/C1.1',
			level: 'C1.1',
			category: 'nouns',
			cards: german_c11_nounsCards
		};
	})(),
	(() => {
		const german_c11_phrasesCards = parseDeck(german_c11_phrasesYaml, 'german C1.1 phrases');
		return {
			id: 'german-c1-1-phrases',
			title: 'German C1.1 • Phrases',
			description: `${german_c11_phrasesCards.length} cards • Phrases deck for C1.1`,
			folder: 'German',
			subfolder: 'C1/C1.1',
			level: 'C1.1',
			category: 'phrases',
			cards: german_c11_phrasesCards
		};
	})(),
	(() => {
		const german_c11_verbsCards = parseDeck(german_c11_verbsYaml, 'german C1.1 verbs');
		return {
			id: 'german-c1-1-verbs',
			title: 'German C1.1 • Verbs',
			description: `${german_c11_verbsCards.length} cards • Verbs deck for C1.1`,
			folder: 'German',
			subfolder: 'C1/C1.1',
			level: 'C1.1',
			category: 'verbs',
			cards: german_c11_verbsCards
		};
	})(),
	(() => {
		const german_c12_adjectivesCards = parseDeck(german_c12_adjectivesYaml, 'german C1.2 adjectives');
		return {
			id: 'german-c1-2-adjectives',
			title: 'German C1.2 • Adjectives',
			description: `${german_c12_adjectivesCards.length} cards • Adjectives deck for C1.2`,
			folder: 'German',
			subfolder: 'C1/C1.2',
			level: 'C1.2',
			category: 'adjectives',
			cards: german_c12_adjectivesCards
		};
	})(),
	(() => {
		const german_c12_adverbsCards = parseDeck(german_c12_adverbsYaml, 'german C1.2 adverbs');
		return {
			id: 'german-c1-2-adverbs',
			title: 'German C1.2 • Adverbs',
			description: `${german_c12_adverbsCards.length} cards • Adverbs deck for C1.2`,
			folder: 'German',
			subfolder: 'C1/C1.2',
			level: 'C1.2',
			category: 'adverbs',
			cards: german_c12_adverbsCards
		};
	})(),
	(() => {
		const german_c12_nounsCards = parseDeck(german_c12_nounsYaml, 'german C1.2 nouns');
		return {
			id: 'german-c1-2-nouns',
			title: 'German C1.2 • Nouns',
			description: `${german_c12_nounsCards.length} cards • Nouns deck for C1.2`,
			folder: 'German',
			subfolder: 'C1/C1.2',
			level: 'C1.2',
			category: 'nouns',
			cards: german_c12_nounsCards
		};
	})(),
	(() => {
		const german_c12_phrasesCards = parseDeck(german_c12_phrasesYaml, 'german C1.2 phrases');
		return {
			id: 'german-c1-2-phrases',
			title: 'German C1.2 • Phrases',
			description: `${german_c12_phrasesCards.length} cards • Phrases deck for C1.2`,
			folder: 'German',
			subfolder: 'C1/C1.2',
			level: 'C1.2',
			category: 'phrases',
			cards: german_c12_phrasesCards
		};
	})(),
	(() => {
		const german_c12_verbsCards = parseDeck(german_c12_verbsYaml, 'german C1.2 verbs');
		return {
			id: 'german-c1-2-verbs',
			title: 'German C1.2 • Verbs',
			description: `${german_c12_verbsCards.length} cards • Verbs deck for C1.2`,
			folder: 'German',
			subfolder: 'C1/C1.2',
			level: 'C1.2',
			category: 'verbs',
			cards: german_c12_verbsCards
		};
	})(),
	(() => {
		const german_c21_adjectivesCards = parseDeck(german_c21_adjectivesYaml, 'german C2.1 adjectives');
		return {
			id: 'german-c2-1-adjectives',
			title: 'German C2.1 • Adjectives',
			description: `${german_c21_adjectivesCards.length} cards • Adjectives deck for C2.1`,
			folder: 'German',
			subfolder: 'C2/C2.1',
			level: 'C2.1',
			category: 'adjectives',
			cards: german_c21_adjectivesCards
		};
	})(),
	(() => {
		const german_c21_adverbsCards = parseDeck(german_c21_adverbsYaml, 'german C2.1 adverbs');
		return {
			id: 'german-c2-1-adverbs',
			title: 'German C2.1 • Adverbs',
			description: `${german_c21_adverbsCards.length} cards • Adverbs deck for C2.1`,
			folder: 'German',
			subfolder: 'C2/C2.1',
			level: 'C2.1',
			category: 'adverbs',
			cards: german_c21_adverbsCards
		};
	})(),
	(() => {
		const german_c21_nounsCards = parseDeck(german_c21_nounsYaml, 'german C2.1 nouns');
		return {
			id: 'german-c2-1-nouns',
			title: 'German C2.1 • Nouns',
			description: `${german_c21_nounsCards.length} cards • Nouns deck for C2.1`,
			folder: 'German',
			subfolder: 'C2/C2.1',
			level: 'C2.1',
			category: 'nouns',
			cards: german_c21_nounsCards
		};
	})(),
	(() => {
		const german_c21_phrasesCards = parseDeck(german_c21_phrasesYaml, 'german C2.1 phrases');
		return {
			id: 'german-c2-1-phrases',
			title: 'German C2.1 • Phrases',
			description: `${german_c21_phrasesCards.length} cards • Phrases deck for C2.1`,
			folder: 'German',
			subfolder: 'C2/C2.1',
			level: 'C2.1',
			category: 'phrases',
			cards: german_c21_phrasesCards
		};
	})(),
	(() => {
		const german_c21_verbsCards = parseDeck(german_c21_verbsYaml, 'german C2.1 verbs');
		return {
			id: 'german-c2-1-verbs',
			title: 'German C2.1 • Verbs',
			description: `${german_c21_verbsCards.length} cards • Verbs deck for C2.1`,
			folder: 'German',
			subfolder: 'C2/C2.1',
			level: 'C2.1',
			category: 'verbs',
			cards: german_c21_verbsCards
		};
	})(),
	(() => {
		const german_c22_adjectivesCards = parseDeck(german_c22_adjectivesYaml, 'german C2.2 adjectives');
		return {
			id: 'german-c2-2-adjectives',
			title: 'German C2.2 • Adjectives',
			description: `${german_c22_adjectivesCards.length} cards • Adjectives deck for C2.2`,
			folder: 'German',
			subfolder: 'C2/C2.2',
			level: 'C2.2',
			category: 'adjectives',
			cards: german_c22_adjectivesCards
		};
	})(),
	(() => {
		const german_c22_adverbsCards = parseDeck(german_c22_adverbsYaml, 'german C2.2 adverbs');
		return {
			id: 'german-c2-2-adverbs',
			title: 'German C2.2 • Adverbs',
			description: `${german_c22_adverbsCards.length} cards • Adverbs deck for C2.2`,
			folder: 'German',
			subfolder: 'C2/C2.2',
			level: 'C2.2',
			category: 'adverbs',
			cards: german_c22_adverbsCards
		};
	})(),
	(() => {
		const german_c22_nounsCards = parseDeck(german_c22_nounsYaml, 'german C2.2 nouns');
		return {
			id: 'german-c2-2-nouns',
			title: 'German C2.2 • Nouns',
			description: `${german_c22_nounsCards.length} cards • Nouns deck for C2.2`,
			folder: 'German',
			subfolder: 'C2/C2.2',
			level: 'C2.2',
			category: 'nouns',
			cards: german_c22_nounsCards
		};
	})(),
	(() => {
		const german_c22_phrasesCards = parseDeck(german_c22_phrasesYaml, 'german C2.2 phrases');
		return {
			id: 'german-c2-2-phrases',
			title: 'German C2.2 • Phrases',
			description: `${german_c22_phrasesCards.length} cards • Phrases deck for C2.2`,
			folder: 'German',
			subfolder: 'C2/C2.2',
			level: 'C2.2',
			category: 'phrases',
			cards: german_c22_phrasesCards
		};
	})(),
	(() => {
		const german_c22_verbsCards = parseDeck(german_c22_verbsYaml, 'german C2.2 verbs');
		return {
			id: 'german-c2-2-verbs',
			title: 'German C2.2 • Verbs',
			description: `${german_c22_verbsCards.length} cards • Verbs deck for C2.2`,
			folder: 'German',
			subfolder: 'C2/C2.2',
			level: 'C2.2',
			category: 'verbs',
			cards: german_c22_verbsCards
		};
	})(),
];

const legacyDeckDefinitions: DeckDefinition[] = [
	{
		id: 'german-idioms',
		title: 'German Idioms & Nuances',
		description: '10 cards • Advanced German vocabulary and expressions',
		cards: parseDeck(sampleYaml, 'sample deck')
	},
	{
		id: 'kannada-colors',
		title: 'Kannada Colors',
		description: '10 cards • Colors in Kannada script with pronunciation',
		cards: parseDeck(kannadaColorsYaml, 'kannada colors')
	}
];

export const publicDecks: DeckDefinition[] = [...germanDeckDefinitions, ...legacyDeckDefinitions];

export function getDeckById(deckId: string): Flashcard[] { return publicDecks.find((deck) => deck.id === deckId)?.cards ?? []; }

export function getGermanDeckDefinitions(): DeckDefinition[] { return germanDeckDefinitions; }

export function getGermanSubfolderDefinitions() {
	const grouped = new Map<string, DeckDefinition[]>();
	for (const deck of germanDeckDefinitions) {
		const key = deck.subfolder ?? '';
		grouped.set(key, [...(grouped.get(key) ?? []), deck]);
	}
	return [...grouped.entries()].map(([subfolder, decks]) => ({
		subfolder,
		level: decks[0]?.level ?? '',
		decks: decks.sort((a, b) => a.category!.localeCompare(b.category!)),
		totalCards: decks.reduce((sum, deck) => sum + deck.cards.length, 0)
	}));
}

export function getGermanDeckProgressStats() { return germanDeckDefinitions.map((deck) => ({ id: deck.id, title: deck.title, count: deck.cards.length })); }

export function getGermanIdiomsDeck(): Flashcard[] { return getDeckById('german-idioms'); }
export function getGermanWordsDeck(): Flashcard[] { return getDeckById('german-a1-1-nouns'); }
export function getGermanC1Deck(): Flashcard[] { return getDeckById('german-c1-1-nouns'); }
export function getGermanNounsDeck(): Flashcard[] { return getDeckById('german-b1-1-nouns'); }
export function getGermanPartizipienDeck(): Flashcard[] { return getDeckById('german-c2-2-phrases'); }
export function getGermanSayingsDeck(): Flashcard[] { return getDeckById('german-c2-2-phrases'); }
export function getGermanWortschatzDeck(): Flashcard[] { return getDeckById('german-c1-2-nouns'); }
export function getKannadaColorsDeck(): Flashcard[] { return getDeckById('kannada-colors'); }
export function getGermanColorsDeck(): Flashcard[] { return getDeckById('german-a1-1-nouns'); }
