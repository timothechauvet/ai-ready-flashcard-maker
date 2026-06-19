import yaml from 'js-yaml';
import sampleYaml from './sample_deck.yaml?raw';
import germanWordsYaml from './german_words.yaml?raw';

export interface Flashcard {
	indication: string;
	result: string;
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
