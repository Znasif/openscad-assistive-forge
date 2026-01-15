<template>
  <header class="header">
    <div class="header-content">
      <div class="header-text">
        <h1>{{ title }}</h1>
        <p v-if="description" class="description">{{ description }}</p>
      </div>
      
      <div class="header-actions">
        <button
          @click="toggleTheme"
          class="icon-button"
          aria-label="Toggle theme"
          :title="`Theme: ${theme}`"
        >
          {{ getThemeIcon() }}
        </button>
        
        <button
          @click="$emit('copy-link')"
          class="icon-button"
          aria-label="Copy share link"
          title="Copy share link"
        >
          🔗
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';

defineProps({
  title: String,
  description: String,
});

defineEmits(['copy-link']);

const theme = ref('auto');

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'auto';
  theme.value = savedTheme;
  applyTheme(savedTheme);
});

const applyTheme = (newTheme) => {
  if (newTheme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', newTheme);
  }
};

const toggleTheme = () => {
  const themes = ['auto', 'light', 'dark'];
  const currentIndex = themes.indexOf(theme.value);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  
  theme.value = nextTheme;
  localStorage.setItem('theme', nextTheme);
  applyTheme(nextTheme);
};

const getThemeIcon = () => {
  if (theme.value === 'dark') return '☀️';
  if (theme.value === 'light') return '🌙';
  return '🌗';
};
</script>
