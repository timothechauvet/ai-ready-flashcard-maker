<script lang="ts">
	import yaml from 'js-yaml';
	import { env } from '$env/dynamic/public';

	const API_BASE = env.PUBLIC_API_URL || 'https://api.yasssf.com';

	let fileInput: HTMLInputElement;
	let deckTitle = $state('');
	let deckFolder = $state('');
	let deckCategory = $state('');
	let deckAuthor = $state('');
	let deckOrganization = $state('');
	let rawYamlText = $state('');
	let uploadMode = $state<'file' | 'text'>('text');
	let errorMsg = $state('');
	let successMsg = $state('');
	let isUploading = $state(false);

	async function handleUpload() {
		errorMsg = '';
		successMsg = '';

		let yamlContent = '';
		let defaultTitle = '';

		if (uploadMode === 'file') {
			if (!fileInput.files || fileInput.files.length === 0) {
				errorMsg = 'Please select a file to upload.';
				return;
			}
			const file = fileInput.files[0];
			if (file.size > 2 * 1024 * 1024) {
				errorMsg = 'File size exceeds 2MB limit.';
				return;
			}
			yamlContent = await file.text();
			defaultTitle = file.name.replace(/\.[^/.]+$/, '');
		} else {
			if (!rawYamlText.trim()) {
				errorMsg = 'Please paste some YAML content.';
				return;
			}
			yamlContent = rawYamlText;
			defaultTitle = 'Pasted Deck';
		}

		if (new Blob([yamlContent]).size > 2 * 1024 * 1024) {
			errorMsg = 'Content exceeds 2MB limit.';
			return;
		}

		// Client-side YAML validation
		try {
			const data = yaml.load(yamlContent);
			let cardsArray: unknown[] = [];
			
			if (Array.isArray(data)) {
				cardsArray = data;
			} else if (typeof data === 'object' && data !== null && 'cards' in data && Array.isArray((data as any).cards)) {
				cardsArray = (data as any).cards;
			} else {
				errorMsg = 'YAML must be a list of flashcards or a dictionary with a "cards" list.';
				return;
			}

			const isValid = cardsArray.every((item: unknown) => {
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
			const fileObj = new File([yamlContent], defaultTitle + '.yaml', { type: 'text/yaml' });
			formData.append('file', fileObj);
			if (deckTitle.trim()) formData.append('title', deckTitle.trim());
			if (deckFolder.trim()) formData.append('folder', deckFolder.trim());
			if (deckCategory.trim()) formData.append('category', deckCategory.trim());
			if (deckAuthor.trim()) formData.append('author', deckAuthor.trim());
			if (deckOrganization.trim()) formData.append('organization', deckOrganization.trim());

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

			if (fileInput) fileInput.value = '';
			rawYamlText = '';
			deckTitle = '';
			deckFolder = '';
			deckCategory = '';
			deckAuthor = '';
			deckOrganization = '';
		} catch (err) {
			const uploadError = err as Error;
			errorMsg = 'An unexpected error occurred: ' + uploadError.message;
		} finally {
			isUploading = false;
		}
	}

	const aiPrompt = `Act as an expert educator. Generate a high-quality flashcard deck in YAML format.
The output must be a valid YAML list of objects with these exact fields:
- indication: (string, required) The question or front side of the card.
- result: (string, required) The answer, meaning, or back side of the card.
- picture_url: (string, optional) A direct URL to a relevant image.

Example format:
- indication: "What is the capital of Japan?"
  result: "Tokyo"
- indication: "What does HTML stand for?"
  result: "HyperText Markup Language"

Ensure the YAML is clean and correctly indented. DO NOT include code fences like \`\`\`yaml or any other text/indication, just the raw YAML list itself.

Topic: `;

	async function copyPrompt() {
		try {
			await navigator.clipboard.writeText(aiPrompt);
			alert('Prompt copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
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
			<div class="tabs" style="display: flex; gap: 1rem; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
				<button 
					class="btn {uploadMode === 'text' ? 'btn-primary' : 'btn-secondary'}" 
					onclick={() => uploadMode = 'text'}
					style="flex: 1;"
				>
					Paste YAML
				</button>
				<button 
					class="btn {uploadMode === 'file' ? 'btn-primary' : 'btn-secondary'}" 
					onclick={() => uploadMode = 'file'}
					style="flex: 1;"
				>
					Upload File
				</button>
			</div>

			{#if uploadMode === 'file'}
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
			{:else}
				<div class="form-group">
					<label for="rawYaml" style="display: block; margin-bottom: 0.5rem; font-weight: 600;"
						>Paste YAML Content</label
					>
					<textarea
						id="rawYaml"
						rows="10"
						placeholder="- indication: 'Front'&#10;  result: 'Back'"
						bind:value={rawYamlText}
						disabled={isUploading}
						style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--border-color); font-family: monospace; resize: vertical;"
					></textarea>
				</div>
			{/if}

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
				<small class="text-muted">Overrides YAML metadata if present. If blank, YAML or filename is used.</small>
			</div>

			<div class="form-group" style="display: flex; gap: 1rem;">
				<div style="flex: 1;">
					<label for="deckAuthor" style="display: block; margin-bottom: 0.5rem; font-weight: 600;"
						>Author (Optional)</label
					>
					<input
						type="text"
						id="deckAuthor"
						placeholder="Your Name"
						bind:value={deckAuthor}
						disabled={isUploading}
					/>
				</div>
				<div style="flex: 1;">
					<label for="deckOrganization" style="display: block; margin-bottom: 0.5rem; font-weight: 600;"
						>Organization (Optional)</label
					>
					<input
						type="text"
						id="deckOrganization"
						placeholder="Your Org / School"
						bind:value={deckOrganization}
						disabled={isUploading}
					/>
				</div>
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
					>Category / Subfolder Path (Optional)</label
				>
				<input
					type="text"
					id="deckCategory"
					placeholder="e.g. nouns/level-1"
					bind:value={deckCategory}
					disabled={isUploading}
				/>
				<small class="text-muted">Use slashes (/) to create nested folders.</small>
			</div>

			<button
				class="btn btn-primary"
				onclick={handleUpload}
				disabled={isUploading}
				style="width: 100%; margin-top: 0.5rem;"
			>
				{isUploading ? 'Uploading...' : (uploadMode === 'file' ? 'Upload Deck' : 'Import Pasted YAML')}
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
