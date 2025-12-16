import { Graphics } from 'pixi.js';

// --- 整体配置 (Optimized for QR Code Clarity) ---
const PARTICLE_COUNT = 6000;      // 提升粒子总数以填充细节
const PARTICLE_SIZE_MIN = 0.8;    // 更细腻的点
const PARTICLE_SIZE_MAX = 1.5;

// --- 神经网络状态 (NETWORK) 配置 ---
const NETWORK_PARTICLE_COUNT = 300;
const PARTICLE_GROWTH_TIME = 8000;
const DISTANCE_GROWTH_TIME = 10000;
const MAX_CONNECTION_DISTANCE = 200;
const LINE_COLOR = 0x61b1d6;
const SCREEN_PADDING = 150;
const MOUSE_RADIUS_NETWORK = 60;
const MOUSE_FORCE_NETWORK = 2;
const RETURN_SPEED_NETWORK = 0.04;

// --- 变形状态 (MORPH) 配置 ---
const MORPH_CONFIG = {
  DRAG: 0.92,
  EASE: 0.15,
  MOUSE_REPULSION_SQ: 8000,
  MOUSE_REPULSION_FORCE: 5,
};

// --- 颜色 ---
const COLOR_ACCENT = 0x61b1d6; // 科技蓝
const COLOR_DARK_1 = 0x333333;
const COLOR_DARK_2 = 0x555555;


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class Particle {
    constructor(w, h) {
      this.init(w, h);
    }
    
    init(w, h, initial = false) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.radius = Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN;
        this.currentRenderAlpha = 0;
        this.visible = true;
        
        this.vx = 0;
        this.vy = 0;

        this.baseVx = (Math.random() - 0.5) * 0.6;
        this.baseVy = (Math.random() - 0.5) * 0.6;
        const rand = Math.random();
        if (rand > 0.9) {
            this.baseColor = COLOR_ACCENT;
            this.maxAlpha = 0.9;
        } else if (rand > 0.6) {
            this.baseColor = COLOR_DARK_1;
            this.maxAlpha = 0.5;
        } else {
            this.baseColor = COLOR_DARK_2;
            this.maxAlpha = 0.4;
        }

        this.currentColor = this.baseColor;
        this.targetColor = this.baseColor;

        this.breathPhase = Math.random() * Math.PI * 2;
        this.breathSpeed = 0.02 + Math.random() * 0.03;
        this.breathAmp = 0.3 + Math.random() * 0.2;
        this.fadeInFactor = initial ? 1 : 0;

        this.targetX = this.x;
        this.targetY = this.y;
    }

    updateNetwork(w, h, mouseX, mouseY) {
        this.vx += (this.baseVx - this.vx) * RETURN_SPEED_NETWORK;
        this.vy += (this.baseVy - this.vy) * RETURN_SPEED_NETWORK;

        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < MOUSE_RADIUS_NETWORK * MOUSE_RADIUS_NETWORK) {
            const dist = Math.sqrt(distSq);
            const forceFactor = (MOUSE_RADIUS_NETWORK - dist) / MOUSE_RADIUS_NETWORK;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * forceFactor * MOUSE_FORCE_NETWORK;
            this.vy += Math.sin(angle) * forceFactor * MOUSE_FORCE_NETWORK;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.fadeInFactor < 1) this.fadeInFactor += 0.015;
        if (this.fadeInFactor > 1) this.fadeInFactor = 1;

        let edgeFadeFactor = 1;
        if (this.x < 0) edgeFadeFactor = 1 - Math.abs(this.x) / SCREEN_PADDING;
        else if (this.x > w) edgeFadeFactor = 1 - (this.x - w) / SCREEN_PADDING;
        if (this.y < 0) edgeFadeFactor = 1 - Math.abs(this.y) / SCREEN_PADDING;
        else if (this.y > h) edgeFadeFactor = 1 - (this.y - h) / SCREEN_PADDING;

        this.breathPhase += this.breathSpeed;
        const breathFactor = 1 - (Math.sin(this.breathPhase) * 0.5 + 0.5) * this.breathAmp;
        this.currentRenderAlpha = this.maxAlpha * edgeFadeFactor * this.fadeInFactor * breathFactor;

        if (this.x < -SCREEN_PADDING || this.x > w + SCREEN_PADDING || this.y < -SCREEN_PADDING || this.y > h + SCREEN_PADDING) {
            this.init(w, h, false);
        }
        
        // --- [新增] 颜色逻辑: 恢复到 baseColor ---
        if (this.currentColor !== this.baseColor) {
            const r1 = (this.currentColor >> 16) & 0xFF;
            const g1 = (this.currentColor >> 8) & 0xFF;
            const b1 = this.currentColor & 0xFF;
            const r2 = (this.baseColor >> 16) & 0xFF;
            const g2 = (this.baseColor >> 8) & 0xFF;
            const b2 = this.baseColor & 0xFF;

            const r = r1 + (r2 - r1) * 0.05;
            const g = g1 + (g2 - g1) * 0.05;
            const b = b1 + (b2 - b1) * 0.05;
            this.currentColor = (r << 16) | (g << 8) | b;
        }
    }

    updateMorph(mouseX, mouseY) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        // --- 扫码防抖：当粒子足够接近目标时，将其锁定 ---
        const distToTargetSq = dx * dx + dy * dy;
        if (distToTargetSq < 0.25) { // 0.5 * 0.5
            this.x = this.targetX;
            this.y = this.targetY;
            this.vx = 0;
            this.vy = 0;
            this.currentColor = this.targetColor; // 锁定颜色
        } else {
            const distMouseX = this.x - mouseX;
            const distMouseY = this.y - mouseY;
            const distMouseSq = distMouseX * distMouseX + distMouseY * distMouseY;
            
            let forceX = 0;
            let forceY = 0;

            if (distMouseSq < MORPH_CONFIG.MOUSE_REPULSION_SQ) {
                const force = (MORPH_CONFIG.MOUSE_REPULSION_SQ - distMouseSq) / MORPH_CONFIG.MOUSE_REPULSION_SQ;
                forceX = distMouseX * force * MORPH_CONFIG.MOUSE_REPULSION_FORCE;
                forceY = distMouseY * force * MORPH_CONFIG.MOUSE_REPULSION_FORCE;
            }

            this.vx += dx * MORPH_CONFIG.EASE + forceX;
            this.vy += dy * MORPH_CONFIG.EASE + forceY;
            
            this.vx *= MORPH_CONFIG.DRAG;
            this.vy *= MORPH_CONFIG.DRAG;
            
            this.x += this.vx;
            this.y += this.vy;
            
            // --- [新增] 颜色逻辑: 趋近 targetColor ---
            const r1 = (this.currentColor >> 16) & 0xFF;
            const g1 = (this.currentColor >> 8) & 0xFF;
            const b1 = this.currentColor & 0xFF;
            const r2 = (this.targetColor >> 16) & 0xFF;
            const g2 = (this.targetColor >> 8) & 0xFF;
            const b2 = this.targetColor & 0xFF;

            const r = r1 + (r2 - r1) * MORPH_CONFIG.EASE;
            const g = g1 + (g2 - g1) * MORPH_CONFIG.EASE;
            const b = b1 + (b2 - b1) * MORPH_CONFIG.EASE;
            this.currentColor = (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
        }

        if (this.fadeInFactor < 1) this.fadeInFactor += 0.05;
        if (this.fadeInFactor > 1) this.fadeInFactor = 1;
        this.currentRenderAlpha = this.maxAlpha * this.fadeInFactor;
    }

    moveTo(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.visible = true;
        this.fadeInFactor = 0;
        this.vx = 0;
        this.vy = 0;
        this.targetColor = this.baseColor; // 重置目标颜色
    }
    
    releaseToNetwork(w, h) {
        this.init(w, h, false);
        this.vx = this.baseVx;
        this.vy = this.baseVy;
    }
}


