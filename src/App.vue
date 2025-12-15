<template>
  <router-view />
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Reset and global styles are now in MainLayout.vue or a dedicated CSS file */
body, html {
  margin: 0;
  padding: 0;
  background-color: #050505; /* Fallback background */
}
</style>