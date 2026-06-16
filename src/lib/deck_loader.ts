import yaml from 'js-yaml';
import sampleYaml from './sample_deck.yaml?raw';

export interface Flashcard {
	indication: string;
	result: string;
	category?: string;
}

export function getGermanIdiomsDeck(): Flashcard[] {
	try {
		return yaml.load(sampleYaml) as Flashcard[];
	} catch (e) {
		console.error('Failed to parse sample deck yaml', e);
		return [];
	}
}
