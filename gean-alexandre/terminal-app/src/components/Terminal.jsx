import { useState, useEffect, useRef } from 'react'
import './Terminal.css'

const Terminal = ({ 
  onCommandExecuted,
  slotMachineActive,
  setSlotMachineActive,
  slotReels,
  setSlotReels,
  slotSpinning,
  setSlotSpinning,
  slotReelSymbols,
  setSlotReelSymbols,
  slotWon,
  setSlotWon,
  apiSymbols,
  setApiSymbols
}) => {
  const [history, setHistory] = useState([
    { type: 'output', text: 'Terminal Retro v1.0' },
    { type: 'output', text: 'Digite "help" para ver os comandos disponíveis.' },
    { type: 'output', text: '' }
  ])
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isIdentified, setIsIdentified] = useState(false)
  const [userName, setUserName] = useState('guest')
  const [sessionId, setSessionId] = useState(null)
  const [balance, setBalance] = useState(0)
  const [slotResult, setSlotResult] = useState(null)
  const inputRef = useRef(null)
  const terminalRef = useRef(null)
  const terminalBodyRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const measureRef = useRef(null)
  const cursorRef = useRef(null)
  const stoppedReelsRef = useRef({ reel1: false, reel2: false, reel3: false })

  useEffect(() => {
    // Usa requestAnimationFrame para garantir que o scroll aconteça após o DOM atualizar
    requestAnimationFrame(() => {
      if (terminalBodyRef.current) {
        terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
      }
    })
  }, [history])

  useEffect(() => {
    // Atualiza a posição do cursor baseado no tamanho do texto
    if (inputRef.current && cursorRef.current && measureRef.current) {
      measureRef.current.textContent = inputRef.current.value
      const textWidth = measureRef.current.offsetWidth
      cursorRef.current.style.left = `${textWidth}px`
    }

    // Faz scroll para o final sempre que digitar
    requestAnimationFrame(() => {
      if (terminalBodyRef.current) {
        terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
      }
    })
  }, [input])

  useEffect(() => {
    // Adiciona resultado do slot ao histórico quando disponível
    if (slotResult) {
      const lines = slotResult.split('\n').map(text => ({ type: 'output', text }))
      setHistory(prev => [...prev, ...lines])
      setSlotResult(null)
    }
  }, [slotResult])

  useEffect(() => {
    const handleClick = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  const triggerGameOver = () => {
    setBalance(0)
    setSlotMachineActive(false)
    setSlotSpinning(false)
    setIsIdentified(false)
    setUserName('guest')
    setSessionId(null)
    setHistory(prev => [...prev,
      { type: 'output', text: '' },
      { type: 'error', text: '╔══════════════════════════════════════════════╗' },
      { type: 'error', text: '║                                              ║' },
      { type: 'error', text: '║          💀  G A M E   O V E R  💀          ║' },
      { type: 'error', text: '║                                              ║' },
      { type: 'error', text: '║       Seus créditos acabaram!                ║' },
      { type: 'error', text: '║       Sessão encerrada.                      ║' },
      { type: 'error', text: '║                                              ║' },
      { type: 'error', text: '║   Use "login <nome>" para jogar novamente.   ║' },
      { type: 'error', text: '║                                              ║' },
      { type: 'error', text: '╚══════════════════════════════════════════════╝' },
      { type: 'output', text: '' }
    ])
  }

  const commands = {
    help: () => {
      const baseCommands = [
        'Comandos disponíveis:',
        '  help     - Mostra esta mensagem',
        '  clear    - Limpa o terminal',
        '  date     - Mostra a data e hora atual',
        '  whoami   - Mostra informações do usuário',
        '  history  - Mostra histórico de comandos',
        '  uptime   - Mostra tempo de atividade',
        '  cal      - Mostra calendário do mês atual',
        '  login    - Identifica-se no sistema',
        '',
        'Atalhos:',
        '  Ctrl+L   - Limpa o terminal',
        '  Ctrl+C   - Cancela comando atual',
        '  ↑/↓      - Navega pelo histórico'
      ]

      if (isIdentified) {
        baseCommands.splice(baseCommands.length - 4, 0,
          '',
          'Comandos ocultos (apenas para usuários identificados):',
          '  secret   - Acessa área secreta',
          '  matrix   - Ativa modo matrix',
          '  fortune  - Mostra uma mensagem da sorte',
          '  neofetch - Mostra informações do sistema estilizadas',
          '  init-game - Inicia o jogo de caça-níquel',
          '  spin     - Gira os rolos da máquina de caça-níquel',
          '             Parâmetros: win/jackpot (força vitória),',
          '                          double/two (força dois iguais)',
          '  exit-game - Encerra o jogo de caça-níquel',
          '  logout   - Desconecta do sistema'
        )
      }

      return {
        type: 'output',
        lines: baseCommands
      }
    },
    clear: () => ({
      type: 'clear',
      lines: []
    }),
    date: () => ({
      type: 'output',
      lines: [`Data: ${new Date().toLocaleString('pt-BR')}`]
    }),
    whoami: () => ({
      type: 'output',
      lines: [
        `Usuário: ${userName}`,
        `Status: ${isIdentified ? 'Identificado' : 'Não identificado'}`,
        ...(sessionId ? [`Sessão: ${sessionId}`, `Saldo: R$${balance}`] : []),
        'Sistema: Terminal Retro OS',
        'Versão: 1.0'
      ]
    }),
    login: (args) => {
      const name = args.join(' ').trim()

      if (!name) {
        return {
          type: 'error',
          lines: [
            'Erro: Nome de usuário é obrigatório.',
            'Uso: login <nome_do_usuário>',
            'Exemplo: login joao'
          ]
        }
      }

      fetch('http://localhost:8000/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: name })
      })
        .then(res => res.json())
        .then(data => {
          setIsIdentified(true)
          setUserName(data.player_name)
          setSessionId(data.session_id)
          setBalance(data.balance)
          setHistory(prev => [...prev,
            { type: 'output', text: `Bem-vindo, ${data.player_name}! Sessão: ${data.session_id}` },
            { type: 'output', text: `Saldo inicial: R$${data.balance}` },
            { type: 'output', text: 'Acesso autorizado. Comandos ocultos liberados.' },
            { type: 'output', text: 'Digite "help" para ver todos os comandos disponíveis.' }
          ])
        })
        .catch(() => {
          setHistory(prev => [...prev, {
            type: 'error',
            text: 'Erro ao conectar com o servidor. Verifique se o backend está rodando.'
          }])
        })

      return {
        type: 'output',
        lines: ['Conectando ao servidor...']
      }
    },
    history: () => ({
      type: 'output',
      lines: commandHistory.length > 0
        ? commandHistory.map((cmd, idx) => `  ${idx + 1}  ${cmd}`)
        : ['Nenhum comando no histórico.']
    }),
    uptime: () => {
      const uptime = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const hours = Math.floor(uptime / 3600)
      const minutes = Math.floor((uptime % 3600) / 60)
      const seconds = uptime % 60
      return {
        type: 'output',
        lines: [`Tempo de atividade: ${hours}h ${minutes}m ${seconds}s`]
      }
    },
    cal: () => {
      const now = new Date()
      const month = now.toLocaleString('pt-BR', { month: 'long' })
      const year = now.getFullYear()
      const firstDay = new Date(year, now.getMonth(), 1).getDay()
      const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate()

      const lines = []
      const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const cellWidth = 5 // Largura fixa para cada célula

      // Função para centralizar texto em uma célula
      const centerCell = (text, width) => {
        const textStr = String(text)
        const padding = width - textStr.length
        const leftPad = Math.floor(padding / 2)
        const rightPad = padding - leftPad
        return ' '.repeat(leftPad) + textStr + ' '.repeat(rightPad)
      }

      // Cabeçalho do calendário
      lines.push(`${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`)
      lines.push('')

      // Cabeçalho dos dias da semana formatado como tabela com pipes
      const header = '| ' + weekDays.map(day => centerCell(day, cellWidth)).join(' | ') + ' |'
      lines.push(header)
      lines.push('─'.repeat(header.length))

      // Cria as semanas
      const weeks = []
      let currentWeek = []

      // Adiciona espaços vazios para o primeiro dia do mês
      for (let i = 0; i < firstDay; i++) {
        currentWeek.push('')
      }

      // Adiciona os dias do mês
      for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push(String(day))

        // Quando completa uma semana ou é o último dia
        if (currentWeek.length === 7 || day === daysInMonth) {
          // Preenche com espaços se não completou a semana
          while (currentWeek.length < 7) {
            currentWeek.push('')
          }
          // Formata a linha com pipes e espaçamento centralizado
          const weekLine = '| ' + currentWeek.map(day => centerCell(day || '', cellWidth)).join(' | ') + ' |'
          weeks.push(weekLine)
          currentWeek = []
        }
      }

      lines.push(...weeks)

      return {
        type: 'output',
        lines: lines
      }
    },
    'init-game': () => {
      if (!isIdentified) {
        return {
          type: 'error',
          lines: ['Acesso negado. Você precisa estar identificado para usar este comando.', 'Use "login <seu_nome>" para se identificar.']
        }
      }

      fetch('http://localhost:8000/api/game/symbols')
        .then(res => res.json())
        .then(symbols => {
          setApiSymbols(symbols)

          const names = symbols.map(s => s.name)
          const initial = names.length >= 3
            ? [names[0], names[1], names[2]]
            : ['?', '?', '?']
          setSlotReels(initial)

          const buildReel = () => {
            const shuffled = [...names].sort(() => Math.random() - 0.5)
            while (shuffled.length < 6) shuffled.push(...names)
            return shuffled.slice(0, 6)
          }
          setSlotReelSymbols([buildReel(), buildReel(), buildReel()])
          setSlotMachineActive(true)

          const symbolLines = symbols.map(s => `  ${s.name} [${s.level}]`)
          setHistory(prev => [...prev,
            { type: 'output', text: '🎰 Máquina de Caça-Níquel iniciada!' },
            { type: 'output', text: `Símbolos carregados: ${symbols.length}` },
            ...symbolLines.map(text => ({ type: 'output', text })),
            { type: 'output', text: '' },
            { type: 'output', text: `Saldo: R$${balance}` },
            { type: 'output', text: 'Digite "spin" para girar os rolos.' }
          ])
        })
        .catch(() => {
          setHistory(prev => [...prev, {
            type: 'error',
            text: 'Erro ao carregar símbolos do servidor.'
          }])
        })

      return {
        type: 'output',
        lines: ['Carregando símbolos do servidor...']
      }
    },
    'exit-game': () => {
      if (!isIdentified) {
        return {
          type: 'error',
          lines: ['Acesso negado. Você precisa estar identificado para usar este comando.', 'Use "login <seu_nome>" para se identificar.']
        }
      }
      if (!slotMachineActive) {
        return {
          type: 'error',
          lines: ['A máquina de caça-níquel não está ativa. Use "init-game" para iniciar.']
        }
      }
      setSlotMachineActive(false)
      setSlotSpinning(false)
      setSlotReels(['🍒', '🍋', '🍊'])
      return {
        type: 'output',
        lines: ['Jogo de Caça-Níquel encerrado. A área superior voltou ao normal.']
      }
    },
    spin: (args) => {
      if (!isIdentified) {
        return {
          type: 'error',
          lines: ['Acesso negado. Você precisa estar identificado para usar este comando.', 'Use "login <seu_nome>" para se identificar.']
        }
      }
      if (!slotMachineActive) {
        return {
          type: 'error',
          lines: ['A máquina de caça-níquel não está ativa. Use "init-game" para iniciar.']
        }
      }

      // Determina endpoint baseado no parâmetro
      const param = args[0]?.toLowerCase()
      let endpoint = `http://localhost:8000/api/game/${sessionId}/run`
      if (param === 'gold' || param === 'plus' || param === 'normal') {
        endpoint += `/${param}`
      } else if (param === '10x') {
        endpoint += '/10x'
      }

      setSlotSpinning(true)
      setSlotWon(null)

      const names = apiSymbols.map(s => s.name)

      // Cria sequências aleatórias para animação durante o giro
      const createRandomSequence = () => {
        const seq = []
        for (let i = 0; i < 6; i++) {
          seq.push(names[Math.floor(Math.random() * names.length)])
        }
        return seq
      }

      stoppedReelsRef.current = { reel1: false, reel2: false, reel3: false }

      // Chama a API
      fetch(endpoint, { method: 'POST' })
        .then(res => {
          if (res.status === 402) return res.json().then(d => ({ ...d, _gameOver: true }))
          return res.json()
        })
        .then(data => {
          if (data._gameOver) {
            setSlotSpinning(false)
            triggerGameOver()
            return
          }

          const finalReels = data.symbols.map(s => s.name)

          // Animação dos reels com paradas escalonadas
          const spinInterval = setInterval(() => {
            setSlotReelSymbols([
              stoppedReelsRef.current.reel1
                ? [finalReels[0], ...names.filter(n => n !== finalReels[0]).slice(0, 5)]
                : createRandomSequence(),
              stoppedReelsRef.current.reel2
                ? [finalReels[1], ...names.filter(n => n !== finalReels[1]).slice(0, 5)]
                : createRandomSequence(),
              stoppedReelsRef.current.reel3
                ? [finalReels[2], ...names.filter(n => n !== finalReels[2]).slice(0, 5)]
                : createRandomSequence()
            ])
          }, 50)

          setTimeout(() => { stoppedReelsRef.current.reel1 = true }, 1500)
          setTimeout(() => { stoppedReelsRef.current.reel2 = true }, 1800)
          setTimeout(() => {
            stoppedReelsRef.current.reel3 = true
            clearInterval(spinInterval)

            setSlotReelSymbols([
              [finalReels[0], ...names.filter(n => n !== finalReels[0]).slice(0, 5)],
              [finalReels[1], ...names.filter(n => n !== finalReels[1]).slice(0, 5)],
              [finalReels[2], ...names.filter(n => n !== finalReels[2]).slice(0, 5)]
            ])
            setSlotReels(finalReels)
            setSlotSpinning(false)
            setBalance(data.balance)

            const won = data.points > 0
            const lines = []

            if (won) {
              const winLevel = data.symbols[0].level
              setSlotWon(winLevel)
              setTimeout(() => setSlotWon(null), 5000)
              lines.push(`🎉 JACKPOT! Você ganhou R$${data.credit}!`)
            } else {
              lines.push('Tente novamente!')
            }

            lines.push(`  Custo: -R$${data.debit}`)
            if (data.credit > 0) lines.push(`  Ganho: +R$${data.credit}`)
            lines.push(`  Saldo: R$${data.balance}`)

            setSlotResult(lines.join('\n'))

            if (data.balance <= 0) {
              setTimeout(() => triggerGameOver(), 1500)
            }
          }, 2000)
        })
        .catch(() => {
          setSlotSpinning(false)
          setHistory(prev => [...prev, {
            type: 'error',
            text: 'Erro ao conectar com o servidor.'
          }])
        })

      return {
        type: 'output',
        lines: ['Girando os rolos...']
      }
    },
    // Comandos ocultos - apenas para usuários identificados
    secret: () => {
      if (!isIdentified) {
        return {
          type: 'error',
          lines: ['Acesso negado. Você precisa estar identificado para usar este comando.', 'Use "login <seu_nome>" para se identificar.']
        }
      }
      return {
        type: 'output',
        lines: [
          '╔════════════════════════════════════╗',
          '║     ÁREA SECRETA DESBLOQUEADA      ║',
          '╚════════════════════════════════════╝',
          '',
          `Olá, ${userName}!`,
          'Você descobriu a área secreta do terminal.',
          '',
          'Informações confidenciais:',
          '  • Sistema operacional: Terminal Retro OS',
          '  • Versão do kernel: 5.4.0-retro',
          '  • Arquitetura: x86_64',
          '  • Usuários ativos: 1',
          '',
          'Parabéns por chegar até aqui! 🎉'
        ]
      }
    },
    matrix: () => {
      if (!isIdentified) {
        return {
          type: 'error',
          lines: ['Acesso negado. Você precisa estar identificado para usar este comando.', 'Use "login <seu_nome>" para se identificar.']
        }
      }
      return {
        type: 'output',
        lines: [
          '01001000 01100101 01101100 01101100 01101111',
          '',
          'Modo Matrix ativado!',
          '',
          'Wake up, Neo...',
          'The Matrix has you...',
          'Follow the white rabbit.',
          '',
          '┌─────────────────────────────┐',
          '│  [1] Take the red pill     │',
          '│  [2] Take the blue pill    │',
          '└─────────────────────────────┘',
          '',
          'Você escolheu... continuar no terminal!'
        ]
      }
    },
    fortune: () => {
      if (!isIdentified) {
        return {
          type: 'error',
          lines: ['Acesso negado. Você precisa estar identificado para usar este comando.', 'Use "login <seu_nome>" para se identificar.']
        }
      }
      const fortunes = [
        // Frases motivacionais
        'Hoje é um ótimo dia para aprender algo novo!',
        'A persistência é o caminho do êxito.',
        'Grandes coisas nunca vêm de zonas de conforto.',
        'O código que você escreve hoje será o legado de amanhã.',
        'A melhor forma de prever o futuro é criá-lo.',
        'Programadores não quebram coisas, apenas descobrem bugs.',
        'Existem apenas 10 tipos de pessoas: as que entendem binário e as que não entendem.',
        'Código limpo é código que funciona.',
        'Aprender uma nova linguagem é como aprender um novo superpoder.',
        'Commit pequeno, commit frequente.',
        'Testes são como escovas de dente: todo mundo diz que usa, mas nem sempre é verdade.',

        // Frases críticas/revés
        'Esse é o melhor código que você consegue fazer?',
        'Funciona na minha máquina!',
        'Vou refatorar isso depois... (nunca refatora)',
        'Esse código foi escrito às 3h da manhã, desculpa.',
        'Não mexe que funciona!',
        'Esse bug é uma feature, não um problema.',
        'Quem escreveu esse código? Ah, fui eu há 6 meses...',
        'Esse código tem mais band-aids que um hospital.',
        'Legacy code é código que funciona.',
        'Esse código está tão acoplado que precisa de terapia.',
        'Comentários são mentiras que contamos para nós mesmos.',
        'Esse código tem mais ifs que uma árvore de Natal.',
        'Refatorar? Mas funciona perfeitamente! (não funciona)',
        'Esse código é tão ruim que até o linter desistiu.',
        'Vou adicionar mais um if aqui... (não faça isso)',
        'Esse código tem mais código morto que um cemitério.',
        'Esse é o código mais complexo que já vi... e eu escrevi.',
        'Vou fazer um quick fix... (vira um quick disaster)',
        'Esse código precisa de um exorcista, não de um refactor.',
        'Esse código tem mais dependências que um bebê.',

        // Piadas e frases engraçadas
        'Debugging é como ser detetive em um caso onde você é o criminoso.',
        '99 bugs no código, 99 bugs no código. Corrige um, commita, 127 bugs no código.',
        'Programador: pessoa que resolve problemas que você não sabia que tinha de formas que você não entende.',
        'A diferença entre um programador júnior e sênior? O sênior já quebrou produção mais vezes.',
        'Código sem testes é código quebrado esperando acontecer.',
        'Git commit -m "fix" (não fixou nada)',
        'Stack Overflow é o melhor amigo do programador.',
        'A melhor documentação é código que se explica sozinho... (não existe)',
        'Esse código roda perfeitamente... no meu computador.',
        'Vou fazer isso rápido... (leva 3 dias)',
        'Esse código é tão simples que até eu entendo... (não entende)',
        'A melhor solução é sempre a mais simples... (nunca é simples)',
        'Esse código tem mais edge cases que um poliedro.',
        'Vou só adicionar uma featurezinha... (vira um projeto novo)',
        'Esse código é tão otimizado que ninguém entende mais.',
        'A melhor arquitetura é a que funciona... (não funciona)',
        'Esse código tem mais warnings que um aeroporto.',
        'Vou fazer um código limpo... (fica uma bagunça)',
        'Esse código é tão legível que preciso de um tradutor.',
        'A melhor prática é não fazer isso... (faz mesmo assim)',

        // Frases filosóficas sobre código
        'Código é poesia escrita em lógica.',
        'Um bom programador escreve código que humanos podem ler.',
        'Código é arte, mas arte que precisa funcionar.',
        'O melhor código é código que não precisa ser escrito.',
        'Código limpo não é código perfeito, é código compreensível.',
        'Refatorar é como escovar os dentes: precisa fazer regularmente.',
        'Código legado é código que ninguém quer mexer.',
        'A melhor arquitetura é a que você consegue manter.',
        'Código sem testes é código que você não confia.',
        'Um bom commit message é um presente para você mesmo no futuro.'
      ]
      const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)]
      return {
        type: 'output',
        lines: [
          '╔═══════════════════════════════════╗',
          '║         MENSAGEM DA SORTE         ║',
          '╚═══════════════════════════════════╝',
          '',
          `"${randomFortune}"`,
          '',
          `— Terminal Fortune para ${userName}`
        ]
      }
    },
    neofetch: () => {
      if (!isIdentified) {
        return {
          type: 'error',
          lines: ['Acesso negado. Você precisa estar identificado para usar este comando.', 'Use "login <seu_nome>" para se identificar.']
        }
      }
      return {
        type: 'output',
        lines: [
          '        ╭─────────────────────────╮',
          '        │                         │',
          '        │   Terminal Retro OS     │',
          '        │                         │',
          '        ╰─────────────────────────╯',
          '',
          `        👤 ${userName}`,
          '        🖥️  Terminal Retro OS',
          '        🐧 Kernel: 5.4.0-retro',
          '        💻 Shell: retro-shell',
          '        📦 Pacotes: ∞',
          '        🎨 Tema: Matrix Green',
          '        ⚡ Uptime: Ativo',
          '',
          '        ╔═════════════════════════╗',
          '        ║   Sistema Operacional   ║',
          '        ║   Terminal Retro v1.0   ║',
          '        ╚═════════════════════════╝'
        ]
      }
    },
    logout: () => {
      if (!isIdentified) {
        return {
          type: 'error',
          lines: ['Você não está identificado.']
        }
      }
      setIsIdentified(false)
      setUserName('guest')
      setSessionId(null)
      setBalance(0)
      return {
        type: 'output',
        lines: [
          'Logout realizado com sucesso.',
          'Sessão encerrada.',
          'Use "login <seu_nome>" para se identificar novamente.'
        ]
      }
    }
  }

  const handleCommand = (cmd) => {
    const parts = cmd.trim().split(' ')
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    if (commands[command]) {
      return commands[command](args)
    } else if (cmd.trim()) {
      return {
        type: 'error',
        lines: [`Comando não encontrado: ${command}. Digite "help" para ajuda.`]
      }
    }
    return { type: 'output', lines: [] }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const commandResult = handleCommand(input)

    // Comando especial: clear
    if (commandResult.type === 'clear') {
      setHistory([])
      setCommandHistory([...commandHistory, input])
      setHistoryIndex(-1)
      setInput('')
      // Faz scroll após limpar
      requestAnimationFrame(() => {
        if (terminalBodyRef.current) {
          terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
        }
      })
      return
    }

    // Outros comandos
    const outputLines = commandResult.lines.map(text => ({
      type: commandResult.type,
      text
    }))

    const newHistory = [
      ...history,
      { type: 'input', text: `$ ${input}` },
      ...outputLines
    ]

    setHistory(newHistory)
    setCommandHistory([...commandHistory, input])
    setHistoryIndex(-1)
    setInput('')

    // Faz scroll para o final após atualizar o histórico
    requestAnimationFrame(() => {
      if (terminalBodyRef.current) {
        terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
      }
    })

    // Notifica o componente pai que um comando foi executado
    if (onCommandExecuted) {
      onCommandExecuted()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setInput('')
        } else {
          setHistoryIndex(newIndex)
          setInput(commandHistory[newIndex])
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const inputParts = input.trim().split(' ')
      const currentCommand = inputParts[0].toLowerCase()

      if (currentCommand) {
        // Lista de comandos ocultos que só aparecem quando identificado
        const hiddenCommands = ['secret', 'matrix', 'fortune', 'neofetch', 'init-game', 'spin', 'exit-game', 'logout']

        // Busca comandos que começam com o texto digitado
        let availableCommands = Object.keys(commands)

        // Remove comandos ocultos se não estiver identificado
        if (!isIdentified) {
          availableCommands = availableCommands.filter(cmd => !hiddenCommands.includes(cmd))
        }

        const matchingCommands = availableCommands.filter(cmd =>
          cmd.startsWith(currentCommand)
        )

        if (matchingCommands.length === 1) {
          // Apenas uma correspondência - completa o comando
          const remainingArgs = inputParts.slice(1).join(' ')
          setInput(matchingCommands[0] + (remainingArgs ? ' ' + remainingArgs : ''))
        } else if (matchingCommands.length > 1) {
          // Múltiplas correspondências - encontra o prefixo comum
          let commonPrefix = matchingCommands[0]
          for (let i = 1; i < matchingCommands.length; i++) {
            const cmd = matchingCommands[i]
            let j = 0
            while (j < commonPrefix.length && j < cmd.length && commonPrefix[j] === cmd[j]) {
              j++
            }
            commonPrefix = commonPrefix.substring(0, j)
          }

          // Se o prefixo comum for maior que o texto atual, completa até ele
          if (commonPrefix.length > currentCommand.length) {
            const remainingArgs = inputParts.slice(1).join(' ')
            setInput(commonPrefix + (remainingArgs ? ' ' + remainingArgs : ''))
          } else {
            // Mostra todas as opções possíveis
            const remainingArgs = inputParts.slice(1).join(' ')
            const optionsText = matchingCommands.join('  ')
            const newHistory = [
              ...history,
              { type: 'input', text: `$ ${input}` },
              { type: 'output', text: optionsText }
            ]
            setHistory(newHistory)
            // Faz scroll após mostrar as opções
            requestAnimationFrame(() => {
              if (terminalBodyRef.current) {
                terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
              }
            })
          }
        }
        // Se não houver correspondências, não faz nada
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setHistory([])
    } else if (e.key === 'c' && e.ctrlKey && input.trim()) {
      e.preventDefault()
      const currentInput = input
      setInput('')
      setHistory([...history, { type: 'input', text: `$ ${currentInput}` }, { type: 'output', text: '^C' }])
    }
  }

  return (
    <div className="terminal-container" onClick={() => inputRef.current?.focus()}>
      <div className="terminal" ref={terminalRef}>
        <div className="terminal-header">
          <div className="terminal-buttons">
            <span className="btn btn-close"></span>
            <span className="btn btn-minimize"></span>
            <span className="btn btn-maximize"></span>
          </div>
          <div className="terminal-title">Terminal Retro</div>
        </div>
        <div className="terminal-body" ref={terminalBodyRef}>
          {history.map((item, index) => (
            <div key={index} className={`terminal-line ${item.type}`}>
              {item.text}
            </div>
          ))}
          <form onSubmit={handleSubmit} className="terminal-input-form">
            <span className="prompt">$</span>
            <div className="input-wrapper">
              <span ref={measureRef} className="measure-text"></span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                autoFocus
                spellCheck={false}
              />
              <span ref={cursorRef} className="cursor">█</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Terminal
