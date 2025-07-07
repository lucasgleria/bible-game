# Guia do Desenvolvedor - Sistema de Privacidade

## 🚀 Início Rápido

### Pré-requisitos
- Node.js (versão 14+)
- Conhecimento básico de JavaScript ES6+
- Familiaridade com Socket.IO

### Instalação
```bash
cd bible-game/server
npm install
npm run dev
```

## 🔧 Modificações Principais

### 1. Frontend - Privacidade de Interface

**Arquivo**: `src/js/main.js`
**Função**: `renderMultiplayerState()`

#### O que foi modificado:
```javascript
// ANTES: Todos viam tudo
category.textContent = `Categoria: ${estado.carta.categoria}`;
hints.innerHTML = ''; // Sempre mostrava dicas
answerArea.style.display = 'block'; // Sempre visível

// DEPOIS: Lógica condicional
const isMyTurn = estado.turno === grupoIndex && grupoIndex !== -1;

if (isMyTurn) {
  // Grupo que está jogando - mostra tudo
  category.textContent = `Categoria: ${estado.carta.categoria}`;
  // Mostrar dicas, input, botão de dica
} else {
  // Grupo que está aguardando - oculta informações
  category.textContent = 'Aguarde sua vez...';
  // Ocultar dicas, input, botão de dica
  // Mostrar mensagem de aguardo
}
```

#### Como modificar:
```javascript
// Para adicionar novo elemento privado
if (isMyTurn) {
  document.getElementById('novo-elemento').style.display = 'block';
} else {
  document.getElementById('novo-elemento').style.display = 'none';
}
```

### 2. Backend - Feedback Privado

**Arquivo**: `server/server.js`
**Evento**: `responder`

#### O que foi modificado:
```javascript
// ANTES: Feedback público
io.to(codigo).emit('feedback', { tipo: 'acerto', pontos });
io.to(codigo).emit('audioEvent', { tipo: 'success', acao: 'play' });

// DEPOIS: Feedback privado
io.to(socket.id).emit('feedback', { tipo: 'acerto', pontos });
io.to(socket.id).emit('audioEvent', { tipo: 'success', acao: 'play' });
```

#### Como adicionar novo evento privado:
```javascript
// No servidor
io.to(socket.id).emit('novoEventoPrivado', dados);

// No cliente (socket.js)
function onNovoEventoPrivado(callback) {
  socket.on('novoEventoPrivado', callback);
}

// No main.js
window.salaSocket.onNovoEventoPrivado((dados) => {
  // Lógica específica
});
```

## 🎨 Personalização da Interface

### Modificar Mensagem de Aguardo

**Localização**: `src/js/main.js` linha ~130

```javascript
// Mensagem atual
resultDiv.innerHTML = `
  <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px; margin: 20px 0;">
    <p style="font-size: 1.2em; font-weight: 600; color: var(--primary); margin-bottom: 10px;">
      ${currentPlayingGroup ? currentPlayingGroup.nome : 'Grupo ' + (estado.turno + 1)} está jogando
    </p>
    <p style="color: #666; font-size: 1em;">
      Aguarde a vez do seu grupo
    </p>
  </div>
`;

// Personalizar:
resultDiv.innerHTML = `
  <div style="text-align: center; padding: 20px; background: #e3f2fd; border-radius: 12px; margin: 20px 0;">
    <p style="font-size: 1.2em; font-weight: 600; color: #1976d2; margin-bottom: 10px;">
      ⏳ ${currentPlayingGroup.nome} está jogando
    </p>
    <p style="color: #666; font-size: 1em;">
      Aguarde a vez do seu grupo
    </p>
    <div style="margin-top: 10px; font-size: 0.9em; color: #999;">
      Tempo restante: <span id="waiting-timer">--</span>s
    </div>
  </div>
`;
```

### Adicionar Elementos Compartilhados

Elementos que devem ser visíveis para ambos os grupos:

```javascript
// Sempre visível (não depende de isMyTurn)
if (estado.timer && typeof renderTimer === 'function') {
  renderTimer(estado.timer.tempo, estado.timer.maxTempo);
}

// Placar sempre visível
const pGrupo1 = scoreboard.children[0];
const pGrupo2 = scoreboard.children[1];
// ... lógica do placar
```

## 🧪 Testes

### Cenários de Teste

