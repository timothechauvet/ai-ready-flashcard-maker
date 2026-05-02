<script lang="ts">
  import { page } from '$app/stores';
  
  let deckId = $derived($page.params.deckId);
  let mode = $state('sequential'); // sequential or random
</script>

<svelte:head>
  <title>Play Flashcards - YASSSF</title>
</svelte:head>

<div class="card" style="max-width: 600px; margin: 0 auto; text-align: center;">
  <h2>Deck: {deckId}</h2>
  
  <div style="margin: 1rem 0;">
    <button class="btn {mode === 'sequential' ? 'btn-primary' : 'btn-secondary'}" onclick={() => mode = 'sequential'}>Sequential</button>
    <button class="btn {mode === 'random' ? 'btn-primary' : 'btn-secondary'}" onclick={() => mode = 'random'}>Random</button>
  </div>
  
  <div style="min-height: 200px; display: flex; align-items: center; justify-content: center; border: 2px dashed var(--border-color); border-radius: 0.5rem;">
    <p class="text-muted">Flashcard placeholder</p>
  </div>
</div>
