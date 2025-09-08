import { renderGameCards, renderFilterOptions } from './ui.js';
import { setupFilters } from './filters.js';
import { setupThemeToggle } from './theme.js';
import { setupAnnouncer } from './a11y.js';

const GAMES_URL = 'data/games.index.json';
const TAGS_URL = 'data/tags.json';

let allGames = [];

async function main() {
  document.getElementById('version').textContent = window.APP_VERSION || 'dev';
  setupThemeToggle();
  setupAnnouncer();
  setupMobileMenu();

  try {
    const [gamesResponse, tagsResponse] = await Promise.all([
      fetch(GAMES_URL),
      fetch(TAGS_URL)
    ]);

    if (!gamesResponse.ok || !tagsResponse.ok) {
      throw new Error('Não foi possível carregar os dados dos jogos.');
    }

    allGames = await gamesResponse.json();
    const tagsData = await tagsResponse.json();

    renderFilterOptions(tagsData);
    renderGameCards(allGames);
    setupFilters(allGames);

  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error);
    const grid = document.getElementById('games-grid');
    if (grid) {
      grid.innerHTML = '<p>Ocorreu um erro ao carregar os jogos. Tente novamente mais tarde.</p>';
    }
  }
}

// Mobile menu functionality with pop-art animations
function setupMobileMenu() {
  const mobileToggle = document.getElementById('mobile-filter-toggle');
  const filtersToolbar = document.getElementById('filters-toolbar');
  
  if (!mobileToggle || !filtersToolbar) return;

  let isOpen = false;

  mobileToggle.addEventListener('click', () => {
    isOpen = !isOpen;
    
    if (isOpen) {
      filtersToolbar.classList.add('active');
      mobileToggle.querySelector('.filter-text').textContent = 'Fechar';
      mobileToggle.querySelector('.hamburger-icon').textContent = '✖️';
      mobileToggle.style.background = 'var(--pop-green)';
    } else {
      filtersToolbar.classList.remove('active');
      mobileToggle.querySelector('.filter-text').textContent = 'Filtros';
      mobileToggle.querySelector('.hamburger-icon').textContent = '⚙️';
      mobileToggle.style.background = 'var(--pop-red)';
    }
    
    // Pop-art bounce effect
    mobileToggle.style.transform = 'scale(0.95)';
    setTimeout(() => {
      mobileToggle.style.transform = '';
    }, 150);
  });

  // Close filters when clicking outside on mobile
  document.addEventListener('click', (event) => {
    if (window.innerWidth <= 768 && isOpen && 
        !filtersToolbar.contains(event.target) && 
        !mobileToggle.contains(event.target)) {
      isOpen = false;
      filtersToolbar.classList.remove('active');
      mobileToggle.querySelector('.filter-text').textContent = 'Filtros';
      mobileToggle.querySelector('.hamburger-icon').textContent = '⚙️';
      mobileToggle.style.background = 'var(--pop-red)';
    }
  });

  // Handle screen resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      filtersToolbar.classList.remove('active');
      isOpen = false;
      mobileToggle.querySelector('.filter-text').textContent = 'Filtros';
      mobileToggle.querySelector('.hamburger-icon').textContent = '⚙️';
      mobileToggle.style.background = 'var(--pop-red)';
    }
  });
}

document.addEventListener('DOMContentLoaded', main);