#### 1. Teste de Privacidade
```javascript
// Adicionar logs para debug
console.log('[TEST] Grupo local:', grupoIndex);
console.log('[TEST] Turno atual:', estado.turno);
console.log('[TEST] É meu turno:', isMyTurn);
console.log('[TEST] Elementos visíveis:', {
  categoria: document.getElementById('category').textContent,
  dicas: document.getElementById('hints').children.length,
  input: document.getElementById('answer-area').style.display
});
```

#### 2. Teste de Performance
```javascript
// Medir tempo de transição
const startTime = performance.now();
renderMultiplayerState(estado);
const endTime = performance.now();
console.log('[PERF] Tempo de renderização:', endTime - startTime, 'ms');
```

### Validação Manual

1. **Abrir duas abas** do navegador
2. **Criar sala** em uma aba
3. **Entrar na sala** na outra aba
4. **Iniciar jogo** e verificar:
   - Grupo ativo vê perguntas e dicas
   - Grupo aguardando vê mensagem de aguardo
   - Timer visível para ambos
   - Feedback apenas para quem está jogando

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Grupo vê informações do outro
```javascript
// Verificar se grupoIndex está correto
console.log('[DEBUG] teamName:', teamName);
console.log('[DEBUG] grupos:', estado.grupos.map(g => g.nome));
console.log('[DEBUG] grupoIndex:', grupoIndex);
```

#### 2. Mensagem de aguardo não aparece
```javascript
// Verificar se elemento result existe
const resultDiv = document.getElementById('result');
if (!resultDiv) {
  console.error('[ERROR] Elemento result não encontrado');
  return;
}
```

#### 3. Feedback aparece para todos
```javascript
// Verificar se evento está sendo enviado corretamente
// No servidor, usar:
io.to(socket.id).emit('feedback', dados);
// Em vez de:
io.to(codigo).emit('feedback', dados);
```

### Logs Úteis

```javascript
// Adicionar no main.js para debug
console.log('[PRIVACY] Estado recebido:', estado);
console.log('[PRIVACY] Grupo local:', grupoIndex);
console.log('[PRIVACY] Turno atual:', estado.turno);
console.log('[PRIVACY] É meu turno:', isMyTurn);
```

## 📈 Métricas

### KPIs para Monitorar
- **Taxa de Privacidade**: 100% (nenhum grupo vê informações do outro)
- **Tempo de Transição**: < 500ms entre turnos
- **Taxa de Erro**: < 1% em eventos privados
- **Performance**: < 100ms para renderização

### Logs de Performance
```javascript
// Adicionar métricas de performance
const metrics = {
  renderTime: 0,
  privacyViolations: 0,
  transitionTime: 0
};

// Logar métricas
console.log('[METRICS]', metrics);
```

## 🔮 Extensões Futuras

### 1. Modo Espectador
```javascript
// Adicionar terceiro tipo de usuário
const userType = 'spectator'; // 'player' | 'spectator'

if (userType === 'spectator') {
  // Mostrar apenas timer e placar
  // Ocultar todas as perguntas
}
```

### 2. Replay Privado
```javascript
// Salvar histórico de jogadas por grupo
const gameHistory = {
  [grupo1Id]: [...],
  [grupo2Id]: [...]
};

// Mostrar apenas jogadas do próprio grupo
```

### 3. Estatísticas Privadas
```javascript
// Estatísticas específicas por grupo
const privateStats = {
  [grupo1Id]: { acertos: 5, tempoMedio: 30 },
  [grupo2Id]: { acertos: 3, tempoMedio: 45 }
};
```

## 📚 Recursos Adicionais

### Documentação Relacionada
- `PRIVACY_SYSTEM.md`: Documentação técnica completa
- `README.md`: Visão geral do projeto
- `CHANGELOG.md`: Histórico de mudanças

### Arquivos Principais
- `src/js/main.js`: Lógica de privacidade frontend
- `server/server.js`: Eventos privados backend
- `src/js/socket.js`: Comunicação Socket.IO

### Comandos Úteis
```bash
# Iniciar servidor
npm run dev

# Ver logs em tempo real
tail -f server/logs/app.log

# Testar conectividade
curl http://localhost:4001/leaderboard
```

---

**Versão**: 1.1.0  
**Última Atualização**: Janeiro 2024  
**Status**: ✅ Implementado e Documentado 