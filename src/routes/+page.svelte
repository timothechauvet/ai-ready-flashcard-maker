<script lang="ts">
  // Home page
</script>

<svelte:head>
  <title>YASSSF - AI-Ready Flashcards</title>
  <meta name="description" content="Yet Another Simple Shared Study Flashcards. AI-ready, mobile-first, lightning fast learning." />
</svelte:head>

<div class="hero animate-fade-in">
    <h3>AI-Ready Generation</h3>
    <p class="text-muted">
      Generate flashcards instantly using ChatGPT or Claude. Just copy our prompt, give it a topic, and import the YAML file.
    </p>
  </div>

  <div class="card animate-fade-in" style="animation-delay: 0.2s;">
    <div class="icon">📱</div>
    <h3>Mobile-First Design</h3>
    <p class="text-muted">
      Study on the go with a buttery smooth, dynamic interface designed perfectly for your phone, while looking premium on desktop.
    </p>
  </div>

  <div class="card animate-fade-in" style="animation-delay: 0.3s;">
    <div class="icon">🤝</div>
    <h3>Shared Learning</h3>
    <p class="text-muted">
      Browse public decks created by the community. Flag incorrect cards, save favorites, and share your knowledge with the world.
    </p>
  </div>
</div>

<style>
  .hero {
    text-align: center;
    padding: 4rem 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .hero h1 {
    font-size: clamp(2.5rem, 5vw, 4rem);
    line-height: 1.1;
    margin-bottom: 1.5rem;
    color: var(--text-color);
  }

  .hero h1::after {
    content: '.';
    color: var(--accent-color);
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--text-muted);
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }

  .cta-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-lg {
    padding: 0.75rem 2rem;
    font-size: 1.125rem;
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem 0 4rem;
  }

  .features .card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem;
  }

  .features .icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: var(--surface-color);
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
  }

  .features h3 {
    margin-bottom: 0.75rem;
  }

  /* Ensure card delays work nicely with base animation */
  .animate-fade-in {
    opacity: 0;
    animation: fadeIn 0.6s ease-out forwards;
  }
</style>
