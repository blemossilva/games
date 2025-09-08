import { setItem, getItem } from './storage.js';

const THEME_KEY = 'theme_preference';

const themes = [
  { id: 'light', name: '☀️ Claro', icon: '☀️' },
  { id: 'dark', name: '🌙 Escuro', icon: '🌙' },
  { id: 'ocean', name: '🌊 Oceano', icon: '🌊' },
  { id: 'sunset', name: '🌅 Pôr do Sol', icon: '🌅' },
  { id: 'forest', name: '🌲 Floresta', icon: '🌲' },
  { id: 'galaxy', name: '🌌 Galáxia', icon: '🌌' },
  { id: 'neon', name: '💎 Neon', icon: '💎' },
  { id: 'cherry', name: '🌸 Cerejeira', icon: '🌸' }
];

let currentThemeIndex = 0;

function applyTheme(themeId) {
  // Remove todas as classes de tema
  document.documentElement.classList.remove('dark-mode', 'ocean-theme', 'sunset-theme', 'forest-theme', 'galaxy-theme', 'neon-theme', 'cherry-theme');
  
  // Aplica o tema apropriado
  switch (themeId) {
    case 'dark':
      document.documentElement.classList.add('dark-mode');
      break;
    case 'ocean':
      document.documentElement.classList.add('ocean-theme');
      break;
    case 'sunset':
      document.documentElement.classList.add('sunset-theme');
      break;
    case 'forest':
      document.documentElement.classList.add('forest-theme');
      break;
    case 'galaxy':
      document.documentElement.classList.add('galaxy-theme');
      break;
    case 'neon':
      document.documentElement.classList.add('neon-theme');
      break;
    case 'cherry':
      document.documentElement.classList.add('cherry-theme');
      break;
    default:
      // light theme (sem classes adicionais)
      break;
  }
  
  // Atualiza o ícone do botão
  updateThemeToggleIcon(themeId);
}

function updateThemeToggleIcon(themeId) {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  const theme = themes.find(t => t.id === themeId);
  if (theme) {
    toggle.innerHTML = `<span class="icon">${theme.icon}</span>`;
    toggle.setAttribute('aria-label', `Tema atual: ${theme.name}. Clique para alterar tema.`);
  }
}

export function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex].id;
    setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  });

  // Aplicar tema inicial
  const savedTheme = getItem(THEME_KEY);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let initialTheme = 'light';
  if (savedTheme) {
    initialTheme = savedTheme;
    currentThemeIndex = themes.findIndex(t => t.id === savedTheme);
    if (currentThemeIndex === -1) currentThemeIndex = 0;
  } else {
    initialTheme = systemPrefersDark ? 'dark' : 'light';
    currentThemeIndex = themes.findIndex(t => t.id === initialTheme);
  }

  applyTheme(initialTheme);
}

export function getAvailableThemes() {
  return themes;
}
