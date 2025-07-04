// timer.js
import { renderTimer } from './ui.js';
import { playHeartbeat, stopHeartbeat, playBuzzer } from './audio.js';

let timer;

export function startTimer(onTimeUp) {
  clearInterval(timer);
  let timeLeft = 60;
  renderTimer(timeLeft, 60);
  
  // Parar qualquer heartbeat anterior
  stopHeartbeat();

  timer = setInterval(() => {
    timeLeft--;
    renderTimer(timeLeft, 60);
    
    // Tocar heartbeat quando chegar nos últimos 11 segundos
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