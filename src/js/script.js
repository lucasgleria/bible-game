
let cards = [
  {
    category: "Pessoa",
    answer: "Moisés",
    hints: [
      "Fui colocado num cesto no rio quando bebê.",
      "Fui chamado por Deus numa sarça ardente.",
      "Lidereio o povo na travessia do Mar Vermelho.",
      "Recebi as tábuas da Lei.",
      "Meu nome começa com M."
    ]
  },
  {
    category: "Lugar",
    answer: "Jerusalém",
    hints: [
      "Cidade onde o templo foi construído.",
      "Local do ministério e morte de Jesus.",
      "Cidade santa para judeus e cristãos.",
      "Davi foi o rei aqui.",
      "Meu nome começa com J."
    ]
  },
  {
    category: "Acontecimento",
    answer: "Dilúvio",
    hints: [
      "Teve duração de 40 dias e 40 noites.",
      "Foi anunciado por Deus a Noé.",
      "Uma arca foi construída.",
      "Todos os seres vivos foram salvos em pares.",
      "Meu nome começa com D."
    ]
  }
];
let currentCard = null;
let currentHints = [];
let round = 0;
let maxRounds = 5;
let groupTurn = 1;
let score = {1: 0, 2: 0};
let timer;
let timeLeft = 60;
let teamName = '';

window.onload = function() {
  const customScreen = document.getElementById('customization-screen');
  const gameCard = document.getElementById('game-card');
  const scoreboard = document.getElementById('scoreboard');
  const controls = document.getElementById('controls');
  const teamNameInput = document.getElementById('team-name-input');
  const startBtn = document.getElementById('start-custom-btn');
  const errorDiv = document.getElementById('team-name-error');
  startBtn.onclick = function() {
    const name = teamNameInput.value.trim();
    if (name.length < 2) {
      errorDiv.textContent = 'Digite um nome válido (mínimo 2 letras)';
      return;
    }
    teamName = name;
    errorDiv.textContent = '';
    customScreen.style.display = 'none';
    gameCard.style.display = '';
    scoreboard.style.display = '';
    controls.style.display = '';
    document.getElementById('team1-label').innerHTML = `${teamName}: <span id="score1">0</span>`;
  };
  teamNameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') startBtn.onclick();
  });
};

function startGame() {
  let sel = document.getElementById("rounds").value;
  maxRounds = sel === "all" ? cards.length : parseInt(sel);
  round = 0;
  score = {1: 0, 2: 0};
  groupTurn = 1;
  document.getElementById("score1").textContent = 0;
  document.getElementById("score2").textContent = 0;
  nextRound();
}

function highlightGroupTurn() {
  const score1 = document.querySelector('#scoreboard p:nth-child(1)');
  const score2 = document.querySelector('#scoreboard p:nth-child(2)');
  if (groupTurn === 1) {
    score1.style.background = 'var(--success)';
    score1.style.color = '#fff';
    score1.style.transform = 'scale(1.08)';
    score2.style.background = 'var(--card-bg)';
    score2.style.color = 'var(--primary)';
    score2.style.transform = 'scale(1)';
  } else {
    score2.style.background = 'var(--success)';
    score2.style.color = '#fff';
    score2.style.transform = 'scale(1.08)';
    score1.style.background = 'var(--card-bg)';
    score1.style.color = 'var(--primary)';
    score1.style.transform = 'scale(1)';
  }
}

function animateCardTransition() {
  const card = document.getElementById('game-card');
  card.style.animation = 'fadeOutCard 0.4s';
  setTimeout(() => {
    card.style.animation = 'fadeInCard 0.7s';
  }, 400);
}

function nextRound() {
  animateCardTransition();
  if (round >= maxRounds) {
    alert("Fim do jogo!");
    return;
  }
  round++;
  document.getElementById("result").textContent = "";
  document.getElementById("guess").value = "";
  currentCard = cards[Math.floor(Math.random() * cards.length)];
  currentHints = [...currentCard.hints];
  shuffle(currentHints);
  document.getElementById("category").textContent = `Categoria: ${currentCard.category}`;
  let ul = document.getElementById("hints");
  ul.innerHTML = "";
  currentHints.forEach((hint, i) => {
    let li = document.createElement("li");
    li.textContent = `${i + 1}. ${hint}`;
    li.style.opacity = 0;
    li.style.transform = 'translateY(10px)';
    ul.appendChild(li);
    setTimeout(() => {
      li.style.transition = 'opacity 0.5s, transform 0.5s';
      li.style.opacity = 1;
      li.style.transform = 'none';
    }, 100 + i * 120);
  });
  highlightGroupTurn();
  startTimer();
}

function renderTimer(time, maxTime) {
  const timerEl = document.getElementById("timer");
  const percent = Math.max(0, time / maxTime);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent);
  timerEl.innerHTML = `
    <svg width="80" height="80">
      <circle
        cx="40" cy="40" r="36"
        stroke="#eee" stroke-width="7" fill="none"
      />
      <circle
        cx="40" cy="40" r="36"
        stroke="${time <= 10 ? '#e63946' : '#4b2e83'}"
        stroke-width="7" fill="none"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
        style="transition: stroke 0.3s, stroke-dashoffset 1s linear;"
      />
    </svg>
    <span class="timer-number">${time}</span>
  `;
  if (time <= 10) {
    timerEl.classList.add('danger');
  } else {
    timerEl.classList.remove('danger');
  }
}

