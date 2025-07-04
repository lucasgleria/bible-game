// src/js/socket.js

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
  configurarSala,
  pedirEstadoSala,
  _socket: socket
}; 