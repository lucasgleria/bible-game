// main.js
// Ponto de entrada do app

import { loadCards } from './cards.js';
import { startGame, checkAnswer, nextRound, highlightGroupTurn } from './gameLogic.js';
import { showFeedback, renderTimer } from './ui.js';
import { playSuccess, playBuzzer, playHeartbeat, stopHeartbeat, setAudioVolume, playVictory, playLost, liberarAudioNoPrimeiroClique } from './audio.js';

// Variável global para armazenar estado atual
let estadoAtual = null;

// Função para destacar o grupo que está jogando no momento (modo multiplayer)
function highlightGroupTurnMultiplayer(turno) {
  const scoreboard = document.getElementById('scoreboard');
  if (!scoreboard) return;
  
  const pGrupo1 = scoreboard.children[0];
  const pGrupo2 = scoreboard.children[1];
  
  if (!pGrupo1 || !pGrupo2) return;
  
  // Resetar estilos de ambos os grupos
  pGrupo1.style.background = 'var(--card-bg)';
  pGrupo1.style.color = 'var(--primary)';
  pGrupo1.style.transform = 'scale(1)';
  pGrupo1.style.transition = 'all 0.3s ease';
  
  pGrupo2.style.background = 'var(--card-bg)';
  pGrupo2.style.color = 'var(--primary)';
  pGrupo2.style.transform = 'scale(1)';
  pGrupo2.style.transition = 'all 0.3s ease';
  
  // Destacar o grupo que está jogando
  if (turno === 0) {
    pGrupo1.style.background = 'var(--success)';
    pGrupo1.style.color = '#fff';
    pGrupo1.style.transform = 'scale(1.08)';
  } else {
    pGrupo2.style.background = 'var(--success)';
    pGrupo2.style.color = '#fff';
    pGrupo2.style.transform = 'scale(1.08)';
  }
}

// Tornar renderMultiplayerState global para ser acessível do game.html
window.renderMultiplayerState = function(estado) {
  // Atualizar estado global
  estadoAtual = estado;
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
  console.log('[DEBUG] Grupo encontrado:', eu);
  if (grupoIndex === -1) {
    console.error('[ERRO] Seu grupo não foi encontrado em estado.grupos! teamName:', teamName, '| grupos:', estado.grupos.map(g => g.nome));
    const answerArea = document.getElementById('answer-area');
    if (answerArea) {
      answerArea.style.display = 'block';
      answerArea.innerHTML = '<div style="color: red; font-weight: bold; text-align: center;">ERRO: Seu grupo não foi encontrado na sala. Tente recarregar ou entrar novamente.</div>';
    }
    return;
  }

  // === NOVA LÓGICA DE PRIVACIDADE ===
  const isMyTurn = estado.turno === grupoIndex && grupoIndex !== -1;
  const currentPlayingGroup = estado.grupos[estado.turno];
  
  if (isMyTurn) {
    // GRUPO QUE ESTÁ JOGANDO - Mostra tudo normalmente
    console.log('[DEBUG] Mostrando interface completa para grupo que está jogando');
    
    // Mostrar categoria e dicas
    category.textContent = `Categoria: ${estado.carta.categoria}`;
    hints.innerHTML = '';
    let dicasParaExibir = estado.carta.dicas;
    console.log('[DEBUG] Dicas recebidas:', dicasParaExibir);
    dicasParaExibir.forEach((hint, i) => {
      let li = document.createElement('li');
      li.textContent = `${i + 1}. ${hint}`;
      hints.appendChild(li);
    });
    
    // Mostrar input de resposta
    answerArea.style.display = 'block';
    const guessInput = answerArea.querySelector('#guess');
    const answerBtn = answerArea.querySelector('button');
    if (guessInput) {
      guessInput.disabled = false;
      guessInput.value = ''; // Limpar input
    }
    if (answerBtn) answerBtn.disabled = false;
    
    // Mostrar botão de dica
    const dicaBtn = document.getElementById('dica-btn');
    if (dicaBtn) {
      dicaBtn.style.display = 'block';
      dicaBtn.disabled = false;
    }
    
    // Limpar mensagem de aguardo
    document.getElementById('result').textContent = '';
    
  } else {
    // GRUPO QUE ESTÁ AGUARDANDO - Oculta informações sensíveis
    console.log('[DEBUG] Ocultando informações para grupo que está aguardando');
    
    // Ocultar categoria e dicas
    category.textContent = 'Aguarde sua vez...';
    hints.innerHTML = '';
    
    // Ocultar input de resposta
    answerArea.style.display = 'none';
    
    // Ocultar botão de dica
    const dicaBtn = document.getElementById('dica-btn');
    if (dicaBtn) {
      dicaBtn.style.display = 'none';
    }
    
    // Mostrar mensagem de aguardo
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
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
    }
  }
  
  // Renderizar timer se disponível (sempre visível para ambos os grupos)
  if (estado.timer && typeof renderTimer === 'function') {
    console.log('[RENDER] Renderizando timer:', estado.timer);
    renderTimer(estado.timer.tempo, estado.timer.maxTempo);
  } else if (estado.timer) {
    console.warn('[RENDER] Timer disponível mas função renderTimer não encontrada');
  } else {
    console.log('[RENDER] Nenhum timer disponível no estado');
  }
  
  // Atualizar indicador de turno
  const turnIndicator = document.getElementById('turn-indicator');
  if (turnIndicator && estado.grupos && estado.grupos[estado.turno]) {
    turnIndicator.textContent = `Vez de: ${estado.grupos[estado.turno].nome}`;
  }
  
  // Destacar o grupo que está jogando no momento
  highlightGroupTurnMultiplayer(estado.turno);
  
  // Salvar estado no localStorage para reconexão
  try {
    localStorage.setItem('lastGameState', JSON.stringify(estado));
  } catch (error) {
    console.warn('[RENDER] Erro ao salvar estado no localStorage:', error);
  }
  
  // Verificação adicional: garantir que o input esteja visível se for o turno do grupo
  setTimeout(() => {
    if (estado.turno === grupoIndex && grupoIndex !== -1) {
      const answerArea = document.getElementById('answer-area');
      if (answerArea && answerArea.style.display === 'none') {
        console.log('[DEBUG] Corrigindo input oculto - forçando exibição');
        answerArea.style.display = 'block';
      }
    }
  }, 100);
} // <--- ESTA É A CHAVE DE FECHAMENTO FINAL PARA window.renderMultiplayerState!

