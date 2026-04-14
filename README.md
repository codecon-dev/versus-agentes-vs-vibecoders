# Agentes de IA vs. Vibecoders: Jogo do Tigrinho para Devs 🐯
> *Um dev com agentes automatizados contra dois devs no vibecoding. O prêmio: o jogo mais viciante da internet, mas pra dev.*

## Sobre o Projeto

Mais gente significa mais resultado? E se um dos lados nem codar?

A gente colocou duas abordagens completamente diferentes de usar IA pra competir de verdade: **Alexandre Klostermann e Gean Farias** vibecodando juntos, com IA como copiloto, contra **Gustavo Pantoja**, que configurou agentes de IA e ficou só orquestrando enquanto eles construíam o jogo por conta própria.

O desafio: criar um clone do jogo do tigrinho — temático pra devs, com linguagens de programação no lugar de símbolos, animações, lógica de rodada e multiplicadores. Duas horas no relógio.

O projeto foi criado durante um desafio ao vivo no canal da [Codecon](https://youtube.com/codecondev).

## O Desafio

O jogo precisava ter obrigatoriamente:

- **Lógica de rodada** — Spin, resultado, game loop funcionando
- **Multiplicadores** — Sistema de ganho e perda implementado
- **Temática dev** — Pelo menos 6 linguagens de programação no lugar dos símbolos clássicos
- **Animações** — Feedback visual nas rodadas
- **Interface jogável** — Tem que rodar de verdade

### As abordagens

**Vibecoding (Alexandre + Gean)** — Dois devs, IA como copiloto, decisões humanas, caos produtivo e discussão em tempo real sobre arquitetura.

**Agentes autônomos (Gustavo)** — Um dev, agentes de IA construindo o projeto de forma autônoma, humano orquestrando e redirecionando quando necessário.

## 📁 Estrutura do Repositório

```
/
├── vibecoding/      # Alexandre Klostermann + Gean Farias
│   └── README.md
├── agentes/         # Gustavo Pantoja
│   └── README.md
└── README.md
```

Cada pasta contém a implementação completa com stack, arquitetura, estratégia de prompts e aprendizados da abordagem.

## Rodando Localmente

Acesse a pasta da implementação que quiser testar e siga o README específico de cada uma.

## Participe Você Também!

**Qual abordagem você usaria? Vibecodando ou com agentes?**

1. **Fork** este repositório
2. Crie uma pasta com seu nome/username e indique a abordagem usada
3. Implemente o jogo com as funcionalidades obrigatórias
4. Documente no README: abordagem escolhida, como você usou a IA, o que ela decidiu sozinha e o que você precisou corrigir
5. Abra um **Pull Request**

## Conceitos-Chave

- **Vibecoding** — Usar IA como copiloto ativo, com o humano no controle das decisões. A IA executa, você direciona
- **Agentes autônomos** — Delegar tarefas pra agentes que tomam decisões sozinhos. O humano orquestra, não executa
- **Orquestração de agentes** — Quando você interfere? Quando deixa o agente resolver? Onde está o limite entre correção e microgerenciamento?
- **Decisões arquiteturais** — Agentes tomam decisões que você não pediu. Às vezes são boas. Como você lida com as ruins?
- **Colaboração humana vs. paralelismo de agentes** — Dois devs não são duas vezes mais rápidos. Dois agentes também não são. Mas por razões completamente diferentes

## Licença

MIT

---

*Projeto desenvolvido para o canal da [Codecon](https://youtube.com/codecondev)*
