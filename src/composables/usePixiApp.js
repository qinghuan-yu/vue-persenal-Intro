import { Application } from 'pixi.js';
import { useAdvancedParticles } from './useAdvancedParticles.js';

/*
  usePixiApp
  - 目的是包装 Pixi `Application` 的创建与销毁，并初始化 `useAdvancedParticles` 粒子系统。
  - init(container): 异步初始化 Pixi，并将 canvas 挂载到传入的 DOM 容器上。
      返回对象包含 `morphToShapes` 控制函数用于触发粒子变形。
  - destroy(): 销毁粒子系统与 Pixi 实例，清理资源。
*/

let app = null;
let particles = null;
let exposedMorphToShapes = null;
let initPromise = null;
let waitingForInit = []; // 存储等待初始化的 Promise resolve 函数

export function usePixiApp() {
  const init = async (container) => {
    // 1. 如果没有 container 且没有初始化，则进入等待队列
    if (!container && !initPromise && !app) {
      console.log('usePixiApp: Waiting for container initialization...');
      return new Promise((resolve) => {
        waitingForInit.push(resolve);
      });
    }

    // 2. 如果已经在初始化中（或者已经初始化完成），直接复用 Promise
    if (initPromise) {
      await initPromise;
      // 支持热重载或变更容器：如果提供了新容器，把 canvas 搬过去
      if (app && container && app.canvas.parentNode !== container) {
        container.appendChild(app.canvas);
        app.resizeTo = container;
        app.resize();
      }
      return { morphToShapes: exposedMorphToShapes };
    }

    // 3. 开始真正的初始化（必须有 container）
    initPromise = (async () => {
      // 双重检查
      if (!container && !app) {
        throw new Error("usePixiApp: Cannot initialize without a container.");
      }

      if (app) return; 

      app = new Application();
      await app.init({
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundAlpha: 0,
        resizeTo: container,
        antialias: true,
        preference: 'webgl',
        powerPreference: 'high-performance', 
      });

      container.appendChild(app.canvas);

      // 初始化并启动高级粒子系统
      particles = useAdvancedParticles(app);
      particles.init(); 

      exposedMorphToShapes = particles.morphToShapes;
      
      // 唤醒所有等待者
      if (waitingForInit.length > 0) {
        waitingForInit.forEach(resolve => resolve({ morphToShapes: exposedMorphToShapes }));
        waitingForInit = [];
      }
    })();

    await initPromise;
    return { morphToShapes: exposedMorphToShapes };
  };

  const destroy = () => {
    if (particles) { particles.destroy(); particles = null; }
    if (app) { app.destroy(true, { children: true, texture: true, basePath: true }); app = null; }
    exposedMorphToShapes = null;
    initPromise = null; 
    waitingForInit = [];
  };

  const getParticleControls = () => {
    return { morphToShapes: exposedMorphToShapes };
  };

  return { init, destroy, getParticleControls };
}
