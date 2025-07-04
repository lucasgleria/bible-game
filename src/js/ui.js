// ui.js
// Funções de manipulação de interface
import { playSuccess, playBuzzer } from './audio.js';

export function renderTimer(time, maxTime) {
  const timerEl = document.getElementById("timer");
  if (!timerEl) {
    console.warn('[TIMER] Elemento timer não encontrado');
    return;
  }
  
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

export function showFeedback(type, message) {
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
    // Tocar som de sucesso
    playSuccess();
  } else if (type === 'error') {
    feedback.className = 'feedback-fullscreen error';
    feedback.textContent = 'Errado';
    // Tocar som de erro
    playBuzzer();
  }
  setTimeout(() => {
    feedback.style.display = 'none';
    feedback.className = '';
    feedback.textContent = '';
  }, 1200);
}

export function animateCardTransition() {
  const card = document.getElementById('game-card');
  if (!card) return;
  card.style.animation = 'fadeOutCard 0.4s';
  setTimeout(() => {
    card.style.animation = 'fadeInCard 0.7s';
  }, 400);
}

export function runConfetti() {
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