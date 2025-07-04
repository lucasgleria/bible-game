// main.js
// Ponto de entrada do app

import { loadCards } from './cards.js';
import { startGame, checkAnswer, nextRound, highlightGroupTurn } from './gameLogic.js';
import { showFeedback } from './ui.js';

// Tornar renderMultiplayerState global para ser acessível do game.html
window.renderMultiplayerState = function(estado) {
  console.log('[CLIENT RENDER] Estado recebido:', estado);
  // Guard clause: não renderizar se não houver grupos
  if (!estado.grupos || estado.grupos.length === 0) {
    console.warn('[DEBUG] Estado do jogo sem grupos, aguardando atualização...');
    return;
  }
  // Aguarda DOM pronto - Este timeout já estava lá e ajuda a garantir que o DOM esteja pronto
  const answerArea = document.getElementById('answer-area');
  const category = document.getElementById('category');
  const hints = document.getElementById('hints');
  const hintsArea = document.getElementById('hints-area');
  const scoreboard = document.getElementById('scoreboard'); // Obter o scoreboard

  if (!answerArea || !category || !hints || !hintsArea || !scoreboard) { // Incluir scoreboard na verificação
    setTimeout(() => renderMultiplayerState(estado), 50);
    return;
  }

  // --- ATENÇÃO AQUI: CORREÇÃO E SIMPLIFICAÇÃO DO PLACAR ---
  const pGrupo1 = scoreboard.children[0];
  const pGrupo2 = scoreboard.children[1];

  console.log('[CLIENT RENDER] Elemento pGrupo1:', pGrupo1);
  console.log('[CLIENT RENDER] Elemento pGrupo2:', pGrupo2);

  // Grupo 1
  if (estado.grupos[0]) {
    pGrupo1.innerHTML = `${estado.grupos[0].nome || 'Grupo 1'}: <span id='score1'>${estado.pontuacao[0]}</span>`;
  } else {
    pGrupo1.innerHTML = `Grupo 1: <span id='score1'>${estado.pontuacao[0]}</span>`;
  }

  // Grupo 2
  if (estado.grupos[1]) {
    pGrupo2.innerHTML = `${estado.grupos[1].nome || 'Grupo 2'}: <span id='score2'>${estado.pontuacao[1]}</span>`;
  } else {
    pGrupo2.innerHTML = `Grupo 2: <span id='score2'>${estado.pontuacao[1]}</span>`;
  }
  // --- FIM DA CORREÇÃO E SIMPLIFICAÇÃO DO PLACAR ---

  const teamName = localStorage.getItem('teamName'); // Esta linha e as seguintes estavam duplicadas após o erro de sintaxe, movi para a posição lógica.
  // LOGS DE DEPURAÇÃO
  console.log('[DEBUG] Nome do grupo local:', teamName);
  console.log('[DEBUG] Grupos recebidos do backend:', estado.grupos);

  // Encontrar o grupo correto, pois `estado.grupos` agora são objetos
  const eu = estado.grupos.find(g => g.nome === teamName);
  const grupoIndex = eu ? estado.grupos.indexOf(eu) : -1;

  console.log('[DEBUG] Índice do grupo local:', grupoIndex, '| Turno atual:', estado.turno);


  category.textContent = `Categoria: ${estado.carta.categoria}`;
  // Renderizar dicas SEMPRE
  hints.innerHTML = '';
  let dicasParaExibir = estado.carta.dicas;
  // Removi a lógica 'dicasOriginais' pois o backend já envia as dicas corretas
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
  highlightGroupTurn(); // Certifique-se de que highlightGroupTurn é importado e funciona com os IDs/classes corretas
} // <--- ESTA É A CHAVE DE FECHAMENTO FINAL PARA window.renderMultiplayerState!

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const cards = await loadCards();
    const isMultiplayer = !!localStorage.getItem('roomCode');
    const startBtn = document.querySelector('#controls button'); // Este botão não existe no game.html
    const answerBtn = document.getElementById('answer-area').querySelector('button'); // Acessar diretamente pelo id do pai
    const guessInput = document.getElementById('guess');
    const roomCode = localStorage.getItem('roomCode');

    if (isMultiplayer && window.salaSocket) {
      // Nunca iniciar jogo localmente!
      // Este `startBtn` é para o modo local. Removê-lo ou mover para um script condicional, se não for usado.
      if (startBtn) startBtn.style.display = 'none';

      // Recebe início do jogo do backend (primeira vez que o jogo realmente começa)
      window.salaSocket.onIniciarJogo((estadoInicialJogo) => { // Backend agora envia o estado aqui
        console.log('[MAIN] Evento iniciarJogo recebido. Renderizando estado inicial:', estadoInicialJogo);
        window.renderMultiplayerState(estadoInicialJogo);
      });

      // Atualiza interface do jogo conforme estado do backend
      window.salaSocket.onAtualizarJogo(window.renderMultiplayerState); // Use a função global

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
        // Salvar resultados no localStorage para a tela end.html
        const gameResults = {
          pontuacao: pontuacao,
          acertos: acertos,
          grupos: grupos
        };
        localStorage.setItem('gameResults', JSON.stringify(gameResults));
        
        // Redirecionar para tela de fim de jogo
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
    alert('Erro ao carregar cartas do jogo ou inicializar main.js.');
    console.error(e);
  }
});