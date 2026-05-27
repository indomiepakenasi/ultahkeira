/* ============================================
   AUDIO MANAGER — Keira's 21st Cat-verse
   ============================================ */

class AudioManager {
  constructor() {
    this.bgMusic = document.getElementById('bg-music');
    this.btn = document.getElementById('audio-toggle');
    this.isMuted = true;
    this.hasInteracted = false;
    
    // Default volume
    if (this.bgMusic) {
      this.bgMusic.volume = 0.5;
    }

    this.setupButton();
    this.setupAutoPlay();
  }

  setupButton() {
    if (!this.btn) return;
    this.btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hasInteracted = true;
      this.toggleMute();
    });
  }
  
  setupAutoPlay() {
    // Attempt to play music on the first user interaction anywhere on the screen
    const startAudio = () => {
      if (!this.hasInteracted) {
        this.hasInteracted = true;
        // Turn on audio automatically on first click/interaction
        this.isMuted = false;
        this.updateButtonState();
        this.playMelody();
      }
      // Remove listeners once interacted
      document.removeEventListener('click', startAudio);
      document.removeEventListener('touchstart', startAudio);
      document.removeEventListener('keydown', startAudio);
    };
    
    document.addEventListener('click', startAudio);
    document.addEventListener('touchstart', startAudio, {passive: true});
    document.addEventListener('keydown', startAudio);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.updateButtonState();
    
    if (this.isMuted) {
      if (this.bgMusic) this.bgMusic.pause();
    } else {
      if (this.bgMusic) {
        const playPromise = this.bgMusic.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Audio play prevented:", error);
            this.isMuted = true;
            this.updateButtonState();
          });
        }
      }
    }
  }

  updateButtonState() {
    if (this.btn) {
      this.btn.textContent = this.isMuted ? '🔇' : '🔊';
    }
  }

  playMelody() {
    // Hanya play jika belum di-mute
    if (!this.bgMusic || this.isMuted) return;
    const playPromise = this.bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio play prevented:", error);
      });
    }
  }

  stop() {
    // Sengaja dikosongkan. User meminta background music terus berputar 
    // selama membuka web, jadi tidak dimatikan saat pindah halaman.
  }
}

export const audioManager = new AudioManager();
