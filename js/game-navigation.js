// Game Navigation - Add back-to-home button for direct game pages
(function() {
    // Check if we're on a game page (not the main index)
    const isGamePage = window.location.pathname.includes('/games/') && 
                      window.location.pathname.includes('index.html');
    
    if (!isGamePage) return;
    
    // Create floating back button
    const backButton = document.createElement('button');
    backButton.innerHTML = '🏠 Voltar';
    backButton.className = 'floating-back-button';
    backButton.setAttribute('aria-label', 'Voltar ao portal de jogos');
    
    // Pop-art styling
    backButton.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 9999;
        padding: 12px 20px;
        background: #F2C500;
        color: #000000;
        border: 3px solid #000000;
        border-radius: 8px;
        font-family: 'Bebas Neue', 'Poppins', sans-serif;
        font-weight: 900;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        cursor: pointer;
        box-shadow: 4px 4px 0px #000000;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    // Hover effects
    backButton.addEventListener('mouseenter', () => {
        backButton.style.transform = 'translateY(-2px) translateX(-2px)';
        backButton.style.boxShadow = '6px 6px 0px #000000';
        backButton.style.background = '#FFF3B8';
    });
    
    backButton.addEventListener('mouseleave', () => {
        backButton.style.transform = '';
        backButton.style.boxShadow = '4px 4px 0px #000000';
        backButton.style.background = '#F2C500';
    });
    
    backButton.addEventListener('mousedown', () => {
        backButton.style.transform = 'translateY(2px) translateX(2px)';
        backButton.style.boxShadow = '2px 2px 0px #000000';
    });
    
    backButton.addEventListener('mouseup', () => {
        backButton.style.transform = 'translateY(-2px) translateX(-2px)';
        backButton.style.boxShadow = '6px 6px 0px #000000';
    });
    
    // Navigate back to home
    backButton.addEventListener('click', () => {
        // Calculate relative path back to root
        const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');
        const gamesDirIndex = pathSegments.indexOf('games');
        
        if (gamesDirIndex !== -1) {
            // Go back to games portal: ../../index.html (from games/[game]/ to games/)
            const backPath = '../../index.html';
            window.location.href = backPath;
        } else {
            // Fallback
            window.location.href = '/';
        }
    });
    
    // Add to page
    document.body.appendChild(backButton);
    
    // Mobile responsive adjustments
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    function handleMobileChange(e) {
        if (e.matches) {
            backButton.style.top = '10px';
            backButton.style.left = '10px';
            backButton.style.padding = '10px 16px';
            backButton.style.fontSize = '12px';
        } else {
            backButton.style.top = '20px';
            backButton.style.left = '20px';
            backButton.style.padding = '12px 20px';
            backButton.style.fontSize = '14px';
        }
    }
    
    mediaQuery.addListener(handleMobileChange);
    handleMobileChange(mediaQuery);
    
})();