function showFeedback(type, message) {
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

  if (type === 'success') {
    feedback.className = 'feedback-fullscreen';
    feedback.textContent = 'Acerto';
  } else if (type === 'error') {
    feedback.className = 'feedback-fullscreen error';
    feedback.textContent = 'Errado';
  }
  setTimeout(() => {
    feedback.style.display = 'none';
    feedback.className = '';
    feedback.textContent = '';
  }, 1200);
}

function runConfetti() {
  // Simples confete animado (apenas para efeito visual, não usa libs externas)
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  let pieces = [];
  for (let i = 0; i < 32; i++) {
    pieces.push({
      x: Math.random() * W,
      y: Math.random() * -H/2,
      r: 6 + Math.random() * 8,
      d: 2 + Math.random() * 2,
      color: `hsl(${Math.random()*360},90%,60%)`,
      tilt: Math.random() * 10 - 5
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let p of pieces) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.y += p.d + Math.sin(frame/8 + p.x/80)*1.5;
      p.x += Math.sin(frame/10 + p.y/60) * 2;
      p.tilt += Math.random() - 0.5;
      if (p.y > H + 20) p.y = -10;
    }
    frame++;
    if (frame < 40) requestAnimationFrame(draw);
  }
  draw();
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 60;
  const timerEl = document.getElementById("timer");
  const heartbeat = document.getElementById("heartbeat");
  const buzzer = document.getElementById("buzzer");

  renderTimer(timeLeft, 60);
  timer = setInterval(() => {
    timeLeft--;
    renderTimer(timeLeft, 60);
    if (timeLeft === 10) heartbeat.play();
    if (timeLeft <= 0) {
      clearInterval(timer);
      heartbeat.pause();
      heartbeat.currentTime = 0;
      buzzer.play();
      document.getElementById("result").textContent = `Tempo esgotado! A resposta era: ${currentCard.answer}`;
      showFeedback('error', `Tempo esgotado! A resposta era: ${currentCard.answer}`);
      groupTurn = groupTurn === 1 ? 2 : 1;
      setTimeout(nextRound, 1800);
    }
  }, 1000);
}

function checkAnswer() {
  let input = document.getElementById("guess").value.trim().toLowerCase();
  if (input === currentCard.answer.toLowerCase()) {
    clearInterval(timer);
    let points = 6 - currentHints.length;
    score[groupTurn] += points;
    document.getElementById(`score${groupTurn}`).textContent = score[groupTurn];
    document.getElementById("result").textContent = `Acertou! +${points} pontos`;
    showFeedback('success', 'Parabéns! Você acertou!');
    groupTurn = groupTurn === 1 ? 2 : 1;
    setTimeout(nextRound, 1800);
  } else {
    clearInterval(timer);
    document.getElementById("result").textContent = `Errado! A resposta era: ${currentCard.answer}`;
    showFeedback('error', 'Errado');
    groupTurn = groupTurn === 1 ? 2 : 1;
    setTimeout(nextRound, 1200);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// --- INTEGRAÇÃO MULTIPLAYER ---
const isMultiplayer = !!localStorage.getItem('roomCode');
if (isMultiplayer && window.salaSocket) {
  let meuGrupo = localStorage.getItem('teamName');
  let grupoIndex = 0;
  let timerInterval = null;
  let tempoRestante = 60;

  window.salaSocket.onAtualizarJogo((estado) => {
    // Descobrir se sou grupo 1 ou 2
    grupoIndex = estado.grupos.findIndex(n => n === meuGrupo);
    // Atualizar placar
    document.getElementById('team1-label').innerHTML = `${estado.grupos[0]}: <span id='score1'>${estado.pontuacao[0]}</span>`;
    document.getElementById('score2').textContent = estado.pontuacao[1];
    // Atualizar rodada
    document.getElementById('category').textContent = `Categoria: ${estado.carta.categoria}`;
    // Atualizar dicas
    let ul = document.getElementById('hints');
    ul.innerHTML = '';
    estado.carta.dicas.forEach((hint, i) => {
      let li = document.createElement('li');
      li.textContent = `${i + 1}. ${hint}`;
      ul.appendChild(li);
    });
    // Atualizar turno
    if (estado.turno === grupoIndex) {
      document.getElementById('answer-area').style.display = '';
    } else {
      document.getElementById('answer-area').style.display = 'none';
    }
    // Timer
    clearInterval(timerInterval);
    tempoRestante = 60;
    renderTimer(tempoRestante, 60);
    timerInterval = setInterval(() => {
      tempoRestante--;
      renderTimer(tempoRestante, 60);
      if (tempoRestante <= 0) {
        clearInterval(timerInterval);
        document.getElementById('result').textContent = `Tempo esgotado!`;
        setTimeout(() => {
          document.getElementById('result').textContent = '';
        }, 1200);
      }
    }, 1000);
  });

  document.querySelector('#answer-area button').onclick = function() {
    const resposta = document.getElementById('guess').value;
    window.salaSocket.responder(resposta);
    document.getElementById('guess').value = '';
  };

  window.salaSocket.onFeedback(({ tipo, pontos }) => {
    if (tipo === 'acerto') {
      showFeedback('success', `Acertou! +${pontos} pontos`);
    } else {
      showFeedback('error', 'Errado');
    }
  });

  window.salaSocket.onFimJogo(({ pontuacao, acertos, grupos }) => {
    let msg = `Fim do jogo!\n${grupos[0]}: ${pontuacao[0]} pontos (${acertos[0]} acertos)\n${grupos[1]}: ${pontuacao[1]} pontos (${acertos[1]} acertos)`;
    alert(msg);
    window.location.href = 'end.html';
  });

  // Botão para pedir dica extra (pode ser adicionado na interface)
  // window.salaSocket.pedirDica();
}
