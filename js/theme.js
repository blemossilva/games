import { setItem, getItem } from './storage.js';

const THEME_KEY = 'theme_preference';

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}

export function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  });

  // Aplicar tema inicial
  const savedTheme = getItem(THEME_KEY);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme(systemPrefersDark ? 'dark' : 'light');
  }
}
