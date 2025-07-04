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
  document.getElementById('team1-label').innerHTML = `${estado.grupos[0]}: <span id='score1'>${estado.pontuacao[0]}</span>`;
  document.getElementById('score2').textContent = estado.pontuacao[1];
  document.getElementById('category').textContent = `Categoria: ${estado.carta.categoria}`;
  let ul = document.getElementById('hints');
  ul.innerHTML = '';
  estado.carta.dicas.forEach((hint, i) => {
    let li = document.createElement('li');
    li.textContent = `${i + 1}. ${hint}`;
    ul.appendChild(li);
  });
  const teamName = localStorage.getItem('teamName');
  const grupoIndex = estado.grupos.findIndex(n => n === teamName);
  if (estado.turno === grupoIndex) {
    document.getElementById('answer-area').style.display = '';
  } else {
    document.getElementById('answer-area').style.display = 'none';
  }
  document.getElementById('result').textContent = '';
  highlightGroupTurn();
} 