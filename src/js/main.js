// main.js
// Ponto de entrada do app

import { loadCards } from './cards.js';
import { startGame, checkAnswer } from './gameLogic.js';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const cards = await loadCards();
    // Inicializar o jogo com as cartas carregadas
    // Botão de começar
    const startBtn = document.querySelector('#controls button');
    if (startBtn) {
      startBtn.onclick = () => startGame(cards);
    }
    // Botão de resposta
    const answerBtn = document.querySelector('#answer-area button');
    if (answerBtn) {
      answerBtn.onclick = checkAnswer;
    }
    // Enter no input de resposta
    const guessInput = document.getElementById('guess');
    if (guessInput) {
      guessInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') checkAnswer();
      });
    }
  } catch (e) {
    alert('Erro ao carregar cartas do jogo.');
    console.error(e);
  }
}); 