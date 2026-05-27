/* ============================================
   MINI GAME LOGIC
   ============================================ */
import { CONFIG } from './config.js';

export class GameScreen {
  constructor(appManager) {
    this.app = appManager;
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // UI Elements
    this.scoreVal = document.getElementById('game-score-value');
    this.scoreBar = document.getElementById('game-score-bar');
    this.targetSpan = document.getElementById('game-target');
    this.overlayReady = document.getElementById('game-overlay-ready');
    this.overlayGameover = document.getElementById('game-overlay-gameover');
    this.overlayWin = document.getElementById('game-overlay-win');
    
    document.getElementById('btn-game-start').addEventListener('click', () => this.start());
    document.getElementById('btn-game-retry').addEventListener('click', () => this.start());
    document.getElementById('btn-game-back').addEventListener('click', () => this.app.navigateTo('landing'));
    document.getElementById('btn-game-back-go').addEventListener('click', () => this.app.navigateTo('landing'));
    
    this.btnNext = document.getElementById('btn-game-next');
    this.btnGameHome = document.getElementById('btn-game-home-win');
    this.gameCompleteText = document.getElementById('game-complete-text');
    
    this.btnNext.addEventListener('click', () => this.app.navigateTo('playground'));
    this.btnGameHome.addEventListener('click', () => this.app.navigateTo('landing'));
    
    // Game variables
    this.targetScore = CONFIG.targetScore;
    this.targetSpan.textContent = this.targetScore;
    
    this.animationId = null;
    this.state = 'ready'; // ready, playing, gameover, win
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Input handling
    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && this.state === 'playing') {
        e.preventDefault();
        this.jump();
      }
    });
    
    // Touch / Click handling on canvas wrapper
    document.getElementById('game-canvas-wrapper').addEventListener('mousedown', (e) => {
      if (this.state === 'playing') {
        this.jump();
      }
    });
    document.getElementById('game-canvas-wrapper').addEventListener('touchstart', (e) => {
      if (this.state === 'playing') {
        e.preventDefault(); // Prevent scrolling
        this.jump();
      }
    }, {passive: false});
  }
  
  resize() {
    const wrapper = this.canvas.parentElement;
    this.canvas.width = wrapper.clientWidth;
    this.canvas.height = wrapper.clientHeight;
    this.groundY = this.canvas.height - 40;
    
    // Reset player position if grounded
    if(this.player && !this.player.isJumping) {
        this.player.y = this.groundY - this.player.height;
    }
  }
  
  initGameObjects() {
    this.score = 0;
    this.speed = 5;
    this.frameCount = 0;
    
    this.player = {
      x: 50,
      width: 40,
      height: 40,
      y: this.groundY - 40,
      dy: 0,
      jumpPower: -12,
      gravity: 0.6,
      isJumping: false
    };
    
    this.obstacles = [];
    this.updateUI();
  }
  
  jump() {
    if (!this.player.isJumping) {
      this.player.dy = this.player.jumpPower;
      this.player.isJumping = true;
    }
  }
  
  start() {
    this.initGameObjects();
    this.state = 'playing';
    this.overlayReady.classList.remove('visible');
    this.overlayGameover.classList.remove('visible');
    this.overlayWin.classList.remove('visible');
    
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.loop();
  }
  
  gameOver() {
    this.state = 'gameover';
    document.getElementById('game-over-text').textContent = `Skor: ${this.score}`;
    this.overlayGameover.classList.add('visible');
  }
  
  win() {
    this.state = 'win';
    this.app.state.isGameDone = true;
    this.overlayWin.classList.add('visible');
    
    if (this.app.state.isPlaygroundDone) {
      this.btnNext.style.display = 'none';
      this.btnGameHome.style.display = 'inline-flex';
      this.gameCompleteText.textContent = "Selamat seluruh task sudah berhasil terselesaikan. Silahkan kembali ke beranda dan buka menu ucapan";
    } else {
      this.btnNext.style.display = 'inline-flex';
      this.btnGameHome.style.display = 'none';
      this.gameCompleteText.textContent = "Tugas Game Selesai!";
    }
  }
  
  updateUI() {
    this.scoreVal.textContent = this.score;
    const progress = Math.min(100, (this.score / this.targetScore) * 100);
    this.scoreBar.style.width = `${progress}%`;
  }
  
  loop() {
    if (this.state !== 'playing') return;
    
    this.update();
    this.draw();
    
    this.animationId = requestAnimationFrame(() => this.loop());
  }
  
  update() {
    this.frameCount++;
    
    // Player physics
    this.player.dy += this.player.gravity;
    this.player.y += this.player.dy;
    
    if (this.player.y > this.groundY - this.player.height) {
      this.player.y = this.groundY - this.player.height;
      this.player.dy = 0;
      this.player.isJumping = false;
    }
    
    // Spawn obstacles
    // Increase frequency slightly as speed increases
    const spawnRate = Math.max(60, 100 - (this.speed * 2));
    if (this.frameCount % Math.floor(spawnRate) === 0) {
      this.obstacles.push({
        x: this.canvas.width,
        y: this.groundY - 30,
        width: 30,
        height: 30,
        passed: false
      });
    }
    
    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.speed;
      
      // Collision detection
      if (
        this.player.x < obs.x + obs.width &&
        this.player.x + this.player.width > obs.x &&
        this.player.y < obs.y + obs.height &&
        this.player.y + this.player.height > obs.y
      ) {
        // Hit!
        this.gameOver();
        return;
      }
      
      // Score point
      if (obs.x + obs.width < this.player.x && !obs.passed) {
        obs.passed = true;
        this.score++;
        this.updateUI();
        
        // Increase speed slightly
        if (this.score % 5 === 0) {
          this.speed += 1;
        }
        
        if (this.score >= this.targetScore) {
          this.win();
          return;
        }
      }
      
      // Remove off-screen obstacles
      if (obs.x + obs.width < 0) {
        this.obstacles.splice(i, 1);
      }
    }
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw sky gradient (optional if CSS background is used, but CSS is static)
    
    // Draw ground
    this.ctx.fillStyle = '#C8A2D0';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
    
    // Draw ground line
    this.ctx.fillStyle = '#A87AB5';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, 4);
    
    // Draw player (simple cat shape)
    this.ctx.fillStyle = '#3D2B4F'; // dark purple cat
    // Body
    this.ctx.fillRect(this.player.x, this.player.y + 10, this.player.width, this.player.height - 10);
    // Head
    this.ctx.fillRect(this.player.x + 20, this.player.y, 25, 20);
    // Ears
    this.ctx.beginPath();
    this.ctx.moveTo(this.player.x + 20, this.player.y);
    this.ctx.lineTo(this.player.x + 25, this.player.y - 10);
    this.ctx.lineTo(this.player.x + 30, this.player.y);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(this.player.x + 35, this.player.y);
    this.ctx.lineTo(this.player.x + 40, this.player.y - 10);
    this.ctx.lineTo(this.player.x + 45, this.player.y);
    this.ctx.fill();
    // Tail
    this.ctx.fillRect(this.player.x - 10, this.player.y + 20, 10, 5);
    
    // Draw obstacles (yarn balls)
    this.ctx.fillStyle = '#FFD6E0';
    this.obstacles.forEach(obs => {
      this.ctx.beginPath();
      this.ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/2, 0, Math.PI * 2);
      this.ctx.fill();
      // string details
      this.ctx.strokeStyle = '#FFB8C9';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.width/3, 0, Math.PI);
      this.ctx.stroke();
    });
  }

  onEnter() {
    this.resize();
    this.state = 'ready';
    this.overlayReady.classList.add('visible');
    this.initGameObjects(); // Show initial state
    this.draw();
  }

  onLeave() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}
