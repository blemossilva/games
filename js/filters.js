import { renderGameCards } from './ui.js';
import { debounce } from './utils.js';
import { announce } from './a11y.js';

let allGames = [];
const filters = {
  query: '',
  genre: 'all',
  difficulty: 'all',
  category: 'all',
  offline: 'all'
};

function applyFilters() {
  let filteredGames = [...allGames];

  // Search query
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filteredGames = filteredGames.filter(game =>
      game.title.toLowerCase().includes(query) ||
      game.description.toLowerCase().includes(query)
    );
  }

  // Genre
  if (filters.genre !== 'all') {
    filteredGames = filteredGames.filter(game => game.genres.includes(filters.genre));
  }

  // Difficulty
  if (filters.difficulty !== 'all') {
    filteredGames = filteredGames.filter(game => game.difficulty === filters.difficulty);
  }

  // Category (retro/arcade/casual)
  if (filters.category !== 'all') {
    filteredGames = filteredGames.filter(game => game.genres.includes(filters.category) || game.tags.includes(filters.category));
  }

  // Offline
  if (filters.offline !== 'all') {
    const isOffline = filters.offline === 'true';
    filteredGames = filteredGames.filter(game => game.offline === isOffline);
  }

  renderGameCards(filteredGames);
  announce(`${filteredGames.length} jogos encontrados.`);
}

const debouncedApplyFilters = debounce(applyFilters, 250);

export function setupFilters(games) {
  allGames = games;
  const searchInput = document.getElementById('search-query');
  const genreFilter = document.getElementById('filter-genre');
  const difficultyFilter = document.getElementById('filter-difficulty');
  const categoryFilter = document.getElementById('filter-category');
  const offlineFilter = document.getElementById('filter-offline');

  searchInput.addEventListener('input', (e) => {
    filters.query = e.target.value;
    debouncedApplyFilters();
  });

  genreFilter.addEventListener('change', (e) => {
    filters.genre = e.target.value;
    applyFilters();
  });

  difficultyFilter.addEventListener('change', (e) => {
    filters.difficulty = e.target.value;
    applyFilters();
  });

  categoryFilter.addEventListener('change', (e) => {
    filters.category = e.target.value;
    applyFilters();
  });

  offlineFilter.addEventListener('change', (e) => {
    filters.offline = e.target.value;
    applyFilters();
  });
}
