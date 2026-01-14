export class Particle {
  x: number;
  y: number;
  color: string;
  velocity: { x: number; y: number };
  alpha: number;
  friction: number;
  gravity: number;
  size: number;
  type: 'firework' | 'gold' | 'star';

  constructor(x: number, y: number, color: string, type: 'firework' | 'gold' | 'star' = 'firework') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.type = type;
    this.size = type === 'gold' ? 3 + Math.random() * 3 : 2;

    if (type === 'gold') {
      this.velocity = {
        x: (Math.random() - 0.5) * 4,
        y: -Math.random() * 8 - 2,
      };
      this.gravity = 0.2;
    } else {
      this.velocity = {
        x: (Math.random() - 0.5) * (Math.random() * 14),
        y: (Math.random() - 0.5) * (Math.random() * 14),
      };
      this.gravity = 0.12;
    }
    this.alpha = 1;
    this.friction = 0.96;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    if (this.type === 'gold') {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.type === 'gold' ? 0.008 : 0.012;
  }
}