export function useAdvancedParticles(app) {
    const graphics = new Graphics();
    const particles = [];
    let state = 'NETWORK';
    let startTime = null;
    let mouseX = -9999;
    let mouseY = -9999;
    
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    function init() {
        app.stage.addChild(graphics);
        startTime = null;
        particles.length = 0;
        
        const w = app.screen.width;
        const h = app.screen.height;
        for(let i=0; i<PARTICLE_COUNT; i++) {
            particles.push(new Particle(w, h, false));
        }

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);
        
        app.ticker.add(animate);
    }
    
    function destroy() {
        app.ticker.remove(animate);
        window.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseleave', handleMouseLeave);
        graphics.destroy();
        particles.length = 0;
    }

    function animate() {
        graphics.clear();
        const w = app.screen.width;
        const h = app.screen.height;

        if (state === 'NETWORK') {
            if (startTime === null) startTime = performance.now();
            const elapsed = performance.now() - startTime;
            updateAndDrawNetwork(w, h, elapsed);
        } else if (state === 'MORPH') {
            updateAndDrawMorph();
        }
    }

    function updateAndDrawNetwork(w, h, elapsed) {
        const distProgress = Math.min(elapsed / DISTANCE_GROWTH_TIME, 1);
        const easeDist = 1 - Math.pow(1 - distProgress, 3);
        const currentConnectionDistance = easeDist * MAX_CONNECTION_DISTANCE;

        const countProgress = Math.min(elapsed / PARTICLE_GROWTH_TIME, 1);
        const easeCount = 1 - Math.pow(1 - countProgress, 3);
        const currentTargetCount = Math.floor(easeCount * NETWORK_PARTICLE_COUNT);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (i < currentTargetCount) {
                if (!p.visible) p.releaseToNetwork(w, h);
                p.visible = true;
            } else {
                p.visible = false;
                continue;
            }

            p.updateNetwork(w, h, mouseX, mouseY);
            if (p.currentRenderAlpha > 0.01) {
                 graphics.circle(p.x, p.y, p.radius).fill({ color: p.currentColor, alpha: p.currentRenderAlpha });
            }
        }
        
        if (currentConnectionDistance < 5) return;

        for (let i = 0; i < currentTargetCount; i++) {
            const p1 = particles[i];
            if (!p1.visible || p1.currentRenderAlpha <= 0.05) continue;
            for (let j = i + 1; j < currentTargetCount; j++) {
                const p2 = particles[j];
                if (!p2.visible || p2.currentRenderAlpha <= 0.05) continue;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                if (Math.abs(dx) > currentConnectionDistance || Math.abs(dy) > currentConnectionDistance) continue;

                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < currentConnectionDistance) {
                    const distAlpha = 1 - (dist / currentConnectionDistance);
                    const finalAlpha = distAlpha * Math.min(p1.currentRenderAlpha, p2.currentRenderAlpha) * 0.8;
                    if (finalAlpha > 0.02) {
                        graphics.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y).stroke({ width: 1, color: LINE_COLOR, alpha: finalAlpha });
                    }
                }
            }
        }
    }
    
    function updateAndDrawMorph() {
        for (const p of particles) {
            if (p.visible) {
                p.updateMorph(mouseX, mouseY);
                if (p.currentRenderAlpha > 0.01) {
                    graphics.circle(p.x, p.y, p.radius).fill({ color: p.currentColor, alpha: p.currentRenderAlpha });
                }
            }
        }
    }

    function handleMouseMove(e) {
        if (!app.canvas) return;
        const rect = app.canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }
    function handleMouseLeave() {
        mouseX = -9999;
        mouseY = -9999;
    }

    function getPointsFromSource(source, options = {}) {
        return new Promise((resolve) => {
            const { type = 'text', scale = 1, color = '#FFFFFF' } = options;
            
            if (type === 'image') {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = source;
                img.onload = () => {
                    const scaledWidth = img.width * scale;
                    const scaledHeight = img.height * scale;
                    offscreenCanvas.width = scaledWidth;
                    offscreenCanvas.height = scaledHeight;
                    offscreenCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                    resolve(scanCanvas(scaledWidth, scaledHeight));
                };
                img.onerror = (err) => {
                    console.error('Image failed to load:', source, err);
                    resolve([]);
                }
            } else { // text
                const fontSize = options.fontSize || 120;
                const fontFamily = options.fontFamily || 'Arial';
                offscreenCtx.font = `bold ${fontSize}px ${fontFamily}`;
                const textMetrics = offscreenCtx.measureText(source);
                offscreenCanvas.width = textMetrics.width;
                offscreenCanvas.height = fontSize;
                
                offscreenCtx.font = `bold ${fontSize}px ${fontFamily}`;
                offscreenCtx.fillStyle = color;
                offscreenCtx.textBaseline = 'middle';
                offscreenCtx.textAlign = 'center';
                offscreenCtx.fillText(source, textMetrics.width / 2, fontSize / 2);

                resolve(scanCanvas(textMetrics.width, fontSize));
            }
        });
    }

    // --- 核心修复：基于亮度提取粒子 ---
    function scanCanvas(width, height) {
        const points = [];
        const imageData = offscreenCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // 采样步长：越小越清晰，但粒子数会暴增
        // 想要达到 GitHub 项目的效果，这里必须设为 1 或 2
        const step = 2; 

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                // 核心判定：只要不是纯黑 (RGB > 20) 且 不透明
                if (a > 0 && (r > 20 || g > 20 || b > 20)) {
                    // 将颜色转为 Hex 或 Pixi 能用的格式
                    const color = (r << 16) | (g << 8) | b; 
                    
                    points.push({ 
                        x, 
                        y, 
                        color // <--- 关键：把颜色带出去
                    });
                }
            }
        }
        return points;
    }

    async function morphToShapes(configs) {
        const w = app.screen.width;
        const h = app.screen.height;

        // 1. 如果为空，返回网络状态
        if (!configs || configs.length === 0) {
            if (state === 'NETWORK') return; 
            state = 'NETWORK';
            startTime = null; 
            for (const p of particles) {
                p.targetX = Math.random() * w;
                p.targetY = Math.random() * h;
            }
            return;
        }

        state = 'MORPH';
        startTime = null; 

        // 2. 加载资源
        const shapesData = await Promise.all(
            configs.map(config => 
                getPointsFromSource(config.source, config.options)
                .then(points => {
                    if (points.length === 0) return null;
                    const bounds = {
                        minX: Math.min(...points.map(p => p.x)),
                        maxX: Math.max(...points.map(p => p.x)),
                        minY: Math.min(...points.map(p => p.y)),
                        maxY: Math.max(...points.map(p => p.y)),
                    };
                    return { 
                        points, 
                        width: bounds.maxX - bounds.minX, 
                        height: bounds.maxY - bounds.minY,
                        bounds,
                        // 关键：透传配置类型，用于后续分类
                        type: config.options.type || 'text' 
                    };
                })
            )
        );

        const validShapes = shapesData.filter(Boolean);
        if (validShapes.length === 0) {
            morphToShapes([]);
            return;
        }
        
        // --- 核心修改：智能分类布局 (Smart Wingman Layout) ---
        
        // A. 自动分类：挑出图片(二维码)和文字
        const qrShapes = validShapes.filter(s => s.type === 'image');
        const textShapes = validShapes.filter(s => s.type === 'text');

        let particleIndex = 0;
        const centerX = w / 2;
        const centerY = h / 2;
        
        // 布局参数
        const CENTER_SAFE_ZONE = 450; 
        const QR_VERTICAL_OFFSET = -50; 
        const TEXT_BOTTOM_OFFSET = 220; // 文字稍微再靠下一点，避免和 HTML 撞车

        // B. 放置左侧二维码 (取图片组的第1个)
        if (qrShapes[0]) {
            const shape = qrShapes[0];
            const targetX = centerX - (CENTER_SAFE_ZONE / 2) - shape.width; 
            const targetY = centerY - (shape.height / 2) + QR_VERTICAL_OFFSET;
            fillParticles(shape, targetX, targetY);
        }

        // C. 放置右侧二维码 (取图片组的第2个)
        if (qrShapes[1]) {
            const shape = qrShapes[1];
            const targetX = centerX + (CENTER_SAFE_ZONE / 2);
            const targetY = centerY - (shape.height / 2) + QR_VERTICAL_OFFSET;
            fillParticles(shape, targetX, targetY);
        }

        // D. 放置底部文字 (取文字组的第1个)
        // 哪怕没有二维码，只要有文字，就会执行这里，并放在底部
        if (textShapes[0]) {
            const shape = textShapes[0];
            const targetX = centerX - (shape.width / 2); // 水平居中
            const targetY = centerY + TEXT_BOTTOM_OFFSET;
            fillParticles(shape, targetX, targetY);
        }

        // 辅助函数：填充粒子
        function fillParticles(shape, targetX, targetY) {
            shuffleArray(shape.points);
            for (const point of shape.points) {
                if (particleIndex < particles.length) {
                    const p = particles[particleIndex++];
                    
                    // 1. 设置位置
                    const offsetX = targetX - shape.bounds.minX;
                    const offsetY = targetY - shape.bounds.minY;
                    p.moveTo(point.x + offsetX, point.y + offsetY);
                    
                    // 2. 【新增】设置颜色
                    // 如果 point.color 存在（图片模式），就用图片的颜色
                    // 如果是文字模式，就用统一的蓝色
                    if (point.color !== undefined) {
                        p.targetColor = point.color; 
                    } else {
                        p.targetColor = 0x61b1d6; // 默认科技蓝
                    }
                }
            }
        }

        // E. 隐藏多余粒子
        for (let i = particleIndex; i < particles.length; i++) {
            particles[i].visible = false;
        }
    }

    return {
        init,
        destroy,
        morphToShapes
    };
}