import { getQueryParam } from './utils.js';
import { getScore, saveScore } from './score.js';
import { setupThemeToggle } from './theme.js';

const GAMES_URL = 'data/games.index.json';

async function main() {
  document.getElementById('version').textContent = window.APP_VERSION || 'dev';
  setupThemeToggle();
  const gameId = getQueryParam('id');
  if (!gameId) {
    document.body.innerHTML = '<h1>Erro: ID do jogo não especificado.</h1>';
    return;
  }

  const response = await fetch(GAMES_URL);
  const games = await response.json();
  const gameData = games.find(g => g.id === gameId);

  if (!gameData) {
    document.body.innerHTML = `<h1>Erro: Jogo com ID "${gameId}" não encontrado.</h1>`;
    return;
  }

  renderGamePage(gameData);
  setupGameControls(gameData);
}

function renderGamePage(game) {
  document.title = `${game.title} - Portal de Jogos`;

  document.getElementById('game-title').textContent = game.title;
  document.getElementById('game-author').textContent = `por ${game.author}`;
  document.getElementById('game-description').textContent = game.description;
  document.getElementById('game-instructions').innerHTML = `<strong>Controlos:</strong> ${game.controls.join(', ')}`;

  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = `<iframe class="game-iframe" src="${game.path}" title="${game.title}" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-fullscreen"></iframe>`;

  const scoreDisplay = document.getElementById('high-score');
  scoreDisplay.textContent = `Recorde: ${getScore(game.id)}`;

  const gameMeta = document.querySelector('.game-meta');
  if (game.screenshots && game.screenshots.length > 0) {
    const screenshotsContainer = document.createElement('div');
    screenshotsContainer.className = 'screenshots';
    screenshotsContainer.innerHTML = '<h4>Screenshots</h4>';
    const screenshotsGrid = document.createElement('div');
    screenshotsGrid.className = 'screenshots-grid';
    game.screenshots.forEach(screenshot => {
      screenshotsGrid.innerHTML += `<a href="${screenshot}" target="_blank"><img src="${screenshot}" alt="Screenshot do jogo ${game.title}" loading="lazy"></a>`;
    });
    screenshotsContainer.appendChild(screenshotsGrid);
    gameMeta.appendChild(screenshotsContainer);
  }
}

function setupGameControls(game) {
  const playButton = document.getElementById('btn-play');
  const pauseButton = document.getElementById('btn-pause');
  const resetButton = document.getElementById('btn-reset');
  const gameIframe = document.querySelector('.game-iframe');

  playButton.disabled = false;
  pauseButton.disabled = false;
  resetButton.disabled = false;

  // A comunicação com o iframe requer que o jogo dentro dele ouça por 'message' events.
  // Esta é uma implementação de exemplo.
  playButton.addEventListener('click', () => gameIframe.contentWindow.postMessage('play', '*'));
  pauseButton.addEventListener('click', () => gameIframe.contentWindow.postMessage('pause', '*'));
  resetButton.addEventListener('click', () => gameIframe.contentWindow.postMessage('reset', '*'));

  // Exemplo de como o jogo poderia comunicar a pontuação de volta
  window.addEventListener('message', event => {
    // Adicionar verificação de origem para segurança
    // if (event.origin !== 'esperado') return;

    if (event.data && event.data.type === 'scoreUpdate') {
      const currentScore = getScore(game.id);
      if (event.data.score > currentScore) {
        saveScore(game.id, event.data.score);
        document.getElementById('high-score').textContent = `Recorde: ${event.data.score}`;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', main);
