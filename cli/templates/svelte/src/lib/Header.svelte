<script>
  import { onMount, createEventDispatcher } from 'svelte';

  export let title;
  export let description = '';

  const dispatch = createEventDispatcher();

  let theme = 'auto';

  onMount(() => {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    theme = savedTheme;
    applyTheme(savedTheme);
  });

  function applyTheme(newTheme) {
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  }

  function toggleTheme() {
    const themes = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  }

  function getThemeIcon() {
    if (theme === 'dark') return '☀️';
    if (theme === 'light') return '🌙';
    return '🌗';
  }
</script>

<header class="header">
  <div class="header-content">
    <div class="header-text">
      <h1>{title}</h1>
      {#if description}
        <p class="description">{description}</p>
      {/if}
    </div>
    
    <div class="header-actions">
      <button
        on:click={toggleTheme}
        class="icon-button"
        aria-label="Toggle theme"
        title="Theme: {theme}"
      >
        {getThemeIcon()}
      </button>
      
      <button
        on:click={() => dispatch('copy-link')}
        class="icon-button"
        aria-label="Copy share link"
        title="Copy share link"
      >
        🔗
      </button>
    </div>
  </div>
</header>
