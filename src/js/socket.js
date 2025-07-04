// src/js/socket.js
// Funções de áudio serão chamadas diretamente quando disponíveis

const socket = io();

// Cria uma nova sala
function criarSala(nomeGrupo, callback, groupUUID) {
  socket.emit('criarSala', { nomeGrupo, groupUUID }, callback);
}

// Entra em uma sala existente
function entrarSala(codigo, nomeGrupo, callback, groupUUID) {
  socket.emit('entrarSala', { codigo, nomeGrupo, groupUUID }, callback);
}

// Marca o grupo como pronto
function grupoPronto() {
  socket.emit('grupoPronto');
}

// Recebe atualizações da sala (grupos e status)
function onAtualizarSala(callback) {
  socket.on('atualizarSala', callback);
}

// Recebe evento de início de jogo
function onIniciarJogo(callback) {
  socket.on('iniciarJogo', callback);
}

// Pede uma nova dica
function pedirDica() {
  socket.emit('pedirDica');
}

// Envia resposta
function responder(resposta) {
  socket.emit('responder', resposta);
}

// Recebe atualizações do estado do jogo
function onAtualizarJogo(callback) {
  socket.on('atualizarJogo', callback);
}

// Recebe feedback de acerto/erro
function onFeedback(callback) {
  socket.on('feedback', callback);
}

// Recebe fim de jogo
function onFimJogo(callback) {
  socket.on('fimJogo', callback);
}

// Recebe atualizações do timer
function onAtualizarTimer(callback) {
  socket.on('atualizarTimer', callback);
}

// Recebe evento de tempo esgotado
function onTempoEsgotado(callback) {
  socket.on('tempoEsgotado', callback);
}

// Recebe eventos de áudio
function onAudioEvent(callback) {
  socket.on('audioEvent', (data) => {
    // Executar ação de áudio baseada no tipo
    switch (data.tipo) {
      case 'success':
        if (typeof playSuccess === 'function') playSuccess();
        break;
      case 'buzzer':
        if (typeof playBuzzer === 'function') playBuzzer();
        break;
      case 'heartbeat':
        if (data.acao === 'play') {
          if (typeof playHeartbeat === 'function') playHeartbeat();
        } else if (data.acao === 'stop') {
          if (typeof stopHeartbeat === 'function') stopHeartbeat();
        }
        break;
      case 'victory':
        if (typeof playVictory === 'function') playVictory();
        break;
      case 'lost':
        if (typeof playLost === 'function') playLost();
        break;
    }
    
    // Chamar callback se fornecido
    if (callback) callback(data);
  });
}

// Configura a sala (apenas criador)
function configurarSala(codigo, configuracoes, callback) {
  socket.emit('configurarSala', { codigo, configuracoes }, callback);
}

// Solicita o estado atual da sala
function pedirEstadoSala(codigo, callback) {
  socket.emit('pedirEstadoSala', codigo, callback);
}

// Exporta funções para uso nas telas
window.salaSocket = {
  criarSala,
  entrarSala,
  grupoPronto,
  onAtualizarSala,
  onIniciarJogo,
  pedirDica,
  responder,
  onAtualizarJogo,
  onFeedback,
  onFimJogo,
  onAtualizarTimer,
  onTempoEsgotado,
  onAudioEvent,
  configurarSala,
  pedirEstadoSala,
  _socket: socket
}; 