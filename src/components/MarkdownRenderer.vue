<template>
  <div class="markdown-body" v-html="htmlContent"></div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import { getHighlighter } from 'shiki';
// Temporarily using a simple css fallback if github-markdown-css isn't installed
// import 'github-markdown-css/github-markdown-dark.css'; 

const props = defineProps({
  source: String // 传入的 md 原始内容
});

const htmlContent = ref('');
const metadata = ref({});

const init = async () => {
    if (!props.source) return;

    // 1. 解析 Frontmatter (头部元数据) (Simple shim if matter not installed, but trying standard way)
    // Note: If gray-matter fails in browser without node polyfills, this might need vite config adj.
    // For now assuming Vite handles it or we process raw string simply.
    let content = props.source;
    
    try {
      const parsed = matter(props.source);
      content = parsed.content;
      metadata.value = parsed.data;
      emit('metadata', parsed.data);
    } catch (e) {
      console.warn("Markdown parsing basic mode:", e);
    }

    // 2. 初始化 Shiki 高亮 (Lazy load)
    let highlighter;
    try {
        highlighter = await getHighlighter({
            themes: ['github-dark'],
            langs: ['javascript', 'vue', 'css', 'html', 'python', 'bash']
        });
    } catch (e) {
        console.warn("Shiki loading failed, falling back to plain code", e);
    }

    // 3. 配置 Markdown-it
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        highlight: (code, lang) => {
            if (highlighter) {
                return highlighter.codeToHtml(code, { lang, theme: 'github-dark' });
            }
            return `<pre class="hljs"><code>${code}</code></pre>`;
        }
    });

    htmlContent.value = md.render(content);
};

const emit = defineEmits(['metadata']);

watchEffect(() => {
    if (props.source) init();
});
</script>

<style>
/* Global Markdown Styles Override for Transparency */
.markdown-body {
  background-color: transparent !important;
  font-family: 'Space Grotesk', 'Noto Sans SC', sans-serif;
  color: #e6e6e6;
  line-height: 1.6;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 0.3em;
  color: #fff;
  margin-top: 1.5em;
}

.markdown-body blockquote {
  border-left: 4px solid #61b1d6; /* Accent Color */
  color: #8b949e;
  padding-left: 1em;
  background: rgba(255,255,255,0.05); /* Slight bg for quote */
}

.markdown-body a {
  color: #61b1d6;
  text-decoration: none;
}
.markdown-body a:hover {
  text-decoration: underline;
}

/* Shiki Code Block Styles */
.markdown-body pre.shiki {
  background-color: #0d1117 !important; /* GitHub Dark BG */
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
  overflow-x: auto;
}

.markdown-body code {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  background: rgba(255,255,255,0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}
.markdown-body pre code {
  background: transparent;
  padding: 0;
}

.markdown-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
}
.markdown-body table th, .markdown-body table td {
    border: 1px solid rgba(255,255,255,0.2);
    padding: 8px 12px;
}
</style>
