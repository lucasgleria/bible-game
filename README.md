# Perfil Bíblico

Um jogo educativo multiplayer de perguntas e respostas baseado em personagens, lugares e acontecimentos da Bíblia. Ideal para dinâmicas em grupos de jovens, escolas dominicais ou encontros familiares.

## 🎮 Como Jogar

### Modo Multiplayer (Recomendado)
1. **Acesse**: `http://localhost:4000` (após iniciar o servidor)
2. **Crie uma Sala**: Digite o nome do seu grupo e clique em "Criar Sala"
3. **Compartilhe o Código**: O código de 4 letras gerado
4. **Aguarde o Outro Grupo**: O segundo grupo entra com o mesmo código
5. **Configure o Jogo**: Escolha o número de rodadas (5, 10, 15, 20)
6. **Jogue**: Alternem turnos para adivinhar com dicas progressivas
7. **Veja os Resultados**: Estatísticas completas ao final

### Modo Local (Desenvolvimento)
1. Abra o `index.html` diretamente no navegador
2. Clique em "Iniciar" e configure as rodadas
3. Jogue localmente com dois grupos

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- Navegador moderno (Chrome, Firefox, Edge, Safari)

### Passos
```bash
# 1. Clone ou baixe o projeto
cd bible-game/server

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm run dev

# 4. Acesse no navegador
# http://localhost:4000
```

## 📁 Estrutura do Projeto

```
bible-game/
├── index.html                 # Página inicial
├── README.md                  # Esta documentação
├── DOCUMENTATION.md           # Documentação completa
├── server/                    # Backend
│   ├── server.js             # Servidor principal
│   ├── package.json          # Dependências
│   └── leaderboard.json      # Histórico de resultados
├── src/                       # Frontend
│   ├── css/style.css         # Estilos responsivos
│   ├── html/                 # Telas do jogo
│   │   ├── customization.html # Criação/entrada em salas
│   │   ├── settings.html     # Configurações
│   │   ├── intermission.html # Aguardando grupos
│   │   ├── game.html         # Interface do jogo
│   │   └── end.html          # Resultados finais
│   └── js/                   # Lógica do jogo
│       ├── main.js           # Ponto de entrada
│       ├── cards.js          # Carregamento de cartas
│       ├── cards.json        # Dados das cartas
│       ├── gameLogic.js      # Lógica do jogo
│       ├── socket.js         # Comunicação com servidor
│       ├── ui.js             # Interface e animações
│       └── timer.js          # Sistema de timer
└── heartbeat.mp3 & buzzer.mp3 # Áudios de feedback
```

## 🎯 Funcionalidades

### ✅ Implementadas
- **Sistema Multiplayer**: Salas com códigos únicos
- **Reconexão Robusta**: Recuperação após desconexão
- **Timer Animado**: 60 segundos com feedback sonoro
- **Dicas Progressivas**: 5 dicas por carta (10, 8, 5, 3, 1 pontos)
- **Interface Responsiva**: Desktop e mobile
- **Leaderboard**: Histórico de melhores grupos
- **Resultados Detalhados**: Estatísticas completas
- **Feedback Visual/Sonoro**: Animações e áudios

### 🔄 Fluxo do Jogo
1. **Customização** → Nome do grupo e código da sala
2. **Configurações** → Número de rodadas
3. **Intermissão** → Aguardando grupos ficarem prontos
4. **Jogo** → Alternância de turnos com dicas
5. **Resultados** → Estatísticas finais e ranking

## 🛠️ Tecnologias

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Estilos responsivos com variáveis CSS
- **JavaScript ES6+**: Módulos, async/await, destructuring
- **Socket.IO Client**: Comunicação real-time

### Backend
- **Node.js**: Runtime JavaScript
- **Express.js**: Servidor web
- **Socket.IO**: Comunicação real-time
- **File System**: Persistência em JSON

## 📊 Sistema de Pontuação

- **Dica 1**: 10 pontos (mais difícil)
- **Dica 2**: 8 pontos
- **Dica 3**: 5 pontos
- **Dica 4**: 3 pontos
- **Dica 5**: 1 ponto (mais fácil)

## 🎨 Design

### Paleta de Cores
- **Primária**: `#4b2e83` (Roxo)
- **Secundária**: `#f7c873` (Dourado)
- **Acento**: `#2e8b57` (Verde)
- **Sucesso**: `#43aa8b` (Verde-azulado)

### Responsividade
- **Mobile-First**: Design adaptado para dispositivos móveis
- **Breakpoints**: 600px para tablets/desktop
- **Flexbox/Grid**: Layouts modernos

## 🔧 Personalização

### Adicionar Novas Cartas
Edite `src/js/cards.json`:
```json
{
  "category": "Pessoa|Lugar|Acontecimento",
  "answer": "Resposta",
  "hints": ["Dica 1", "Dica 2", "Dica 3", "Dica 4", "Dica 5"]
}
```

### Modificar Estilos
Edite `src/css/style.css`:
```css
:root {
  --primary: #4b2e83;    /* Cor principal */
  --secondary: #f7c873;  /* Cor secundária */
  --accent: #2e8b57;     /* Cor de destaque */
}
```

## 📈 Leaderboard

O sistema mantém um ranking dos melhores grupos:
- **Top 10**: Exibido na página inicial
- **Persistência**: Dados salvos em `server/leaderboard.json`
- **Métricas**: Pontos, acertos e data da partida

## 🚨 Solução de Problemas

### Servidor não inicia
```bash
# Verificar Node.js
node --version

# Reinstalar dependências
rm -rf node_modules
npm install
```

### Erro de conexão
- Verifique se o servidor está rodando na porta 4000
- Confirme se não há firewall bloqueando
- Teste com `http://localhost:4000`

### Problemas de áudio
- Certifique-se de que `heartbeat.mp3` e `buzzer.mp3` estão na raiz
- Verifique permissões de áudio no navegador

## 🤝 Contribuição

### Para Desenvolvedores
1. Leia `DOCUMENTATION.md` para detalhes técnicos
2. Mantenha a modularização existente
3. Teste em diferentes dispositivos
4. Documente novas funcionalidades

### Estrutura de Commits
- `feat:` Novas funcionalidades
- `fix:` Correções de bugs
- `docs:` Atualizações de documentação
- `style:` Mudanças de UI/UX

## 📄 Licença

Uso livre para fins educacionais e recreativos.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Consulte `DOCUMENTATION.md` para detalhes técnicos
3. Teste em diferentes navegadores
4. Verifique os logs do servidor

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2024  
**Status**: ✅ Funcional e Testado 