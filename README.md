# 🎴Perfil Bíblico

Um jogo educativo multiplayer de perguntas e respostas baseado em personagens, lugares e acontecimentos da Bíblia. Ideal para dinâmicas em grupos de jovens, escolas dominicais ou encontros familiares.

[![Licença](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-5.5.5-green.svg)]()
[![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow.svg)]()
[![deploy](https://img.shields.io/badge/depoly-inactive-red.svg)]()


## 📌 Sumário

1.  [Sobre o Projeto]()
2.  [Objetivos]()
3.  [Tecnologias]()
4.  [Funcionalidades]()
5.  [Pré-requisitos]()
6.  [Instalação e Execução]()
7.  [Como Jogar]()
8.  [Estrutura do Projeto]()
9.  [Sistema de Pontuação]()
10. [Sistema de Privacidade]()
11. [Personalização]()
12. [Leaderboard]()
13. [Solução de Problemas]()
14. [Contribuição]()
15. [Licença]()
16. [Contato]()
17. [Recursos Adicionais]()

## 💻 Sobre o Projeto

O **Perfil Bíblico** é um jogo educativo **multiplayer** de perguntas e respostas, totalmente focado em temas bíblicos. Seu objetivo é proporcionar uma experiência divertida e interativa para que grupos possam testar e expandir seus conhecimentos sobre personagens, lugares e acontecimentos da Bíblia. É uma ferramenta perfeita para dinamizar encontros em **grupos de jovens, escolas dominicais ou reuniões familiares**, promovendo aprendizado e engajamento de forma leve e competitiva.

  * **Motivação**: Oferecer uma forma lúdica e acessível de aprendizado bíblico, adaptável a diversos contextos sociais e religiosos.
  * **Público-alvo**: Líderes de grupos religiosos, professores de escola dominical, famílias e qualquer pessoa interessada em um jogo educativo com temática bíblica.

## 🎯 Objetivos

### 🛠️ Técnicos

  * Fornecer um ambiente de jogo multiplayer robusto com comunicação em tempo real via **Socket.IO**.
  * Garantir uma **interface responsiva** que se adapte bem a diferentes dispositivos (desktop e mobile).
  * Implementar um sistema de **dicas progressivas** e pontuação dinâmica para um desafio crescente.
  * Desenvolver um sistema de **privacidade entre grupos** para garantir que cada equipe tenha uma experiência de jogo justa e focada.
  * Manter um **leaderboard persistente** para registrar e exibir os melhores desempenhos dos grupos.
  * Assegurar a **reconexão robusta** de jogadores em caso de desconexões.

## 🚀 Tecnologias

### Frontend

  * **HTML5**: Estrutura semântica e base das páginas.
  * **CSS3**: Estilos responsivos com variáveis CSS e flexbox/grid para layouts modernos.
  * **JavaScript ES6+**: Lógica do jogo, interatividade e comunicação assíncrona (módulos, `async/await`, `destructuring`).
  * **Socket.IO Client**: Comunicação bidirecional e em tempo real com o servidor.

### Backend

  * **Node.js**: Ambiente de execução JavaScript para o servidor.
  * **Express.js**: Framework web para o servidor principal.
  * **Socket.IO**: Biblioteca para comunicação em tempo real (WebSockets).
  * **File System (fs)**: Persistência de dados (como o leaderboard) em arquivos JSON.

## ✨ Funcionalidades

### ✅ Implementadas

  * **Sistema Multiplayer Robusto**: Criação de salas com códigos únicos, permitindo que múltiplos grupos joguem simultaneamente.
  * **Reconexão Automática**: Recuperação de estado de jogo após desconexões inesperadas do cliente.
  * **Timer Animado**: Contador regressivo de 60 segundos com feedback sonoro para cada rodada.
  * **Dicas Progressivas**: Cada carta oferece 5 dicas com pontuações decrescentes (10, 8, 5, 3, 1 pontos), incentivando respostas rápidas.
  * **Interface Responsiva (Mobile-First)**: Design adaptado para funcionar perfeitamente em dispositivos móveis e desktops.
  * **Leaderboard Persistente**: Ranking dos melhores grupos, exibido na página inicial e salvo em `server/leaderboard.json`.
  * **Resultados Detalhados**: Estatísticas completas do jogo ao final da partida para análise de desempenho.
  * **Feedback Visual e Sonoro**: Animações e áudios que indicam acertos, erros, início de rodada e fim de tempo.
  * **Privacidade entre Grupos**: Durante o jogo, cada grupo vê apenas suas informações relevantes, mantendo o foco e a justiça.

### 🔄 Fluxo do Jogo Simplificado

1.  **Customização**: Os grupos inserem seus nomes e o código da sala (para criar ou entrar).
2.  **Configurações**: O criador da sala escolhe o número de rodadas (5, 10, 15, 20).
3.  **Intermissão**: Uma tela de espera enquanto o segundo grupo se conecta e ambos ficam prontos.
4.  **Jogo**: Turnos alternados entre os grupos. O grupo da vez recebe dicas progressivas para adivinhar a resposta.
5.  **Resultados**: Ao final das rodadas, são exibidas estatísticas detalhadas e o ranking final da partida.

## ⚙️ Pré-requisitos

  * **Node.js**: Versão 14 ou superior, para executar o servidor backend.
  * **NPM (Node Package Manager)**: Geralmente vem com o Node.js, para instalação das dependências.
  * **Navegador Moderno**: Chrome, Firefox, Edge ou Safari para o frontend.
  * **Conexão à Internet**: Necessária apenas para clonar o repositório e instalar as dependências.

## 🛠️ Instalação e Execução

Para configurar e rodar o Perfil Bíblico em sua máquina local, siga os passos abaixo:

1.  **Clone o repositório ou baixe o projeto:**

    ```bash
    git clone https://github.com/seu-usuario/bible-game.git
    cd bible-game
    ```

2.  **Navegue até o diretório do servidor:**

    ```bash
    cd server
    ```

3.  **Instale as dependências do backend:**

    ```bash
    npm install
    ```

4.  **Inicie o servidor:**

    ```bash
    npm run dev
    ```

    O servidor estará ativo e pronto para receber conexões na porta 4000.

5.  **Acesse o jogo no seu navegador:**
    Abra seu navegador e digite a seguinte URL:

    ```
    http://localhost:4000
    ```

## 🎮 Como Jogar

O Perfil Bíblico oferece dois modos de jogo: o **Multiplayer (recomendado)** para interação em grupo e um **Modo Local** para desenvolvimento e testes rápidos.

### Modo Multiplayer (Recomendado)

Ideal para dois grupos competindo.

1.  **Acesse o Jogo**: Com o servidor iniciado, abra `http://localhost:4000` no seu navegador.
2.  **Crie uma Sala**: Um dos grupos deve digitar o nome do seu grupo e clicar em "Criar Sala".
3.  **Compartilhe o Código**: Um código de 4 letras será gerado. Compartilhe-o com o segundo grupo.
4.  **Aguarde o Outro Grupo**: O segundo grupo deve inserir o mesmo código e seu nome para entrar na sala.
5.  **Configure o Jogo**: O criador da sala pode escolher o número de rodadas (5, 10, 15 ou 20).
6.  **Jogue**: Os grupos alternarão turnos. O grupo da vez receberá dicas progressivas para adivinhar a resposta. Responda corretamente para pontuar\!
7.  **Veja os Resultados**: Ao final, estatísticas completas e o ranking da partida serão exibidos.

### Modo Local (Desenvolvimento)

Este modo é simplificado, sem necessidade de servidor, ideal para desenvolvimento e testes rápidos.

1.  Abra o arquivo `index.html` diretamente no navegador.
2.  Clique em "Iniciar" e configure o número de rodadas.
3.  Jogue localmente, alternando entre "Grupo 1" e "Grupo 2".

## 📂 Estrutura do Projeto

A arquitetura do projeto é dividida entre o frontend (SPA) e o backend (servidor Node.js), com arquivos de áudio na raiz.

```
bible-game/
├── index.html                  # Página inicial principal do frontend
├── README.md                   # Este documento
├── DOCUMENTATION.md            # Documentação técnica mais detalhada do projeto
├── server/                     # Diretório do Backend (Node.js)
│   ├── server.js               # Servidor principal (Express e Socket.IO)
│   ├── package.json            # Configurações e dependências do backend
│   └── leaderboard.json        # Arquivo de persistência do ranking de grupos
├── src/                        # Diretório do Frontend (HTML, CSS, JS)
│   ├── css/style.css           # Estilos globais e responsivos da aplicação
│   ├── html/                   # Páginas HTML específicas do jogo
│   │   ├── customization.html  # Tela para criação/entrada em salas
│   │   ├── settings.html       # Tela de configurações de rodadas
│   │   ├── intermission.html   # Tela de espera entre os grupos
│   │   ├── game.html           # Interface principal do jogo
│   │   └── end.html            # Tela de resultados finais
│   └── js/                     # Lógica JavaScript do frontend
│       ├── main.js             # Ponto de entrada e inicialização do frontend
│       ├── cards.js            # Lógica para carregamento e manipulação das cartas
│       ├── cards.json          # Dados das perguntas e respostas (cartas do jogo)
│       ├── gameLogic.js        # Lógica central do jogo (turnos, pontuação, etc.)
│       ├── socket.js           # Gerenciamento da comunicação com o servidor via Socket.IO
│       ├── ui.js               # Funções para manipulação da interface do usuário e animações
│       └── timer.js            # Implementação do sistema de timer do jogo
└── heartbeat.mp3 & buzzer.mp3  # Arquivos de áudio para feedback sonoro
```

## 📊 Sistema de Pontuação

A pontuação é baseada na dificuldade das dicas utilizadas para acertar a resposta:

  * **Dica 1 (mais difícil)**: 10 pontos
  * **Dica 2**: 8 pontos
  * **Dica 3**: 5 pontos
  * **Dica 4**: 3 pontos
  * **Dica 5 (mais fácil)**: 1 ponto

## 🔒 Sistema de Privacidade

Para garantir uma experiência de jogo justa e focada, o Perfil Bíblico implementa um sistema de privacidade entre os grupos durante a partida:

### Durante o Jogo

  * **Grupo Ativo**: Apenas o grupo que está no seu turno de jogo visualiza a categoria, as dicas, o campo de resposta e o feedback específico sobre seu acerto ou erro.
  * **Grupo Aguardando**: O grupo que está esperando seu turno vê apenas uma mensagem de aguardo e o timer compartilhado.
  * **Timer Compartilhado**: Ambos os grupos visualizam a mesma contagem regressiva, mantendo a noção de tempo da rodada.
  * **Placar Visível**: A pontuação de ambos os grupos é sempre visível para todos, permitindo acompanhar o progresso da partida.

### Feedback Privado

  * **Acertos e Erros**: O feedback visual de acerto ou erro (animações e mensagens) é exibido exclusivamente para o grupo que acabou de jogar.
  * **Áudios Específicos**: Os sons de acerto e erro são reproduzidos apenas para o grupo que está jogando no momento.
  * **Vitória/Derrota**: Ao final da partida, sons específicos indicam a vitória ou derrota para cada grupo individualmente.

## 🎨 Design

O design do Perfil Bíblico foi pensado para ser limpo, intuitivo e responsivo.

### Paleta de Cores

  * **Primária**: `#4b2e83` (Roxo) - Usada para elementos principais e fundo.
  * **Secundária**: `#f7c873` (Dourado) - Para elementos de destaque e interativos.
  * **Acento**: `#2e8b57` (Verde) - Usada para detalhes e ações importantes.
  * **Sucesso**: `#43aa8b` (Verde-azulado) - Indica feedback positivo.

### Responsividade

  * **Mobile-First**: O desenvolvimento foi iniciado com foco em dispositivos móveis, garantindo uma excelente experiência em telas menores.
  * **Breakpoints**: O design se adapta a telas maiores com um breakpoint principal em 600px, otimizando a visualização para tablets e desktops.
  * **Layout Moderno**: Utilização de **Flexbox** e **CSS Grid** para criar layouts flexíveis e eficientes.

## 🔧 Personalização

O projeto permite algumas personalizações simples para adaptar o jogo às suas necessidades:

### Adicionar Novas Cartas (Perguntas e Respostas)

Para expandir o banco de perguntas, edite o arquivo `src/js/cards.json`. Cada objeto JSON representa uma carta e deve seguir a estrutura:

```json
{
  "category": "Pessoa|Lugar|Acontecimento",
  "answer": "Resposta",
  "hints": ["Dica 1", "Dica 2", "Dica 3", "Dica 4", "Dica 5"]
}
```

  * `category`: Defina a categoria da carta (ex: "Pessoa", "Lugar", "Acontecimento").
  * `answer`: A resposta correta da carta.
  * `hints`: Um array com 5 dicas, ordenadas da mais difícil (10 pontos) para a mais fácil (1 ponto).

### Modificar Estilos Visuais

Para alterar as cores e outros estilos globais da aplicação, edite as variáveis CSS no arquivo `src/css/style.css`:

```css
:root {
  --primary: #4b2e83;    /* Cor principal */
  --secondary: #f7c873;  /* Cor secundária */
  --accent: #2e8b57;     /* Cor de destaque */
  /* Adicione ou modifique outras variáveis de estilo aqui */
}
```

Você pode ajustar os valores hexadecimais para personalizar a paleta de cores do jogo.

## 📈 Leaderboard

O Perfil Bíblico mantém um sistema de ranking para registrar e exibir os grupos com os melhores desempenhos:

  * **Top 10**: Os 10 melhores resultados são exibidos na página inicial do jogo.
  * **Persistência**: Os dados do leaderboard são automaticamente salvos no arquivo `server/leaderboard.json`, garantindo que os resultados não se percam ao reiniciar o servidor.
  * **Métricas Registradas**: Cada entrada no leaderboard inclui a pontuação total do grupo, o número de acertos e a data da partida, permitindo uma visão completa dos resultados históricos.

## 🚨 Solução de Problemas

Se você encontrar algum problema ao instalar ou executar o projeto, verifique as seguintes soluções comuns:

### Servidor não inicia

  * **Verifique a versão do Node.js**: Certifique-se de que você tem o Node.js na versão 14 ou superior instalada. Você pode verificar com:
    ```bash
    node --version
    ```
  * **Reinstale as dependências**: Às vezes, as dependências podem estar corrompidas. Tente remover e reinstalar:
    ```bash
    rm -rf node_modules
    npm install
    ```
  * **Verifique as mensagens de erro**: O console do terminal geralmente fornece mensagens de erro detalhadas. Leia-as cuidadosamente para identificar a causa.

### Erro de conexão no navegador

  * **Verifique se o servidor está rodando**: Confirme se o comando `npm run dev` foi executado e não apresentou erros. O servidor deve estar escutando na porta `4000`.
  * **Firewall**: Verifique se o firewall do seu sistema operacional não está bloqueando a conexão na porta `4000`.
  * **URL Correta**: Certifique-se de que você está acessando `http://localhost:4000` no seu navegador.
  * **Conflito de Porta**: Verifique se outra aplicação não está usando a porta `4000`. Você pode tentar mudar a porta no `server.js` se for o caso.

### Problemas de áudio

  * **Arquivos de áudio ausentes**: Certifique-se de que os arquivos `heartbeat.mp3` e `buzzer.mp3` estão localizados na raiz do diretório `bible-game/`.
  * **Permissões do navegador**: Alguns navegadores podem exigir que você interaja com a página (clique em algum botão, por exemplo) antes de permitir a reprodução de áudio automático.
  * **Formato de áudio**: Verifique se os arquivos `.mp3` não estão corrompidos ou em um formato incompatível.

## 🤝 Contribuição

Contribuições são muito bem-vindas\! Se você deseja ajudar a melhorar o Perfil Bíblico, siga estas diretrizes:

### Para Desenvolvedores

1.  **Leia a Documentação Completa**: Antes de começar, consulte o arquivo `DOCUMENTATION.md` para uma compreensão mais aprofundada da arquitetura e detalhes técnicos do projeto.
2.  **Mantenha a Modularização**: Procure manter a estrutura de código existente e a separação de responsabilidades entre os módulos (frontend e backend).
3.  **Teste em Diferentes Dispositivos**: Teste suas alterações em navegadores desktop e mobile para garantir a responsividade.
4.  **Documente Novas Funcionalidades**: Se você adicionar novas funcionalidades complexas, considere atualizá-las no `DOCUMENTATION.md` ou nos comentários do código.

### Estrutura de Commits (Recomendado)

Para manter um histórico de commits claro e consistente, sugerimos o uso da seguinte convenção:

  * `feat:`: Para novas funcionalidades.
      * Ex: `feat: Adiciona sistema de dicas progressivas`
  * `fix:`: Para correção de bugs.
      * Ex: `fix: Corrige erro de conexão do socket`
  * `docs:`: Para atualizações na documentação.
      * Ex: `docs: Atualiza seção de instalação no README`
  * `style:`: Para mudanças de UI/UX que não alteram a lógica (formatação, CSS).
      * Ex: `style: Ajusta espaçamento de botões no mobile`

### Processo de Contribuição

1.  **Faça um Fork**: Faça um fork deste repositório para sua conta no GitHub.
2.  **Clone o Fork**: Clone seu fork para sua máquina local.
3.  **Crie uma Branch**: Crie uma nova branch para sua feature ou correção (`git checkout -b feature/minha-nova-funcionalidade`).
4.  **Desenvolva**: Implemente suas alterações.
5.  **Commit**: Faça commits com mensagens claras, seguindo a estrutura acima.
6.  **Push**: Envie suas alterações para o seu fork (`git push origin feature/minha-nova-funcionalidade`).
7.  **Abra um Pull Request**: No GitHub, abra um Pull Request do seu fork para a branch `main` deste repositório, descrevendo suas alterações.

## 📜 Licença

Este projeto está licenciado sob a **MIT License**.
Você pode usar, copiar, modificar, mesclar, publicar, distribuir, sublicenciar e/ou vender cópias do software para fins educacionais e recreativos.
Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

  * **Autor**: Lucas Leria
  * **GitHub**: [lucasgleria](https://github.com/lucasgleria)
  * **LinkedIn**: [lucasgleria](https://www.linkedin.com/in/lucasgleria/)

## 🔍 Recursos Adicionais

  * [Node.js](https://nodejs.org/pt) - Documentação oficial do Node.js.
  * [Express.js](https://expressjs.com/pt-br/) - Documentação oficial do Express.js.
  * [Socket.IO](https://socket.io/docs/) - Documentação oficial do Socket.IO.
  * [MDN Web Docs (HTML, CSS, JS)](https://developer.mozilla.org/pt-BR/docs/Web) - Ótimo recurso para aprender sobre tecnologias web.