// Função para carregar e exibir o leaderboard
async function loadLeaderboard() {
  try {
    const response = await fetch('http://localhost:4001/leaderboard');
    if (!response.ok) {
      console.warn('[LEADERBOARD] Erro ao carregar leaderboard:', response.status);
      return;
    }
    const leaderboard = await response.json();
    
    const container = document.getElementById('leaderboard-container');
    if (!container) return;
    
    if (leaderboard.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">Nenhum resultado ainda. Seja o primeiro a jogar!</p>';
      return;
    }
    
    let html = '<div style="background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">';
    html += '<h3 style="margin: 0 0 16px 0; color: var(--primary); text-align: center;">🏆 Top 10 Grupos</h3>';
    
    leaderboard.forEach((entry, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      const date = new Date(entry.data).toLocaleDateString('pt-BR');
      
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2em;">${medal}</span>
            <span style="font-weight: 600; color: var(--primary);">${entry.grupo}</span>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600; color: var(--accent);">${entry.pontos} pts</div>
            <div style="font-size: 0.8em; color: #666;">${entry.acertos} acertos</div>
            <div style="font-size: 0.7em; color: #999;">${date}</div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
  } catch (error) {
    console.error('[LEADERBOARD] Erro ao carregar leaderboard:', error);
    const container = document.getElementById('leaderboard-container');
    if (container) {
      container.innerHTML = '<p style="text-align: center; color: #666;">Erro ao carregar leaderboard</p>';
    }
  }
}

// Exibe mensagem de rodada encerrada em tela cheia azul
function showRoundEndFeedback(rodada, maxRodadas) {
  const feedback = document.getElementById('feedback-animation');
  feedback.innerHTML = '';
  feedback.style.display = 'flex';
  feedback.style.justifyContent = 'center';
  feedback.style.alignItems = 'center';
  feedback.style.position = 'fixed';
  feedback.style.top = '0';
  feedback.style.left = '0';
  feedback.style.width = '100vw';
  feedback.style.height = '100vh';
  feedback.style.zIndex = '10000';
  feedback.style.pointerEvents = 'none';
  feedback.className = '';
  feedback.innerHTML = `
    <div style="background: rgba(33, 150, 243, 0.18); color: #1a237e; padding: 32px 24px; border-radius: 18px; font-weight: bold; font-size: 2.1em; border: 2.5px solid #1976d2; box-shadow: 0 2px 16px rgba(33,150,243,0.13); text-align:center; max-width: 90vw;">
      <div>Rodada ${rodada} encerrada</div>
      <div style='font-size:0.7em; color:#1976d2; margin-top:10px;'>Faltam ${maxRodadas - rodada} rodada(s)</div>
    </div>
  `;
  setTimeout(() => {
    feedback.style.display = 'none';
    feedback.innerHTML = '';
  }, 4000);
}

// Remover qualquer referência ao botão de áudio
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('[MAIN] Iniciando carregamento...');
    
    // Carregar leaderboard na página inicial
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
      await loadLeaderboard();
    }
    
    const cards = await loadCards();
    console.log('[MAIN] Cards carregados:', cards);
    
    const isMultiplayer = !!localStorage.getItem('roomCode') && window.salaSocket;
    const startBtn = document.querySelector('#main-start-btn');
    const answerBtn = document.getElementById('answer-area')?.querySelector('button');
    const guessInput = document.getElementById('guess');
    const roomCode = localStorage.getItem('roomCode');

    console.log('[MAIN] Modo multiplayer:', isMultiplayer);
    console.log('[MAIN] Sala socket disponível:', !!window.salaSocket);
    console.log('[MAIN] Botão iniciar encontrado:', !!startBtn);
    console.log('[MAIN] URL atual:', window.location.href);

    if (isMultiplayer && window.salaSocket) {
      console.log('[MAIN] Configurando modo multiplayer...');
      
      // Nunca iniciar jogo localmente!
      if (startBtn) startBtn.style.display = 'none';

      // Recebe início do jogo do backend
      window.salaSocket.onIniciarJogo((estadoInicialJogo) => {
        console.log('[MAIN] Evento iniciarJogo recebido. Renderizando estado inicial:', estadoInicialJogo);
        window.renderMultiplayerState(estadoInicialJogo);
      });

      // Atualiza interface do jogo conforme estado do backend
      window.salaSocket.onAtualizarJogo(window.renderMultiplayerState);

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
      
      // Botão de dica envia para o backend
      const dicaBtn = document.getElementById('dica-btn');
      if (dicaBtn) {
        dicaBtn.onclick = function() {
          window.salaSocket.pedirDica();
        };
      }
      
      // Feedback do backend
      window.salaSocket.onFeedback(({ tipo, pontos }) => {
        if (tipo === 'acerto') {
          showFeedback('success', `Acertou! +${pontos} pontos`);
        } else {
          showFeedback('error', 'Errado');
        }
      });
      
      // Eventos de áudio do backend
      window.salaSocket.onAudioEvent();
      
      // Timer do jogo
      window.salaSocket.onAtualizarTimer(({ tempo, maxTempo }) => {
        if (typeof renderTimer === 'function') {
          renderTimer(tempo, maxTempo);
        }
      });
      
      // Tempo esgotado
      window.salaSocket.onTempoEsgotado(({ resposta, turnoAnterior, proximoTurno }) => {
        const rodadaAtual = estadoAtual?.rodada || 1;
        const maxRodadas = estadoAtual?.maxRodadas || 1;
        // Exibir mensagem de rodada encerrada em tela cheia azul
        showRoundEndFeedback(rodadaAtual, maxRodadas);
      });
      
      // Fim de jogo
      window.salaSocket.onFimJogo(({ pontuacao, acertos, grupos, vencedor }) => {
        const teamName = localStorage.getItem('teamName');
        const meuGrupo = grupos.find(g => g === teamName);
        const meuIndex = grupos.indexOf(meuGrupo);
        
        if (vencedor !== -1 && vencedor === meuIndex) {
          console.log('[VICTORY] Você venceu! Tocando som de vitória...');
          playVictory();
        }
        
        if (vencedor !== -1 && vencedor !== meuIndex) {
          console.log('[LOST] Você perdeu! Tocando som de derrota...');
          playLost();
        }
        
        const gameResults = {
          pontuacao: pontuacao,
          acertos: acertos,
          grupos: grupos,
          vencedor: vencedor
        };
        localStorage.setItem('gameResults', JSON.stringify(gameResults));
        
        window.location.href = 'end.html';
      });
      
      console.log('[MAIN] Modo multiplayer configurado com sucesso');
    } else {
      console.log('[MAIN] Configurando modo local...');
      
      // Modo local: fluxo antigo
      console.log('[MAIN] Botão iniciar encontrado:', !!startBtn);
      if (startBtn) {
        console.log('[MAIN] Configurando onclick para startGame...');
        startBtn.onclick = () => {
          console.log('[MAIN] Botão iniciar clicado! Chamando startGame...');
          startGame(cards);
        };
      }
      if (answerBtn) {
        answerBtn.onclick = checkAnswer;
      }
      if (guessInput) {
        guessInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') checkAnswer();
        });
      }
      
      console.log('[MAIN] Modo local configurado com sucesso');
    }
  } catch (e) {
    console.error('[MAIN] Erro detalhado:', e);
    console.error('[MAIN] Stack trace:', e.stack);
    alert('Erro ao carregar cartas do jogo ou inicializar main.js: ' + e.message);
  }
});

// Liberar contexto de áudio na primeira interação do usuário
document.addEventListener('click', liberarAudioNoPrimeiroClique);
document.addEventListener('keydown', liberarAudioNoPrimeiroClique);