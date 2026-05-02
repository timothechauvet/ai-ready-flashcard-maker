<script lang="ts">
  // Upload page
  let fileInput: HTMLInputElement;
  
  function handleUpload() {
    // YAML parsing and Supabase upload logic will go here
  }
</script>

<svelte:head>
  <title>Upload Deck - YASSSF</title>
</svelte:head>

<div class="card" style="max-width: 600px; margin: 0 auto;">
  <h2>Upload Flashcards</h2>
  <p class="text-muted">Upload your YAML file (max 1MB) with your flashcards.</p>
  
  <div style="margin-top: 1.5rem;">
    <input type="file" accept=".yaml,.yml" bind:this={fileInput} style="margin-bottom: 1rem;" />
    <button class="btn btn-primary" onclick={handleUpload}>Upload Deck</button>
  </div>
</div>
