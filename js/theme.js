import { setItem, getItem } from './storage.js';

const THEME_KEY = 'theme_preference';

// Pop-Art Themes inspired by the logo
const themes = [
  { id: 'light', name: '☀️ Pop Art Claro', icon: '🎨' },
  { id: 'dark', name: '🌙 Neon Escuro', icon: '⚡' }
];

let currentThemeIndex = 0;

function applyTheme(themeId) {
  // Remove todas as classes de tema
  document.documentElement.classList.remove('dark-mode');
  document.documentElement.removeAttribute('data-theme');
  
  // Aplica o tema apropriado
  switch (themeId) {
    case 'dark':
      document.documentElement.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
      break;
    default:
      // light theme (pop-art padrão)
      document.documentElement.setAttribute('data-theme', 'light');
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
    toggle.setAttribute('aria-label', `Tema atual: ${theme.name}. Clique para alternar tema.`);
  }
}

export function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  // Style the toggle button with pop-art design
  toggle.style.cssText = `
    width: 60px;
    height: 60px;
    border: 4px solid var(--color-outline);
    border-radius: var(--border-radius);
    background: var(--pop-yellow);
    color: var(--pop-black);
    font-size: 1.5rem;
    cursor: pointer;
    transition: var(--transition-bounce);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
  `;

  toggle.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex].id;
    setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
    
    // Pop-art click animation
    toggle.style.transform = 'translateY(2px) translateX(2px)';
    toggle.style.boxShadow = '2px 2px 0px var(--color-outline)';
    setTimeout(() => {
      toggle.style.transform = '';
      toggle.style.boxShadow = 'var(--shadow)';
    }, 150);
  });

  toggle.addEventListener('mouseenter', () => {
    toggle.style.transform = 'translateY(-2px) translateX(-2px)';
    toggle.style.boxShadow = 'var(--shadow-hover), var(--glow-yellow)';
    toggle.style.background = 'var(--yellow-light)';
  });

  toggle.addEventListener('mouseleave', () => {
    toggle.style.transform = '';
    toggle.style.boxShadow = 'var(--shadow)';
    toggle.style.background = 'var(--pop-yellow)';
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