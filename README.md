# 🕹️ Portal de Mini-Jogos Estático

Bem-vindo ao Portal de Mini-Jogos! Este é um website estático, rápido e acessível, desenhado para catalogar e disponibilizar jogos JavaScript jogáveis diretamente no browser. O projeto é 100% client-side e otimizado para publicação gratuita no GitHub Pages.

## ✨ Funcionalidades

- **Catálogo de Jogos**: Grelha de jogos com pesquisa e filtros.
- **Pesquisa Instantânea**: Encontre jogos por título ou descrição com debounce para performance.
- **Filtros Avançados**: Filtre por género, dificuldade, categoria (retro/arcade/casual) e disponibilidade offline.
- **Página de Jogo Dedicada**: Cada jogo tem a sua própria página com controlos, instruções e recordes.
- **Persistência de Pontuação**: Os recordes (High Scores) são guardados no `localStorage` do seu browser.
- **Jogos Locais e Embeds**: Suporta jogos criados localmente (HTML/CSS/JS) e embeds seguros de fontes externas via `<iframe>`.
- **Design Moderno**: Interface limpa, responsiva (mobile-first), com tema Dark/Light.
- **Acessibilidade (A11y)**: Navegação por teclado, contraste de cores e atributos ARIA.
- **Segurança**: Política de Segurança de Conteúdo (CSP) e sandboxing para iframes.
- **CI/CD com GitHub Actions**: Validação automática do catálogo JSON, geração de `sitemap.xml` e deploy para GitHub Pages.

## 🚀 Como Executar Localmente

Para testar o site no seu computador, precisa de um servidor web local para servir os ficheiros estáticos. Isto é necessário para que `fetch()` funcione corretamente.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    ```

2.  **Inicie um servidor local:**
    Se tiver o Python instalado, pode usar:
    ```bash
    python -m http.server
    ```
    Ou, se tiver o Node.js, pode usar o `live-server` (instale com `npm install -g live-server`):
    ```bash
    live-server
    ```

3.  **Abra no browser:**
    Aceda a `http://localhost:8000` (ou o endereço fornecido pelo seu servidor).

## 🎮 Como Adicionar um Novo Jogo

Adicionar um jogo é um processo simples que envolve 3 passos:

### 1. Adicionar os Ficheiros do Jogo

-   **Para um Jogo Local:**
    1.  Crie uma nova pasta em `/games/nome-do-seu-jogo/`.
    2.  Coloque os ficheiros do jogo (`index.html`, `game.js`, `assets/`, etc.) dentro dessa pasta.
    3.  O `index.html` do jogo deve conter apenas o necessário para o jogo correr (ex: `<canvas>`).

-   **Para um Jogo Externo (Embed):**
    1.  Crie uma pasta em `/embeds/nome-do-embed/`.
    2.  Dentro, crie um `index.html` que contenha o `<iframe>` a apontar para o jogo externo. Use o `sandbox` e dê a devida atribuição ao autor original. Veja `/embeds/open-2048/index.html` como exemplo.

### 2. Adicionar Thumbnails

1.  Crie um thumbnail para o seu jogo em formato **WebP** (ex: 320x180px).
2.  Adicione-o a `/assets/thumbs/`.
3.  (Opcional) Adicione screenshots a `/assets/shots/`.

### 3. Atualizar o Catálogo

Abra o ficheiro `data/games.index.json` e adicione uma nova entrada para o seu jogo, seguindo o esquema existente.

**Exemplo de entrada:**
```json
{
  "id": "meu-novo-jogo",
  "title": "O Meu Novo Jogo Fantástico",
  "type": "local", // ou "embed"
  "path": "/games/meu-novo-jogo/index.html",
  "genres": ["puzzle", "casual"],
  "controls": ["clique", "arrastar"],
  "difficulty": "médio",
  "offline": true,
  "thumbnail": "/assets/thumbs/meu-novo-jogo.webp",
  "screenshots": ["/assets/shots/meu-novo-jogo-1.webp"],
  "author": "O Meu Nome",
  "license": "MIT",
  "source": "https://github.com/meu-user/meu-jogo",
  "description": "Uma breve descrição do que torna este jogo especial.",
  "tags": ["singleplayer", "touch"]
}
```

## 🌐 Publicar no GitHub Pages

O repositório está configurado para fazer deploy automático para o GitHub Pages.

1.  Vá às **Settings** do seu repositório no GitHub.
2.  Na secção **Pages**, em "Build and deployment", selecione a fonte como **GitHub Actions**.
3.  Faça `push` das suas alterações para o branch `main`. A Action irá correr, validar os ficheiros, gerar o `sitemap.xml` e publicar o site.

O seu site estará disponível em `https://your-username.github.io/your-repo/`.

## 📝 Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o ficheiro [LICENSE](LICENSE) para mais detalhes. Os jogos incluídos podem ter as suas próprias licenças, que são devidamente creditadas nos seus metadados.
