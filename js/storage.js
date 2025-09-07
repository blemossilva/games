// storage.js - Wrapper para localStorage

/**
 * Guarda um item no localStorage.
 * @param {string} key
 * @param {any} value
 */
export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erro ao guardar no localStorage:', e);
  }
}

/**
 * Obtém um item do localStorage.
 * @param {string} key
 * @returns {any | null}
 */
export function getItem(key) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error('Erro ao ler do localStorage:', e);
    return null;
  }
}
