// audio.js
// Sistema de áudio do jogo

class AudioManager {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
    this.init();
  }

  init() {
    // Carregar todos os áudios
    this.loadSound('success', '/src/assets/audio/success.mp3');
    this.loadSound('buzzer', '/src/assets/audio/buzzer.mp3');
    this.loadSound('heartbeat', '/src/assets/audio/heartbeat.mp3');
    this.loadSound('victory', '/src/assets/audio/victory.mp3');
    this.loadSound('lost', '/src/assets/audio/lost.mp3');
  }

  loadSound(name, src) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 0.7; // Volume padrão
    this.sounds[name] = audio;
  }

  play(name) {
    if (this.isMuted) return;
    
    const sound = this.sounds[name];
    if (sound) {
      // Reset do áudio para permitir múltiplas reproduções
      sound.currentTime = 0;
      sound.play().catch(error => {
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

  mute() {
    this.isMuted = true;
    this.stopAll();
  }

  unmute() {
    this.isMuted = false;
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return !this.isMuted;
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

export function toggleMute() {
  return audioManager.toggleMute();
}

export function isMuted() {
  return audioManager.isMuted;
}

// Exportar a instância para uso direto se necessário
export { audioManager }; 