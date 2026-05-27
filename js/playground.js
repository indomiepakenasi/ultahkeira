/* ============================================
   PLAYGROUND SCREEN LOGIC
   ============================================ */
import { CONFIG } from './config.js';
import { ParticleSystem } from './particles.js';
import { CatModel } from './cat-model.js';

export class PlaygroundScreen {
  constructor(appManager) {
    this.app = appManager;
    this.particles = new ParticleSystem(document.getElementById('playground-particles'));
    this.catModel = new CatModel('cat-container');
    
    this.hunger = 0;
    this.happiness = 0;
    
    this.hungerBar = document.getElementById('hunger-bar');
    this.happinessBar = document.getElementById('happiness-bar');
    this.hungerVal = document.getElementById('hunger-value');
    this.happinessVal = document.getElementById('happiness-value');
    this.catStatusText = document.getElementById('cat-status-text');
    
    this.btnFeed = document.getElementById('btn-feed');
    this.btnPet = document.getElementById('btn-pet');
    this.btnPlay = document.getElementById('btn-play');
    
    this.btnBack = document.getElementById('btn-play-back');
    this.btnNext = document.getElementById('btn-play-next');
    this.btnPlayHome = document.getElementById('btn-play-home');
    this.playCompleteText = document.getElementById('play-complete-text');
    this.unlockContainer = document.getElementById('play-complete-nav');

    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    this.btnFeed.addEventListener('click', () => this.feed());
    this.btnPet.addEventListener('click', () => this.pet());
    this.btnPlay.addEventListener('click', () => {
      this.app.navigateTo('game');
    });
    this.btnBack.addEventListener('click', () => {
      this.app.navigateTo('landing');
    });
    this.btnNext.addEventListener('click', () => {
      this.app.navigateTo('game');
    });
    this.btnPlayHome.addEventListener('click', () => {
      this.app.navigateTo('landing');
    });
    
    // Also allow petting by clicking the 3D canvas
    const catCanvas = document.getElementById('cat-container').querySelector('canvas');
    if(catCanvas) {
        catCanvas.addEventListener('click', (e) => {
            // Spawn hearts at mouse position
            const rect = catCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.pet(x, y);
        });
    }
  }

  feed() {
    if (this.hunger >= 100) return;
    
    this.hunger = Math.min(100, this.hunger + CONFIG.hungerIncrement);
    this.catModel.animateEat();
    
    // Spawn food particles falling from top
    const w = this.particles.canvas.width;
    const h = this.particles.canvas.height;
    this.particles.spawnFood(w / 2, h / 3);
    
    this.catStatusText.textContent = "Nyam nyam! 🐟";
    this.catStatusText.className = "playground__cat-status hungry";
    
    this.updateUI();
  }

  pet(x, y) {
    if (this.happiness >= 100) return;
    
    this.happiness = Math.min(100, this.happiness + CONFIG.happinessIncrement);
    this.catModel.animateHappy();
    
    // Spawn hearts
    const spawnX = x || (this.particles.canvas.width / 2);
    const spawnY = y || (this.particles.canvas.height / 2);
    this.particles.spawnHearts(spawnX, spawnY, 4);
    
    this.catStatusText.textContent = "Purrrr... 💕";
    this.catStatusText.className = "playground__cat-status happy";
    
    this.updateUI();
  }

  updateUI() {
    this.hungerBar.style.width = `${this.hunger}%`;
    this.happinessBar.style.width = `${this.happiness}%`;
    this.hungerVal.textContent = `${this.hunger}%`;
    this.happinessVal.textContent = `${this.happiness}%`;
    
    if (this.hunger >= 100) {
      this.btnFeed.classList.add('btn--disabled');
      this.btnFeed.innerHTML = 'Kenyang 😸';
    } else {
      this.btnFeed.classList.remove('btn--disabled');
      this.btnFeed.innerHTML = '<span class="emoji-icon">🍖</span> Feed';
    }
    
    if (this.happiness >= 100) {
      this.btnPet.classList.add('btn--disabled');
      this.btnPet.innerHTML = 'Senang 😻';
    } else {
      this.btnPet.classList.remove('btn--disabled');
      this.btnPet.innerHTML = '<span class="emoji-icon">✋</span> Pet';
    }
    
    this.checkUnlock();
  }
  
  checkUnlock() {
    if (this.hunger >= 100 && this.happiness >= 100) {
      this.app.state.isPlaygroundDone = true;
      this.unlockContainer.style.display = 'flex';
      
      // If the game is also done, show the Home button and completion text
      if (this.app.state.isGameDone) {
        this.btnNext.style.display = 'none';
        this.btnPlayHome.style.display = 'inline-flex';
        this.playCompleteText.textContent = "Selamat seluruh task sudah berhasil terselesaikan. Silahkan kembali ke beranda dan buka menu ucapan";
      } else {
        this.btnNext.style.display = 'inline-flex';
        this.btnPlayHome.style.display = 'none';
        this.playCompleteText.textContent = "✨ Tugas Kucing Selesai! ✨";
      }
      
      this.catStatusText.textContent = `${CONFIG.catName} siap untuk pesta! 🎉`;
    }
  }

  onEnter() {
    this.particles.start();
    this.catModel.start();
    this.particles.resize();
  }

  onLeave() {
    this.particles.stop();
    this.catModel.stop();
  }
}
