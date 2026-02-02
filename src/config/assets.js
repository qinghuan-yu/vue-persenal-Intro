// 统一管理所有静态资源引用
// 避免在各个组件中到处 import 同一张图片

import projUrl from '@/assets/proj.png';   // 之前是 pcb.png
import pcbUrl from '@/assets/pcb.png';     // 之前是 pcb2.png
import pianoUrl from '@/assets/piano.png';
import aiUrl from '@/assets/AI.png';
import vueUrl from '@/assets/vue.png';
import musicPng from '@/assets/music.png';
import mailPng from '@/assets/mail.png';
import githubPng from '@/assets/github.png';

export const ASSETS = {
  // 项目展示图
  PROJ_MAIN: projUrl, 
  PCB_DETAIL: pcbUrl,
  PIANO: pianoUrl,
  AI: aiUrl,
  VUE: vueUrl,

  // 联系方式图标
  ICON_MUSIC: musicPng,
  ICON_MAIL: mailPng,
  ICON_GITHUB: githubPng,
};

// 预加载列表：将所有需要预加载的资源路径提取出来
export const PRELOAD_LIST = Object.values(ASSETS);
