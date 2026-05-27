/* ============================================
   GRAND FINALE LOGIC
   ============================================ */
import { CONFIG } from './config.js';
import { audioManager } from './audio.js';
import { FlowerSystem } from './flowers.js';

export class FinaleScreen {
  constructor(appManager) {
    this.app = appManager;
    this.canvas = document.getElementById('finale-fireworks');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.fallingStars = [];
    
    this.flowerCanvas = document.getElementById('finale-flowers');
    this.flowerSystem = new FlowerSystem(this.flowerCanvas, () => {
      this.runCardCinematic();
    });
    
    // Build the card content from config
    document.getElementById('finale-title').textContent = CONFIG.birthdayTitle;
    
    const msgContainer = document.getElementById('finale-message');
    msgContainer.innerHTML = '';
    CONFIG.birthdayMessage.forEach(line => {
      const p = document.createElement('p');
      p.className = 'finale__message-line';
      // Use zero-width space for empty lines to maintain height
      p.textContent = line.trim() === '' ? '\u200B' : line; 
      msgContainer.appendChild(p);
    });
    
    document.getElementById('finale-closing').textContent = CONFIG.birthdayClosing;
    
    document.getElementById('btn-replay').addEventListener('click', () => {
      this.app.navigateTo('playground');
    });
    
    document.getElementById('btn-finale-back').addEventListener('click', () => {
      this.app.navigateTo('landing');
    });
    
    document.getElementById('btn-finale-home').addEventListener('click', () => {
      this.app.navigateTo('landing');
    });

    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Interactive fireworks
    this.canvas.addEventListener('click', (e) => {
      if (!this.isActive) return;
      const rect = this.canvas.getBoundingClientRect();
      this.createFirework(e.clientX - rect.left, e.clientY - rect.top);
    });
    
    // Envelope interaction
    document.getElementById('finale-envelope').addEventListener('click', () => {
      this.openEnvelope();
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.flowerSystem) {
      this.flowerSystem.resize();
    }
  }

  createFirework(x, y) {
    const colors = ['#FFD6E0', '#C8A2D0', '#B8E6C8', '#FFE4B5', '#FFFFFF', '#FF69B4'];
    const particleCount = 40 + Math.random() * 40;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1
      });
    }
  }

  loop() {
    if (!this.isActive) return;
    
    // Trailing effect
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.globalCompositeOperation = 'lighter';
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life -= p.decay;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fill();
    }
    
    // Falling stars
    if (Math.random() < 0.15) {
      this.fallingStars.push({
        x: Math.random() * this.canvas.width,
        y: -10,
        size: Math.random() * 1.5 + 0.5,
        speedY: Math.random() * 2 + 1,
        speedX: Math.random() * 1 - 0.5,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    
    this.ctx.globalAlpha = 1.0;
    for (let i = this.fallingStars.length - 1; i >= 0; i--) {
      const s = this.fallingStars[i];
      s.x += s.speedX;
      s.y += s.speedY;
      
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      if (s.y > this.canvas.height) {
        this.fallingStars.splice(i, 1);
      }
    }
    
    this.animationId = requestAnimationFrame(() => this.loop());
  }
  
  runCinematic() {
    const tl = gsap.timeline();
    
    // Moon appears
    tl.to('#finale-moon', {
      opacity: 1,
      top: '5%',
      duration: 1.5,
      ease: "power2.out"
    });
    
    // Auto fireworks sequence
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    tl.add(() => this.createFirework(w*0.3, h*0.4), "+=0.5");
    tl.add(() => this.createFirework(w*0.7, h*0.3), "+=0.8");
    tl.add(() => {
        this.createFirework(w*0.5, h*0.2);
        this.createFirework(w*0.2, h*0.5);
        this.createFirework(w*0.8, h*0.5);
    }, "+=1.0");

    // Start flower growth right after initial fireworks
    tl.add(() => {
        this.flowerSystem.start();
    }, "+=0.5");
  }

  runCardCinematic() {
    const tl = gsap.timeline();
    
    // Reveal Envelope
    tl.to('#finale-envelope-wrapper', {
      opacity: 1,
      visibility: "visible",
      duration: 1,
      ease: "power2.out"
    });
    
    // Bouncing effect and hint
    tl.to('#finale-envelope', {
      y: -10,
      yoyo: true,
      repeat: -1,
      duration: 0.8,
      ease: "power1.inOut"
    }, "-=0.5");
    
    tl.to('#envelope-hint', {
      opacity: 1,
      visibility: "visible",
      duration: 0.5
    });
  }
  
  openEnvelope() {
    // Prevent multiple clicks
    const envelopeWrapper = document.getElementById('finale-envelope-wrapper');
    if (envelopeWrapper.classList.contains('open')) return;
    envelopeWrapper.classList.add('open');
    
    // Stop bouncing
    gsap.killTweensOf('#finale-envelope');
    
    const tl = gsap.timeline();
    
    // Hide hint
    tl.to('#envelope-hint', { opacity: 0, duration: 0.3 });
    
    // Open flap
    tl.to('#envelope-flap', {
      rotationX: 180,
      duration: 0.6,
      ease: "power2.inOut"
    });
    
    // Card slides out of envelope
    tl.to('#finale-card', {
      y: -150,
      opacity: 1,
      zIndex: 5,
      duration: 1.0,
      ease: "power2.out"
    }, "-=0.2");
    
    // Envelope fades away while card scales up to center
    tl.to('#finale-envelope', {
      opacity: 0,
      scale: 0.8,
      duration: 0.8
    });
    
    // Move card to final position — also switch wrapper to static flow so buttons are clickable
    tl.to('#finale-card', {
      y: 140,
      scale: 1,
      duration: 0.8,
      ease: "elastic.out(1, 0.8)",
      onComplete: () => {
        // Enable pointer events on the whole wrapper so card buttons can be clicked
        envelopeWrapper.style.pointerEvents = 'auto';
      }
    }, "-=0.8");
    
    // Divider
    tl.to('#finale-divider', {
      opacity: 0.6,
      duration: 0.5
    });

    // Message lines staggered
    const lines = document.querySelectorAll('.finale__message-line');
    tl.to(lines, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.5,
      ease: "power1.out"
    });
    
    // Closing
    tl.to('#finale-closing', {
      opacity: 1,
      duration: 0.8
    });
    
    // Replay button
    tl.to('#finale-actions', {
      opacity: 1,
      duration: 0.5
    });
  }

  onEnter() {
    this.isActive = true;
    this.resize();
    this.loop();
    
    // Adjust global audio toggle style for dark mode
    document.getElementById('audio-toggle').classList.add('dark-mode');
    
    // Start music
    audioManager.playMelody();
    
    // Start cinematic sequence
    this.runCinematic();
  }

  onLeave() {
    this.isActive = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    
    document.getElementById('audio-toggle').classList.remove('dark-mode');
    audioManager.stop();
    
    // Reset cinematic elements
    gsap.set(['#finale-moon', '#finale-card', '#finale-divider', '#finale-closing', '#finale-actions', '#finale-envelope-wrapper', '#envelope-hint', '#finale-envelope', '#envelope-flap'], {clearProps: "all"});
    gsap.set('.finale__message-line', {clearProps: "all"});
    const wrapper = document.getElementById('finale-envelope-wrapper');
    wrapper.classList.remove('open');
    wrapper.style.pointerEvents = '';
    
    if (this.flowerSystem) {
      this.flowerSystem.stop();
    }
  }
}
