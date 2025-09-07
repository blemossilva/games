const grid = document.getElementById('games-grid');

export function renderGameCards(games) {
  if (!grid) return;
  grid.innerHTML = ''; // Limpa a grelha

  if (games.length === 0) {
    grid.innerHTML = '<p>Nenhum jogo encontrado com os filtros selecionados.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  games.forEach(game => {
    const card = createGameCard(game);
    fragment.appendChild(card);
  });
  grid.appendChild(fragment);
}

function createGameCard(game) {
  const card = document.createElement('div');
  card.className = 'game-card';
  card.innerHTML = `
    <img src="${game.thumbnail}" alt="Thumbnail do jogo ${game.title}" class="game-card__thumb" loading="lazy" width="320" height="180">
    <div class="game-card__content">
      <h3 class="game-card__title">${game.title}</h3>
      <div class="game-card__badges">
        ${game.genres.map(g => `<span class="badge badge--genre-${g}">${g}</span>`).join('')}
        <span class="badge badge--difficulty-${game.difficulty}">${game.difficulty}</span>
        ${game.offline ? '<span class="badge badge--offline">Offline</span>' : ''}
      </div>
      <a href="jogo.html?id=${game.id}" class="game-card__cta">Jogar</a>
    </div>
  `;
  return card;
}

export function renderFilterOptions(tagsData) {
  const genreFilter = document.getElementById('filter-genre');
  const difficultyFilter = document.getElementById('filter-difficulty');
  const categoryFilter = document.getElementById('filter-category');

  tagsData.genres.forEach(g => {
    genreFilter.innerHTML += `<option value="${g.value}">${g.label}</option>`;
  });
  tagsData.difficulties.forEach(d => {
    difficultyFilter.innerHTML += `<option value="${d.value}">${d.label}</option>`;
  });
  tagsData.categories.forEach(c => {
    categoryFilter.innerHTML += `<option value="${c.value}">${c.label}</option>`;
  });
}
