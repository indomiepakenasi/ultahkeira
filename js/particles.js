/* ============================================
   PARTICLES SYSTEM — Keira's 21st Cat-verse
   ============================================ */

export class ParticleSystem {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isActive = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    // If it's the playground canvas, it might be inside a container, 
    // otherwise use window dimensions.
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  start() {
    if (!this.isActive) {
      this.isActive = true;
      this.loop();
    }
  }

  stop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  loop() {
    if (!this.isActive) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      
      if (p.gravity) p.vy += p.gravity;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.translate(p.x, p.y);
      if (p.rotation) this.ctx.rotate(p.rotation);
      
      if (p.type === 'sparkle') {
        this.drawSparkle(p);
      } else if (p.type === 'heart') {
        this.drawHeart(p);
      } else if (p.type === 'food') {
        this.drawFood(p);
      }
      
      this.ctx.restore();
    });
  }

  drawSparkle(p) {
    this.ctx.fillStyle = p.color || '#FFF';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawHeart(p) {
    const size = p.size;
    this.ctx.fillStyle = p.color || '#FFD6E0';
    this.ctx.beginPath();
    this.ctx.moveTo(0, size / 4);
    this.ctx.quadraticCurveTo(0, 0, size / 4, 0);
    this.ctx.quadraticCurveTo(size / 2, 0, size / 2, size / 4);
    this.ctx.quadraticCurveTo(size / 2, size / 2, 0, size);
    this.ctx.quadraticCurveTo(-size / 2, size / 2, -size / 2, size / 4);
    this.ctx.quadraticCurveTo(-size / 2, 0, -size / 4, 0);
    this.ctx.quadraticCurveTo(0, 0, 0, size / 4);
    this.ctx.fill();
  }

  drawFood(p) {
    // Simple fish shape
    this.ctx.fillStyle = '#FFE4B5';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, p.size, p.size/2, 0, 0, Math.PI * 2);
    this.ctx.moveTo(-p.size, 0);
    this.ctx.lineTo(-p.size*1.5, -p.size/2);
    this.ctx.lineTo(-p.size*1.5, p.size/2);
    this.ctx.fill();
  }

  // Helper to spawn hearts
  spawnHearts(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'heart',
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 2,
        size: Math.random() * 10 + 10,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.01,
        gravity: -0.05, // Float up
        color: ['#FFD6E0', '#FFB8C9', '#FF99B0'][Math.floor(Math.random() * 3)]
      });
    }
  }

  // Helper to spawn food
  spawnFood(x, y) {
    this.particles.push({
      type: 'food',
      x: x,
      y: y - 50,
      vx: (Math.random() - 0.5) * 2,
      vy: -2,
      size: Math.random() * 8 + 8,
      life: 1.0,
      decay: 0.015,
      gravity: 0.2, // Fall down
      rotation: Math.random() * Math.PI
    });
  }

  // Spawn ambient sparkles
  spawnAmbientSparkle() {
    this.particles.push({
      type: 'sparkle',
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: 0,
      vy: Math.random() * -0.5 - 0.1,
      size: Math.random() * 2 + 1,
      life: 0, // Starts faded out
      decay: -0.02, // Fades in first
      gravity: 0,
      color: ['#FFF8F0', '#FFE4B5', '#C8A2D0'][Math.floor(Math.random() * 3)],
      // Custom logic for fade in then out
      updateCustom(p) {
        if (p.life > 1) p.decay = 0.02; // Start fading out once fully visible
      }
    });
  }
}
