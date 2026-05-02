<script lang="ts">
  // Upload page
  let fileInput: HTMLInputElement;
  
  function handleUpload() {
    // YAML parsing and Supabase upload logic will go here
  }

  const aiPrompt = `Act as an expert educator. Generate a high-quality flashcard deck in YAML format about [TOPIC].
The output must be a valid YAML list of objects with these exact fields:
- indication: (string, required) The question or front side of the card.
- result: (string, required) The answer, meaning, or back side of the card.
- picture_url: (string, optional) A direct URL to a relevant image.
- category: (string, optional) A tag or category for organization.

Example format:
- indication: "What is the capital of Japan?"
  result: "Tokyo"
  category: "Geography"
- indication: "What does HTML stand for?"
  result: "HyperText Markup Language"
  category: "Technology"

Ensure the YAML is clean and correctly indented. Total content must be under 1MB.`;

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
    <p class="text-muted">Upload your YAML file (max 1MB) to create a new deck.</p>
    
    <div style="margin-top: 1.5rem;">
      <input type="file" accept=".yaml,.yml" bind:this={fileInput} style="margin-bottom: 1rem;" />
      <button class="btn btn-primary" onclick={handleUpload}>Upload Deck</button>
    </div>
  </div>

  <div class="card" style="border-left: 4px solid var(--accent-color);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3>AI Generator Prompt</h3>
      <button class="btn btn-secondary" onclick={copyPrompt} style="font-size: 0.8rem;">
        Copy Prompt
      </button>
    </div>
    <p class="text-muted" style="margin-bottom: 1rem;">
      Copy this prompt and paste it into an AI (like ChatGPT or Claude) to generate a compatible flashcard deck instantly.
    </p>
    <pre style="background: var(--surface-color); padding: 1rem; border-radius: 0.5rem; font-size: 0.85rem; white-space: pre-wrap; color: var(--accent-color); border: 1px solid var(--border-color);">
{aiPrompt}
    </pre>
  </div>
</div>
