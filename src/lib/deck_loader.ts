import yaml from 'js-yaml';
import sampleYaml from './sample_deck.yaml?raw';
import kannadaColorsYaml from './kannada_colors.yaml?raw';
import drJainDeck1Yaml from './dr_jain_deck_1.yaml?raw';

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
	author?: string | null;
	organization?: string | null;
	folder?: string;
	subfolder?: string;
	level?: string;
	category?: string;
	part?: number | null;
	cards: Flashcard[];
}

function parseDeck(rawYaml: string, label: string): Flashcard[] {
	try {
		const data = yaml.load(rawYaml);
		if (Array.isArray(data)) return data as Flashcard[];
		if (data && typeof data === 'object' && 'cards' in data && Array.isArray((data as any).cards)) {
			return (data as any).cards as Flashcard[];
		}
		return [];
	} catch (e) {
		console.error(`Failed to parse ${label} yaml`, e);
		return [];
	}
}

// Eagerly import all German YAML files at build time via Vite glob
const germanYamlModules = import.meta.glob<string>(
	'./german/**/*.yaml',
	{ eager: true, query: '?raw', import: 'default' }
);

interface ParsedPath {
	level: string;      // e.g. "A1"
	sublevel: string;   // e.g. "A1.1"
	category: string;   // e.g. "nouns"
	part: number | null; // e.g. 3 or null for unsplit
}

function parseGermanPath(importPath: string): ParsedPath | null {
	// Match: ./german/A1/A1.1/nouns_3.yaml  or  ./german/A1/A1.1/verbs.yaml
	const match = importPath.match(
		/\.\/german\/([A-C]\d)\/([A-C]\d\.\d)\/([a-z]+?)(?:_(\d+))?\.yaml$/
	);
	if (!match) return null;
	const [, level, sublevel, category, partStr] = match;
	return { level, sublevel, category, part: partStr ? parseInt(partStr) : null };
}

function buildGermanDecks(): DeckDefinition[] {
	const decks: DeckDefinition[] = [];

	for (const [importPath, rawYaml] of Object.entries(germanYamlModules)) {
		const parsed = parseGermanPath(importPath);
		if (!parsed) continue; // skip level-aggregate files like A1.1.yaml

		const { level, sublevel, category, part } = parsed;
		const cards = parseDeck(rawYaml, `german ${sublevel} ${category}${part ? ` part ${part}` : ''}`);
		if (cards.length === 0) continue;

		const partSuffix = part !== null ? `-pt${part}` : '';
		const partLabel = part !== null ? ` (${part})` : '';
		const id = `german-${sublevel.replace('.', '-').toLowerCase()}-${category}${partSuffix}`;

		decks.push({
			id,
			title: `German ${sublevel} • ${capitalize(category)}${partLabel}`,
			description: `${cards.length} cards • ${capitalize(category)} deck for ${sublevel}${partLabel}`,
			folder: 'German',
			subfolder: `${level}/${sublevel}`,
			level: sublevel,
			category,
			part,
			cards
		});
	}

	// Sort: by level, then category, then part
	decks.sort((a, b) => {
		const la = a.level ?? '', lb = b.level ?? '';
		if (la !== lb) return la.localeCompare(lb);
		const ca = a.category ?? '', cb = b.category ?? '';
		if (ca !== cb) return ca.localeCompare(cb);
		return (a.part ?? 0) - (b.part ?? 0);
	});

	return decks;
}

const categoryLabels: Record<string, string> = {
	verbspraposition: 'Verben mit Präpositionen'
};

function capitalize(s: string): string {
	return categoryLabels[s] ?? s.charAt(0).toUpperCase() + s.slice(1);
}

const germanDeckDefinitions: DeckDefinition[] = buildGermanDecks();

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
	},
	{
		id: 'dr-jain-deck-1',
		title: 'German with Dr. Jain • Deck 1',
		description: '20 cards • German verbs with conjugations',
		author: 'Dr. Jain',
		organization: 'German with Dr. Jain',
		cards: parseDeck(drJainDeck1Yaml, 'dr jain deck 1')
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
		decks: decks.sort((a, b) => {
			const ca = a.category ?? '', cb = b.category ?? '';
			if (ca !== cb) return ca.localeCompare(cb);
			return (a.part ?? 0) - (b.part ?? 0);
		}),
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
