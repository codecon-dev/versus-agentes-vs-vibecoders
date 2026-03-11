# Terminal App - Documentação do Frontend

## Tech Stack

- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Linguagem:** JSX (sem TypeScript)
- **Módulos:** ES Modules
- **Dependências de produção:** apenas `react` e `react-dom`

## Estrutura do Projeto

```
terminal-app/
├── index.html              # Entry point HTML (lang="pt-BR")
├── package.json
├── vite.config.js          # Config mínima com plugin React
└── src/
    ├── main.jsx            # Entry point da aplicação
    ├── App.jsx             # Componente raiz
    ├── App.css
    ├── index.css           # Estilos globais
    └── components/
        ├── Terminal.jsx    # Componente principal do terminal
        └── Terminal.css
```

## Arquitetura

### Componentes

**App.jsx** — Componente raiz com dois painéis:
- Painel superior: visualizador de imagens / display do caça-níquel
- Painel inferior: componente Terminal
- Gerencia 5 estados do slot machine: `imageUrl`, `slotMachineActive`, `slotReels`, `slotSpinning`, `slotReelSymbols`

**Terminal.jsx** — Emulador de terminal retro com:
- 9+ estados via `useState` (history, input, commandHistory, isIdentified, userName, slotResult, etc.)
- 20+ comandos implementados
- Navegação por histórico de comandos (setas)
- Tab completion
- Atalhos de teclado (Ctrl+L, Ctrl+C)
- Auto-scroll

### Comandos Disponíveis

| Categoria | Comandos |
|---|---|
| Básicos | `help`, `clear`, `date`, `whoami`, `history`, `uptime`, `cal`, `login` |
| Jogo | `init-game`, `exit-game`, `spin` |
| Ocultos (requer login) | `secret`, `matrix`, `fortune`, `neofetch`, `logout` |

## Estilização

- **CSS puro** com arquivos por componente (sem framework CSS)
- **Tema retro terminal:** fundo verde escuro (#0d2818), texto verde neon (#39ff14)
- **Efeitos:** scanlines, glow, cursor piscante, animação dos reels do slot
- **Animações CSS:** `blink`, `textGlow`, `reelSpin`, fade-in

## State Management

- Apenas React Hooks (`useState`, `useRef`, `useEffect`)
- Sem biblioteca externa (Redux, Zustand, Context API)
- Fluxo unidirecional: App → Terminal via props
- Terminal → App via callback `onCommandExecuted`

## APIs Externas

- **Picsum Photos** (`https://picsum.photos/seed/{id}/1920/1080`) — imagens aleatórias
- Nenhuma integração com backend próprio

## Slot Machine (implementação atual)

- 3 reels independentes com tempos de parada diferentes
- Animação via `setInterval` + refs para controlar parada
- Detecção de vitória: 3 iguais = jackpot, 2 iguais = prêmio menor
- Símbolos hardcoded em arrays locais

## Padrões Notáveis

- **Cursor dinâmico:** usa elemento invisível `measureRef` para calcular largura do texto e posicionar o cursor
- **Performance:** `requestAnimationFrame` para scroll e atualizações DOM
- **Localização:** todo em pt-BR (textos, datas, calendário)
- **Sem roteamento:** SPA de página única
- **Sem TypeScript:** apenas JSX
- **Zero dependências externas** além do React

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

## Observações para Integração com Backend

O frontend atual não possui integração com API backend. O slot machine funciona inteiramente no client-side com símbolos hardcoded. Para integrar com o backend Django:

1. Substituir lógica local do slot por chamadas à API `/api/game/*`
2. Implementar fluxo: `/api/game/new` → `/api/game/{id}/run`
3. Usar `credit`, `debit` e `balance` retornados pela API
4. Carregar símbolos reais via `/api/game/symbols` (com imagens do backend)
5. Tratar estado de game over quando `balance < 10` (HTTP 402)
