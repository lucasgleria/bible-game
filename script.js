
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

function nextRound() {
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
    ul.appendChild(li);
  });
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 60;
  const timerEl = document.getElementById("timer");
  const heartbeat = document.getElementById("heartbeat");
  const buzzer = document.getElementById("buzzer");

  timerEl.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft === 10) heartbeat.play();
    if (timeLeft <= 0) {
      clearInterval(timer);
      heartbeat.pause();
      heartbeat.currentTime = 0;
      buzzer.play();
      document.getElementById("result").textContent = `Tempo esgotado! A resposta era: ${currentCard.answer}`;
      groupTurn = groupTurn === 1 ? 2 : 1;
      setTimeout(nextRound, 3000);
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
    groupTurn = groupTurn === 1 ? 2 : 1;
    setTimeout(nextRound, 3000);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
