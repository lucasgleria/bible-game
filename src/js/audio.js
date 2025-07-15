// audio.js
// Sistema de áudio do jogo

class AudioManager {
  constructor() {
    this.sounds = {};
    this.init();
  }

  init() {
    // Carregar todos os áudios
    this.loadSound('success', '/src/assets/audio/success.mp3');
    this.loadSound('buzzer', '/src/assets/audio/buzzer.mp3');
    this.loadSound('heartbeat', '/src/assets/audio/heartbeat.mp3');
    this.loadSound('victory', '/src/assets/audio/victory.mp3');
    this.loadSound('lost', '/src/assets/audio/lost.mp3');
    // Adicionar som silencioso para liberar contexto de áudio
    this.loadSound('silent', '/src/assets/audio/silent.mp3');
  }

  loadSound(name, src) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 0.7; // Volume padrão
    this.sounds[name] = audio;
  }

  play(name) {
    const sound = this.sounds[name];
    if (sound) {
      console.log(`[AUDIO] Tentando tocar: ${name}`);
      // Reset do áudio para permitir múltiplas reproduções
      sound.currentTime = 0;
      sound.play().then(() => {
        console.log(`[AUDIO] Reprodução iniciada com sucesso: ${name}`);
      }).catch(error => {
        console.warn(`[AUDIO] Erro ao tocar ${name}:`, error);
      });
    } else {
      console.warn(`[AUDIO] Som ${name} não encontrado`);
    }
  }

  stop(name) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  setVolume(volume) {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }
}

// Instância global do gerenciador de áudio
const audioManager = new AudioManager();

// Funções de conveniência para uso em outros módulos
export function playSuccess() {
  audioManager.play('success');
}

export function playBuzzer() {
  audioManager.play('buzzer');
}

export function playHeartbeat() {
  console.log('[AUDIO] playHeartbeat chamado - deve tocar heartbeat');
  audioManager.play('heartbeat');
}

export function stopHeartbeat() {
  audioManager.stop('heartbeat');
}

export function playVictory() {
  audioManager.play('victory');
}

export function playLost() {
  audioManager.play('lost');
}

export function stopAllSounds() {
  audioManager.stopAll();
}

export function setAudioVolume(volume) {
  audioManager.setVolume(volume);
}

// Função para liberar contexto de áudio na primeira interação do usuário
export function liberarAudioNoPrimeiroClique() {
  window.removeEventListener('click', liberarAudioNoPrimeiroClique);
  window.removeEventListener('keydown', liberarAudioNoPrimeiroClique);
  try {
    audioManager.play('silent'); // Toca um som silencioso
    if (window.AudioContext || window.webkitAudioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
    }
  } catch (e) {
    // Ignorar erros
  }
}

// Expor audioManager globalmente para depuração, mesmo em módulos ES6
if (typeof window !== 'undefined') {
  window.audioManager = audioManager;
  console.log('audioManager global:', window.audioManager);
} 