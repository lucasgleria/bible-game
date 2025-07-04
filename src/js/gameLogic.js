// gameLogic.js
import { renderTimer, showFeedback, animateCardTransition } from './ui.js';
import { startTimer } from './timer.js';

let cards = [];
let currentCard = null;
let currentHints = [];
let round = 0;
let maxRounds = 5;
let groupTurn = 1;
let score = {1: 0, 2: 0};

export function startGame(cardsData) {
  cards = cardsData;
  let sel = document.getElementById("rounds");
  if (sel) {
    let val = sel.value;
    maxRounds = val === "all" ? cards.length : parseInt(val);
  } else {
    maxRounds = 5;
  }
  round = 0;
  score = {1: 0, 2: 0};
  groupTurn = 1;
  document.getElementById("score1").textContent = 0;
  document.getElementById("score2").textContent = 0;
  nextRound();
}

export function nextRound() {
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
  startTimer(onTimeUp);
}

function onTimeUp() {
  document.getElementById("result").textContent = `Tempo esgotado! A resposta era: ${currentCard.answer}`;
  showFeedback('error', `Tempo esgotado! A resposta era: ${currentCard.answer}`);
  groupTurn = groupTurn === 1 ? 2 : 1;
  setTimeout(nextRound, 1800);
}

export function checkAnswer() {
  let input = document.getElementById("guess").value.trim().toLowerCase();
  if (input === currentCard.answer.toLowerCase()) {
    let points = 6 - currentHints.length;
    score[groupTurn] += points;
    document.getElementById(`score${groupTurn}`).textContent = score[groupTurn];
    document.getElementById("result").textContent = `Acertou! +${points} pontos`;
    showFeedback('success', 'Parabéns! Você acertou!');
    groupTurn = groupTurn === 1 ? 2 : 1;
    setTimeout(nextRound, 1800);
  } else {
    document.getElementById("result").textContent = `Errado! A resposta era: ${currentCard.answer}`;
    showFeedback('error', 'Errado');
    groupTurn = groupTurn === 1 ? 2 : 1;
    setTimeout(nextRound, 1200);
  }
}

export function highlightGroupTurn() {
  const score1 = document.querySelector('#scoreboard p:nth-child(1)');
  const score2 = document.querySelector('#scoreboard p:nth-child(2)');
  if (!score1 || !score2) return;
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

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
} 