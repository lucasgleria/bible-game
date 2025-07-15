// timer.js
import { renderTimer } from './ui.js';
import { playHeartbeat, stopHeartbeat, playBuzzer } from './audio.js';

let timer;

export function startTimer(onTimeUp) {
  clearInterval(timer);
  let timeLeft = 30;
  renderTimer(timeLeft, 30);
  
  // Parar qualquer heartbeat anterior
  stopHeartbeat();

  // Timer de 30 segundos (unificado com backend)
  timer = setInterval(() => {
    timeLeft--;
    renderTimer(timeLeft, 30);
    
    // Tocar heartbeat quando chegar nos últimos 11 segundos de 30
    if (timeLeft === 11) {
      playHeartbeat();
    }
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      stopHeartbeat();
      playBuzzer();
      if (typeof onTimeUp === 'function') onTimeUp();
    }
  }, 1000);
} 