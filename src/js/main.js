// main.js
// Ponto de entrada do app

import { loadCards } from './cards.js';
import { startGame, checkAnswer, nextRound, highlightGroupTurn } from './gameLogic.js';
import { showFeedback } from './ui.js';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const cards = await loadCards();
    const isMultiplayer = !!localStorage.getItem('roomCode');
    const startBtn = document.querySelector('#controls button');
    const answerBtn = document.querySelector('#answer-area button');
    const guessInput = document.getElementById('guess');
    const roomCode = localStorage.getItem('roomCode');

    if (isMultiplayer && window.salaSocket) {
      // Nunca iniciar jogo localmente!
      if (startBtn) startBtn.style.display = 'none';
      // Ao entrar/recarregar, pedir estado da sala
      if (roomCode) {
        window.salaSocket.pedirEstadoSala(roomCode, (estado) => {
          if (estado) {
            // Renderizar imediatamente o estado recebido
            renderMultiplayerState(estado);
          }
        });
      }
      // Recebe início do jogo do backend
      window.salaSocket.onIniciarJogo(() => {
        // O backend vai emitir o estado inicial via onAtualizarJogo
      });
      // Atualiza interface do jogo conforme estado do backend
      window.salaSocket.onAtualizarJogo(renderMultiplayerState);
      // Botão de resposta envia para o backend
      if (answerBtn) {
        answerBtn.onclick = function() {
          const resposta = document.getElementById('guess').value;
          window.salaSocket.responder(resposta);
          document.getElementById('guess').value = '';
        };
      }
      if (guessInput) {
        guessInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            const resposta = document.getElementById('guess').value;
            window.salaSocket.responder(resposta);
            document.getElementById('guess').value = '';
          }
        });
      }
      // Feedback do backend
      window.salaSocket.onFeedback(({ tipo, pontos }) => {
        if (tipo === 'acerto') {
          showFeedback('success', `Acertou! +${pontos} pontos`);
        } else {
          showFeedback('error', 'Errado');
        }
      });
      // Fim de jogo
      window.salaSocket.onFimJogo(({ pontuacao, acertos, grupos }) => {
        let msg = `Fim do jogo!\n${grupos[0]}: ${pontuacao[0]} pontos (${acertos[0]} acertos)\n${grupos[1]}: ${pontuacao[1]} pontos (${acertos[1]} acertos)`;
        alert(msg);
        window.location.href = 'end.html';
      });
    } else {
      // Modo local: fluxo antigo
      if (startBtn) {
        startBtn.onclick = () => startGame(cards);
      }
      if (answerBtn) {
        answerBtn.onclick = checkAnswer;
      }
      if (guessInput) {
        guessInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') checkAnswer();
        });
      }
    }
  } catch (e) {
    alert('Erro ao carregar cartas do jogo.');
    console.error(e);
  }
});

// Função para renderizar o estado do jogo multiplayer
function renderMultiplayerState(estado) {
  // Guard clause: não renderizar se não houver grupos
  if (!estado.grupos || estado.grupos.length === 0) {
    console.warn('[DEBUG] Estado do jogo sem grupos, aguardando atualização...');
    return;
  }
  // Aguarda DOM pronto
  const answerArea = document.getElementById('answer-area');
  const team1Label = document.getElementById('team1-label');
  const score2 = document.getElementById('score2');
  const category = document.getElementById('category');
  const hints = document.getElementById('hints');
  const hintsArea = document.getElementById('hints-area');
  if (!answerArea || !team1Label || !score2 || !category || !hints || !hintsArea) {
    setTimeout(() => renderMultiplayerState(estado), 50);
    return;
  }
  const teamName = localStorage.getItem('teamName');
  // LOGS DE DEPURAÇÃO
  console.log('[DEBUG] Nome do grupo local:', teamName);
  console.log('[DEBUG] Grupos recebidos do backend:', estado.grupos);
  const grupoIndex = estado.grupos.findIndex(n => n === teamName);
  console.log('[DEBUG] Índice do grupo local:', grupoIndex, '| Turno atual:', estado.turno);
  // Corrigir nomes dos grupos no placar
  team1Label.innerHTML = `${estado.grupos[0] || 'Grupo 1'}: <span id='score1'>${estado.pontuacao[0]}</span>`;
  score2.textContent = estado.pontuacao[1];
  if (estado.grupos[1]) {
    document.getElementById('scoreboard').children[1].textContent = `${estado.grupos[1]}: ${estado.pontuacao[1]}`;
  }
  category.textContent = `Categoria: ${estado.carta.categoria}`;
  // Renderizar dicas SEMPRE
  hints.innerHTML = '';
  let dicasParaExibir = estado.carta.dicas;
  if ((!dicasParaExibir || dicasParaExibir.length === 0) && estado.carta && estado.carta.dicasOriginais && estado.carta.dicasOriginais.length > 0) {
    dicasParaExibir = [estado.carta.dicasOriginais[0]];
  }
  dicasParaExibir.forEach((hint, i) => {
    let li = document.createElement('li');
    li.textContent = `${i + 1}. ${hint}`;
    hints.appendChild(li);
  });
  // Exibir input de resposta apenas para o grupo da vez
  if (estado.turno === grupoIndex) {
    answerArea.style.display = 'block';
    const guessInput = answerArea.querySelector('#guess');
    const answerBtn = answerArea.querySelector('button');
    if (guessInput) guessInput.disabled = false;
    if (answerBtn) answerBtn.disabled = false;
  } else {
    answerArea.style.display = 'none';
  }
  document.getElementById('result').textContent = '';
  highlightGroupTurn();
} 