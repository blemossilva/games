// a11y.js - Helpers de Acessibilidade

/**
 * Anuncia uma mensagem para leitores de ecrã.
 * @param {string} message - A mensagem a anunciar.
 */
export function announce(message) {
  const announcer = document.getElementById('announcer');
  if (announcer) {
    announcer.textContent = message;
  }
}

/**
 * Garante que o container de anúncios ARIA existe.
 */
export function setupAnnouncer() {
  let announcer = document.getElementById('announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.padding = '0';
    announcer.style.margin = '-1px';
    announcer.style.overflow = 'hidden';
    announcer.style.clip = 'rect(0, 0, 0, 0)';
    announcer.style.whiteSpace = 'nowrap';
    announcer.style.border = '0';
    document.body.appendChild(announcer);
  }
}
