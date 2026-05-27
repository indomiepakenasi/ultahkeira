/* ============================================
   PROCEDURAL FLOWERS — Keira's 21st Cat-verse
   ============================================ */

class Branch {
    constructor(x, y, angle, length, width, generation, maxGeneration) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.targetLength = length;
        this.currentLength = 0;
        this.width = width;
        this.generation = generation;
        this.maxGeneration = maxGeneration;
        this.isFinished = false;
        this.hasBranched = false;
        
        // Flower attributes
        this.flowerSize = 0;
        this.targetFlowerSize = 8 + Math.random() * 12;
        
        // Pastel colors for the flowers
        const colors = ['#FFD6E0', '#C8A2D0', '#B8E6C8', '#FFE4B5', '#FFC0CB', '#FFB7B2'];
        this.flowerColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Grow speed inversely proportional to generation
        this.speed = (6 / generation) + Math.random() * 2;
    }
    
    update(branchesArray) {
        if (this.isFinished) {
            // Grow flower if it's a leaf node
            if (this.generation === this.maxGeneration && this.flowerSize < this.targetFlowerSize) {
                this.flowerSize += 0.4;
            }
            return;
        }

        this.currentLength += this.speed;
        
        if (this.currentLength >= this.targetLength) {
            this.currentLength = this.targetLength;
            this.isFinished = true;
            
            // Spawn children branches
            if (this.generation < this.maxGeneration && !this.hasBranched) {
                const numBranches = Math.random() > 0.2 ? 2 : 1; // High chance of 2 branches
                for(let i = 0; i < numBranches; i++) {
                    const dir = (i === 0) ? -1 : 1;
                    const newAngle = this.angle + dir * (0.25 + Math.random() * 0.4);
                    const newLen = this.targetLength * (0.6 + Math.random() * 0.3);
                    branchesArray.push(new Branch(
                        this.x, this.y, 
                        newAngle, 
                        newLen, 
                        this.width * 0.7, 
                        this.generation + 1, 
                        this.maxGeneration
                    ));
                }
                this.hasBranched = true;
            }
        }

        this.x = this.startX + Math.cos(this.angle) * this.currentLength;
        this.y = this.startY + Math.sin(this.angle) * this.currentLength;
    }

    draw(ctx) {
        // Draw stem
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = '#7BAA84'; // Soft green
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw flower
        if (this.isFinished && this.generation === this.maxGeneration && this.flowerSize > 0) {
            ctx.fillStyle = this.flowerColor;
            // Petals
            for(let i = 0; i < 5; i++) {
                const ang = i * (Math.PI * 2 / 5) + this.angle;
                const px = this.x + Math.cos(ang) * this.flowerSize;
                const py = this.y + Math.sin(ang) * this.flowerSize;
                
                ctx.beginPath();
                ctx.arc(px, py, this.flowerSize * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Flower Center
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.flowerSize * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF8DC';
            ctx.fill();
        }
    }
}

export class FlowerSystem {
  constructor(canvasElement, onCompleteCallback) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.branches = [];
    this.isActive = false;
    this.onComplete = onCompleteCallback;
    this.hasCompleted = false;
    
    this.loop = this.loop.bind(this);
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.isActive = true;
    this.hasCompleted = false;
    this.branches = [];
    
    // Spawn 5-8 main stems across the bottom
    const numStems = 5 + Math.floor(Math.random() * 4);
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    for (let i = 0; i < numStems; i++) {
        // Distribute them evenly but with some randomness
        const x = (w / numStems) * i + (w / numStems) / 2 + (Math.random() * 60 - 30);
        // Angle pointing up, between -80 and -100 degrees
        const angle = -Math.PI / 2 + (Math.random() * 0.4 - 0.2); 
        // Stems take up about 20-35% of screen height
        const len = h * 0.2 + Math.random() * h * 0.15;
        
        // Start recursion with max generation 4
        this.branches.push(new Branch(x, h + 20, angle, len, 10, 1, 4));
    }
    
    this.loop();
  }

  loop() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let allFinished = true;

    this.branches.forEach(b => {
        b.update(this.branches);
        b.draw(this.ctx);
        
        // Check if this branch is still growing or if its flower is still blooming
        if (!b.isFinished || (b.generation === b.maxGeneration && b.flowerSize < b.targetFlowerSize)) {
            allFinished = false;
        }
    });

    // We keep updating the canvas to draw the static grown tree (or we could stop the loop, but it's cheap to redraw)
    // When everything is finished growing, trigger the callback once
    if (allFinished && !this.hasCompleted && this.branches.length > 0) {
        this.hasCompleted = true;
        if (this.onComplete) {
            // Add a small delay after blooming before triggering the card
            setTimeout(() => this.onComplete(), 800);
        }
    }

    // Keep looping to ensure it stays on screen
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.isActive = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
