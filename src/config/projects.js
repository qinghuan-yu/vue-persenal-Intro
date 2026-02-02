// 统一管理项目列表数据
import { ASSETS } from './assets';

export const PROJECTS_DATA = [
  { 
    type: 'IOT', 
    title: 'GIF 播放器',
    descTitle: 'GIF-PLAYER',
    desc: '基于ESP-32以及 TFT 显示屏的便携式 GIF 播放器。支持多种动画格式和自定义播放列表。',
    link: 'https://github.com/qinghuan-yu/gif-player',
    image: ASSETS.PCB_DETAIL // 使用统一配置
  },
  { 
    type: 'VUE', 
    title: 'Vue 钢琴',
    descTitle: 'VUE-PIANO',
    desc: '基于 Vue.js 构建的交互式虚拟钢琴。内含天际线算法提取主旋律，可转化为token进行训练',
    link: 'https://github.com/qinghuan-yu/vue-piano',
    image: ASSETS.PIANO
  },
  { 
    type: 'DEEP-LEARNING', 
    title: '演奏分析', 
    descTitle: 'PIANALYSIS',
    desc: '基于Transformer框架的深度学习钢琴音色补全方法，可使用训练好的模型对MIDI文件进行织体补全。',
    link: 'https://github.com/qinghuan-yu/Pianalysis',
    image: ASSETS.AI
  },
  { 
    type: 'WEB', 
    title: '个人网页', 
    descTitle: 'PERSONAL INTRO',
    desc: '一个基于Vue的个人网页。',
    link: 'https://github.com/qinghuan-yu/vue-persenol-Intro',
    image: ASSETS.VUE
  },
];
