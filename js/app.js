/* ============================================
   APP & STATE MANAGER — Keira's 21st Cat-verse
   ============================================ */

import { CONFIG } from './config.js';
import { LandingScreen } from './landing.js';
import { PlaygroundScreen } from './playground.js';
import { GameScreen } from './game.js';
import { FinaleScreen } from './finale.js';

export class AppManager {
  constructor() {
    this.screens = {
      landing: document.getElementById('screen-landing'),
      playground: document.getElementById('screen-playground'),
      game: document.getElementById('screen-game'),
      finale: document.getElementById('screen-finale')
    };
    
    this.currentScreen = 'landing';
    this.isTransitioning = false;
    
    // Global State for tasks
    this.state = {
      isPlaygroundDone: false,
      isGameDone: false
    };

    // Callbacks for screen lifecycle
    this.onEnterHooks = {};
    this.onLeaveHooks = {};
  }

  init() {
    // Apply config
    document.title = `${CONFIG.title || "Happy Birthday"} ${CONFIG.recipientName} 🐾✨`;
    
    // Show initial screen
    Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
    this.screens[this.currentScreen].classList.add('active');
    
    if (this.onEnterHooks[this.currentScreen]) {
      this.onEnterHooks[this.currentScreen]();
    }
  }

  registerHooks(screenName, onEnter, onLeave) {
    this.onEnterHooks[screenName] = onEnter;
    this.onLeaveHooks[screenName] = onLeave;
  }

  navigateTo(targetScreen) {
    if (this.isTransitioning || targetScreen === this.currentScreen || !this.screens[targetScreen]) return;
    
    this.isTransitioning = true;
    const oldScreenEl = this.screens[this.currentScreen];
    const newScreenEl = this.screens[targetScreen];
    
    oldScreenEl.classList.add('transitioning');
    newScreenEl.classList.add('transitioning');
    newScreenEl.classList.add('active');

    // Run leave hooks
    if (this.onLeaveHooks[this.currentScreen]) {
      this.onLeaveHooks[this.currentScreen]();
    }

    // GSAP Transition
    gsap.to(oldScreenEl, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        oldScreenEl.classList.remove('active', 'transitioning');
        
        // Fix scroll issue by scrolling back to the top
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        gsap.fromTo(newScreenEl, 
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.inOut", 
            onComplete: () => {
              newScreenEl.classList.remove('transitioning');
              this.currentScreen = targetScreen;
              this.isTransitioning = false;
              
              // Run enter hooks
              if (this.onEnterHooks[this.currentScreen]) {
                this.onEnterHooks[this.currentScreen]();
              }
            }
          }
        );
      }
    });
  }
  resetAll() {
    this.state.isPlaygroundDone = false;
    this.state.isGameDone = false;
    
    if (this.playground) {
      this.playground.hunger = 0;
      this.playground.happiness = 0;
      this.playground.unlockContainer.style.display = 'none';
      this.playground.updateUI();
    }
    
    if (this.game) {
      this.game.score = 0;
      this.game.state = 'ready';
      this.game.overlayWin.classList.remove('visible');
    }
    
    if (this.landing) {
      this.landing.renderLocks();
    }
    
    alert('Seluruh task berhasil di-reset! ✨');
  }
}

// ── Application Initialization ──
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppManager();
  
  // Initialize screens
  app.landing = new LandingScreen(app);
  app.playground = new PlaygroundScreen(app);
  app.game = new GameScreen(app);
  app.finale = new FinaleScreen(app);
  
  // Register hooks
  app.registerHooks('landing', () => app.landing.onEnter(), () => app.landing.onLeave());
  app.registerHooks('playground', () => app.playground.onEnter(), () => app.playground.onLeave());
  app.registerHooks('game', () => app.game.onEnter(), () => app.game.onLeave());
  app.registerHooks('finale', () => app.finale.onEnter(), () => app.finale.onLeave());
  
  // Start app
  app.init();
});
