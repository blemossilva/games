/**
 * Função debounce para limitar a frequência de execução de uma função.
 * @param {Function} func - A função a ser "debounced".
 * @param {number} delay - O tempo de espera em milissegundos.
 * @returns {Function} A nova função "debounced".
 */
export function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Obtém um parâmetro da querystring da URL.
 * @param {string} name - O nome do parâmetro.
 * @returns {string | null} O valor do parâmetro ou null.
 */
export function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// TODO: Implementar FPS Meter se necessário
