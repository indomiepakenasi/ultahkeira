/* ============================================
   LANDING SCREEN LOGIC
   ============================================ */
import { CONFIG } from './config.js';
import { ParticleSystem } from './particles.js';

export class LandingScreen {
  constructor(appManager) {
    this.app = appManager;
    this.particles = new ParticleSystem(document.getElementById('landing-sparkles'));
    
    this.btnPlayground = document.getElementById('btn-menu-playground');
    this.btnGame = document.getElementById('btn-menu-game');
    this.btnFinale = document.getElementById('btn-menu-finale');
    this.finaleText = document.getElementById('menu-finale-text');
    
    // Set text
    document.getElementById('landing-title').textContent = "Selamat Ulang Tahun ke-21";
    document.getElementById('landing-subtitle').textContent = "Keira Joy Shaloom 🐾";

    this.bindEvents();
    
    // Ambient sparkles
    setInterval(() => {
      if (this.particles.isActive && Math.random() > 0.5) {
        this.particles.spawnAmbientSparkle();
      }
    }, 100);
  }

  bindEvents() {
    const transitionScreen = (screenName) => {
      gsap.to('#landing-cat', {
        scale: 1.2,
        duration: 0.4,
        ease: "back.in(1.7)"
      });
      setTimeout(() => {
        this.app.navigateTo(screenName);
        // reset scale
        gsap.set('#landing-cat', { scale: 1 });
      }, 400);
    };

    this.btnPlayground.addEventListener('click', () => transitionScreen('playground'));
    this.btnGame.addEventListener('click', () => transitionScreen('game'));
    document.getElementById('btn-menu-finale').addEventListener('click', () => {
      if (this.app.state.isPlaygroundDone && this.app.state.isGameDone) {
        this.app.navigateTo('finale');
      }
    });

    document.getElementById('btn-reset-all').addEventListener('click', () => {
      this.app.resetAll();
    });
  }

  renderLocks() {
    const isBothDone = this.app.state.isPlaygroundDone && this.app.state.isGameDone;
    if (isBothDone) {
      this.btnFinale.disabled = false;
      this.btnFinale.classList.remove('btn--locked');
      this.finaleText.textContent = "Buka Kejutan! 🎉";
      this.btnFinale.classList.add('btn--glow');
    } else {
      this.btnFinale.disabled = true;
      this.btnFinale.classList.add('btn--locked');
      this.finaleText.textContent = "🔒 Tergembok";
      this.btnFinale.classList.remove('btn--glow');
    }
  }

  onEnter() {
    this.particles.start();
    this.renderLocks();
  }

  onLeave() {
    this.particles.stop();
  }
}
