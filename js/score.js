import { setItem, getItem } from './storage.js';

const SCORE_PREFIX = 'game_score_';

/**
 * Obtém a pontuação mais alta para um jogo.
 * @param {string} gameId - O ID do jogo.
 * @returns {number} A pontuação mais alta, ou 0 se não existir.
 */
export function getScore(gameId) {
  return parseInt(getItem(`${SCORE_PREFIX}${gameId}`), 10) || 0;
}

/**
 * Guarda uma nova pontuação se for mais alta que a existente.
 * @param {string} gameId - O ID do jogo.
 * @param {number} newScore - A nova pontuação.
 */
export function saveScore(gameId, newScore) {
  const currentHighScore = getScore(gameId);
  if (newScore > currentHighScore) {
    setItem(`${SCORE_PREFIX}${gameId}`, newScore);
    console.log(`Novo recorde para ${gameId}: ${newScore}`);
  }
}
