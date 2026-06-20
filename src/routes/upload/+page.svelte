<script lang="ts">
	import yaml from 'js-yaml';
	import { env } from '$env/dynamic/public';

	const API_BASE = env.PUBLIC_API_URL || 'https://api.yasssf.com';

	let fileInput: HTMLInputElement;
	let deckTitle = $state('');
	let deckFolder = $state('');
	let deckCategory = $state('');
	let errorMsg = $state('');
	let successMsg = $state('');
	let isUploading = $state(false);

	async function handleUpload() {
		errorMsg = '';
		successMsg = '';

		if (!fileInput.files || fileInput.files.length === 0) {
			errorMsg = 'Please select a file to upload.';
			return;
		}

		const file = fileInput.files[0];

		if (file.size > 2 * 1024 * 1024) {
			errorMsg = 'File size exceeds 2MB limit.';
			return;
		}

		// Client-side YAML validation
		try {
			const text = await file.text();
			const data = yaml.load(text);
			if (!Array.isArray(data)) {
				errorMsg = 'YAML must contain a list of flashcard objects.';
				return;
			}
			const isValid = data.every((item: unknown) => {
				if (typeof item !== 'object' || item === null) return false;
				const obj = item as Record<string, unknown>;
				return typeof obj.indication === 'string' && typeof obj.result === 'string';
			});
			if (!isValid) {
				errorMsg = 'Invalid format. Each card must have "indication" and "result" fields.';
				return;
			}
		} catch (e) {
			const parseError = e as Error;
			errorMsg = 'Invalid YAML format: ' + parseError.message;
			return;
		}

		isUploading = true;

		try {
			const formData = new FormData();
			formData.append('file', file);
			if (deckTitle.trim()) formData.append('title', deckTitle.trim());
			if (deckFolder.trim()) formData.append('folder', deckFolder.trim());
			if (deckCategory.trim()) formData.append('category', deckCategory.trim());

			const res = await fetch(`${API_BASE}/decks/import`, {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({ detail: res.statusText }));
				errorMsg = err.detail || `Upload failed (${res.status})`;
				return;
			}

			const result = await res.json();
			successMsg = result.message || `Successfully uploaded ${result.card_count} cards!`;

			fileInput.value = '';
			deckTitle = '';
			deckFolder = '';
			deckCategory = '';
		} catch (err) {
			const uploadError = err as Error;
			errorMsg = 'An unexpected error occurred: ' + uploadError.message;
		} finally {
			isUploading = false;
		}
	}

	const aiPrompt = `Act as an expert educator. Generate a high-quality flashcard deck in YAML format about [TOPIC].
The output must be a valid YAML list of objects with these exact fields:
- indication: (string, required) The question or front side of the card.
- result: (string, required) The answer, meaning, or back side of the card.
- picture_url: (string, optional) A direct URL to a relevant image.

Example format:
- indication: "What is the capital of Japan?"
  result: "Tokyo"
- indication: "What does HTML stand for?"
  result: "HyperText Markup Language"

Ensure the YAML is clean and correctly indented. Total content must be under 2MB.`;

	function copyPrompt() {
		navigator.clipboard.writeText(aiPrompt);
		alert('Prompt copied to clipboard!');
	}
</script>

<svelte:head>
	<title>Upload Deck - YASSSF</title>
</svelte:head>

<div style="display: flex; flex-direction: column; gap: 2rem; max-width: 800px; margin: 0 auto;">
	<div class="card">
		<h2>Upload Flashcards</h2>
		<p class="text-muted">Upload your YAML file (max 2MB) to create a new deck.</p>

		{#if errorMsg}
			<div
				style="background: #ffebee; color: #c62828; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;"
			>
				{errorMsg}
			</div>
		{/if}

		{#if successMsg}
			<div
				style="background: #e8f5e9; color: #2e7d32; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;"
			>
				{successMsg}
			</div>
		{/if}

		<div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
			<div class="form-group">
				<label for="deckTitle" style="display: block; margin-bottom: 0.5rem; font-weight: 600;"
					>Deck Title (Optional)</label
				>
				<input
					type="text"
					id="deckTitle"
					placeholder="e.g. Japanese Kanji N5"
					bind:value={deckTitle}
					disabled={isUploading}
				/>
				<small class="text-muted">If left blank, the filename will be used.</small>
			</div>

			<div class="form-group">
				<label for="deckFolder" style="display: block; margin-bottom: 0.5rem; font-weight: 600;"
					>Collection / Folder (Optional)</label
				>
				<input
					type="text"
					id="deckFolder"
					placeholder="e.g. Japanese"
					bind:value={deckFolder}
					disabled={isUploading}
				/>
			</div>

			<div class="form-group">
				<label for="deckCategory" style="display: block; margin-bottom: 0.5rem; font-weight: 600;"
					>Category (Optional)</label
				>
				<input
					type="text"
					id="deckCategory"
					placeholder="e.g. verbs, nouns, phrases"
					bind:value={deckCategory}
					disabled={isUploading}
				/>
			</div>

			<div class="form-group">
				<label for="file" style="display: block; margin-bottom: 0.5rem; font-weight: 600;"
					>YAML File</label
				>
				<input
					type="file"
					id="file"
					accept=".yaml,.yml"
					bind:this={fileInput}
					disabled={isUploading}
				/>
			</div>

			<button
				class="btn btn-primary"
				onclick={handleUpload}
				disabled={isUploading}
				style="width: 100%; margin-top: 0.5rem;"
			>
				{isUploading ? 'Uploading...' : 'Upload Deck'}
			</button>
		</div>
	</div>

	<div class="card" style="border-left: 4px solid var(--accent-color);">
		<div
			style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"
		>
			<h3>AI Generator Prompt</h3>
			<button class="btn btn-secondary" onclick={copyPrompt} style="font-size: 0.8rem;">
				Copy Prompt
			</button>
		</div>
		<p class="text-muted" style="margin-bottom: 1rem;">
			Copy this prompt and paste it into an AI (like ChatGPT or Claude) to generate a compatible
			flashcard deck instantly.
		</p>
		<pre
			style="background: var(--surface-color); padding: 1rem; border-radius: 0.5rem; font-size: 0.85rem; white-space: pre-wrap; color: var(--accent-color); border: 1px solid var(--border-color);">
{aiPrompt}
    </pre>
	</div>
</div>
