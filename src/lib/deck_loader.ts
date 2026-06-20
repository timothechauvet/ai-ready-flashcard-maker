import yaml from 'js-yaml';
import sampleYaml from './sample_deck.yaml?raw';
import germanWordsYaml from './german_words.yaml?raw';
import germanC1Yaml from './german_c1.yaml?raw';
import germanNounsYaml from './german_nouns.yaml?raw';
import germanPartizipienYaml from './german_partizipien.yaml?raw';
import germanSayingsYaml from './german_sayings.yaml?raw';
import germanWortschatzYaml from './german_wortschatz.yaml?raw';
import kannadaColorsYaml from './kannada_colors.yaml?raw';
import germanColorsYaml from './german_colors.yaml?raw';

export interface Flashcard {
	indication: string;
	result: string;
	pronunciation?: string;
	clue?: string;
}

export function getGermanIdiomsDeck(): Flashcard[] {
	try {
		return yaml.load(sampleYaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse sample deck yaml', e);
		return [];
	}
}

export function getGermanWordsDeck(): Flashcard[] {
	try {
		return yaml.load(germanWordsYaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse german words yaml', e);
		return [];
	}
}

export function getGermanC1Deck(): Flashcard[] {
	try {
		return yaml.load(germanC1Yaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse german c1 yaml', e);
		return [];
	}
}

export function getGermanNounsDeck(): Flashcard[] {
	try {
		return yaml.load(germanNounsYaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse german nouns yaml', e);
		return [];
	}
}

export function getGermanPartizipienDeck(): Flashcard[] {
	try {
		return yaml.load(germanPartizipienYaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse german partizipien yaml', e);
		return [];
	}
}

export function getGermanSayingsDeck(): Flashcard[] {
	try {
		return yaml.load(germanSayingsYaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse german sayings yaml', e);
		return [];
	}
}

export function getGermanWortschatzDeck(): Flashcard[] {
	try {
		return yaml.load(germanWortschatzYaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse german wortschatz yaml', e);
		return [];
	}
}

export function getKannadaColorsDeck(): Flashcard[] {
	try {
		return yaml.load(kannadaColorsYaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse kannada colors yaml', e);
		return [];
	}
}

export function getGermanColorsDeck(): Flashcard[] {
	try {
		return yaml.load(germanColorsYaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse german colors yaml', e);
		return [];
	}
}
