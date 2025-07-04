// timer.js
import { renderTimer } from './ui.js';

let timer;

export function startTimer(onTimeUp) {
  clearInterval(timer);
  let timeLeft = 60;
  renderTimer(timeLeft, 60);
  const heartbeat = document.getElementById("heartbeat");
  const buzzer = document.getElementById("buzzer");

  timer = setInterval(() => {
    timeLeft--;
    renderTimer(timeLeft, 60);
    if (timeLeft === 10) heartbeat && heartbeat.play();
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (heartbeat) {
        heartbeat.pause();
        heartbeat.currentTime = 0;
      }
      buzzer && buzzer.play();
      if (typeof onTimeUp === 'function') onTimeUp();
    }
  }, 1000);
} 