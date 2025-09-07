import { renderGameCards, renderFilterOptions } from './ui.js';
import { setupFilters } from './filters.js';
import { setupThemeToggle } from './theme.js';
import { setupAnnouncer } from './a11y.js';

const GAMES_URL = 'data/games.index.json';
const TAGS_URL = 'data/tags.json';

let allGames = [];

async function main() {
  setupThemeToggle();
  setupAnnouncer();

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

document.addEventListener('DOMContentLoaded', main);
