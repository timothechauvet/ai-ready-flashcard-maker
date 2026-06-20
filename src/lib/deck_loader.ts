import yaml from 'js-yaml';
import sampleYaml from './sample_deck.yaml?raw';
import kannadaColorsYaml from './kannada_colors.yaml?raw';
import germanA11Yaml from './german/A1/A1.1.yaml?raw';
import germanA12Yaml from './german/A1/A1.2.yaml?raw';
import germanA21Yaml from './german/A2/A2.1.yaml?raw';
import germanA22Yaml from './german/A2/A2.2.yaml?raw';
import germanB11Yaml from './german/B1/B1.1.yaml?raw';
import germanB12Yaml from './german/B1/B1.2.yaml?raw';
import germanB21Yaml from './german/B2/B2.1.yaml?raw';
import germanB22Yaml from './german/B2/B2.2.yaml?raw';
import germanC11Yaml from './german/C1/C1.1.yaml?raw';
import germanC12Yaml from './german/C1/C1.2.yaml?raw';
import germanC21Yaml from './german/C2/C2.1.yaml?raw';
import germanC22Yaml from './german/C2/C2.2.yaml?raw';

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
	{
		id: 'german-a1-1',
		title: 'German A1.1',
		description: '136 cards • Foundational nouns, colors, and core beginner vocabulary',
		folder: 'German',
		subfolder: 'A1/A1.1',
		level: 'A1.1',
		cards: parseDeck(germanA11Yaml, 'german A1.1')
	},
	{
		id: 'german-a1-2',
		title: 'German A1.2',
		description: '126 cards • Beginner continuation with common nouns and essentials',
		folder: 'German',
		subfolder: 'A1/A1.2',
		level: 'A1.2',
		cards: parseDeck(germanA12Yaml, 'german A1.2')
	},
	{
		id: 'german-a2-1',
		title: 'German A2.1',
		description: '180 cards • High-frequency A2 vocabulary and everyday nouns',
		folder: 'German',
		subfolder: 'A2/A2.1',
		level: 'A2.1',
		cards: parseDeck(germanA21Yaml, 'german A2.1')
	},
	{
		id: 'german-a2-2',
		title: 'German A2.2',
		description: '180 cards • A2 continuation with practical everyday vocabulary',
		folder: 'German',
		subfolder: 'A2/A2.2',
		level: 'A2.2',
		cards: parseDeck(germanA22Yaml, 'german A2.2')
	},
	{
		id: 'german-b1-1',
		title: 'German B1.1',
		description: '220 cards • Lower-intermediate vocabulary and common abstract nouns',
		folder: 'German',
		subfolder: 'B1/B1.1',
		level: 'B1.1',
		cards: parseDeck(germanB11Yaml, 'german B1.1')
	},
	{
		id: 'german-b1-2',
		title: 'German B1.2',
		description: '220 cards • B1 continuation with broader daily-life vocabulary',
		folder: 'German',
		subfolder: 'B1/B1.2',
		level: 'B1.2',
		cards: parseDeck(germanB12Yaml, 'german B1.2')
	},
	{
		id: 'german-b2-1',
		title: 'German B2.1',
		description: '220 cards • Upper-intermediate nouns and wider working vocabulary',
		folder: 'German',
		subfolder: 'B2/B2.1',
		level: 'B2.1',
		cards: parseDeck(germanB21Yaml, 'german B2.1')
	},
	{
		id: 'german-b2-2',
		title: 'German B2.2',
		description: '220 cards • B2 continuation with richer vocabulary coverage',
		folder: 'German',
		subfolder: 'B2/B2.2',
		level: 'B2.2',
		cards: parseDeck(germanB22Yaml, 'german B2.2')
	},
	{
		id: 'german-c1-1',
		title: 'German C1.1',
		description: '237 cards • Advanced vocabulary, abstract terms, and nuanced usage',
		folder: 'German',
		subfolder: 'C1/C1.1',
		level: 'C1.1',
		cards: parseDeck(germanC11Yaml, 'german C1.1')
	},
	{
		id: 'german-c1-2',
		title: 'German C1.2',
		description: '237 cards • Advanced continuation with broader C1 vocabulary',
		folder: 'German',
		subfolder: 'C1/C1.2',
		level: 'C1.2',
		cards: parseDeck(germanC12Yaml, 'german C1.2')
	},
	{
		id: 'german-c2-1',
		title: 'German C2.1',
		description: '192 cards • Idioms, sayings, and near-native advanced vocabulary',
		folder: 'German',
		subfolder: 'C2/C2.1',
		level: 'C2.1',
		cards: parseDeck(germanC21Yaml, 'german C2.1')
	},
	{
		id: 'german-c2-2',
		title: 'German C2.2',
		description: '191 cards • Final advanced set with nuanced expressions and idioms',
		folder: 'German',
		subfolder: 'C2/C2.2',
		level: 'C2.2',
		cards: parseDeck(germanC22Yaml, 'german C2.2')
	}
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

export function getDeckById(deckId: string): Flashcard[] {
	return publicDecks.find((deck) => deck.id === deckId)?.cards ?? [];
}

export function getGermanDeckDefinitions(): DeckDefinition[] {
	return germanDeckDefinitions;
}

export function getGermanDeckProgressStats() {
	return germanDeckDefinitions.map((deck) => ({
		id: deck.id,
		title: deck.title,
		count: deck.cards.length
	}));
}

export function getGermanIdiomsDeck(): Flashcard[] {
	return getDeckById('german-idioms');
}

export function getGermanWordsDeck(): Flashcard[] {
	return getDeckById('german-a1-1');
}

export function getGermanC1Deck(): Flashcard[] {
	return getDeckById('german-c1-1');
}

export function getGermanNounsDeck(): Flashcard[] {
	return getDeckById('german-b1-1');
}

export function getGermanPartizipienDeck(): Flashcard[] {
	return getDeckById('german-c2-1');
}

export function getGermanSayingsDeck(): Flashcard[] {
	return getDeckById('german-c2-2');
}

export function getGermanWortschatzDeck(): Flashcard[] {
	return getDeckById('german-c1-2');
}

export function getKannadaColorsDeck(): Flashcard[] {
	return getDeckById('kannada-colors');
}

export function getGermanColorsDeck(): Flashcard[] {
	return getDeckById('german-a1-2');
}
