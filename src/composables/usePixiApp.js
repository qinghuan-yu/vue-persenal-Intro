import { Application, Graphics } from 'pixi.js';

// Based on Chapter 3: Neural Connection Particle System
export function usePixiApp() {
  let app;
  const particles = [];
  const graphics = new Graphics(); // Single graphics object for performance
  const PARTICLE_COUNT = 200;
  const CONNECTION_DISTANCE = 100;

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2 + 1;
      this.alpha = 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (app && (this.x > app.screen.width || this.x < 0)) this.vx = -this.vx;
      if (app && (this.y > app.screen.height || this.y < 0)) this.vy = -this.vy;
    }
  }

  function createParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * app.screen.width;
      const y = Math.random() * app.screen.height;
      particles.push(new Particle(x, y));
    }
  }

  function animate() {
    if (!app) return; // Guard clause
    graphics.clear(); // Clear the single graphics object

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();

      // Draw particle circle
      graphics.beginFill(0x999999, 0.5);
      graphics.drawCircle(p.x, p.y, p.radius);
      graphics.endFill();
    }
    
    // Draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          // Line opacity fades with distance
          const alpha = 1 - dist / CONNECTION_DISTANCE;
          graphics.lineStyle(0.5, 0x61b1d6, alpha * 0.5);
          graphics.moveTo(p1.x, p1.y);
          graphics.lineTo(p2.x, p2.y);
        }
      }
    }
  }

  const init = async (container) => {
    // Correct PIXI v8 initialization pattern
    app = new Application();
    await app.init({
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundAlpha: 0, // Transparent background
      resizeTo: container,
      antialias: true,
    });

    container.appendChild(app.view);
    app.stage.addChild(graphics);

    createParticles();
    app.ticker.add(animate);
  };

  const destroy = () => {
    if (app) {
      app.destroy(true, { children: true, texture: true, basePath: true });
    }
  };

  return {
    init,
    destroy,
  };
}
