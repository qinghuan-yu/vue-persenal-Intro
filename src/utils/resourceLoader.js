export const preloadResources = async (resources, onProgress) => {
  let loadedCount = 0;
  const total = resources.length;
  
  const updateProgress = () => {
    loadedCount++;
    const percentage = Math.floor((loadedCount / total) * 100);
    if (onProgress) onProgress(percentage);
  };

  const loadItem = (item) => {
    return new Promise((resolve) => {
      const onSuccess = () => { updateProgress(); resolve(item); };
      const onError = () => { console.warn('Failed:', item.url || item.name); updateProgress(); resolve(item); };

      if (item.type === 'image') {
        const img = new Image();
        img.src = item.url;
        img.onload = onSuccess;
        img.onerror = onError;
      } 
      else if (item.type === 'file') {
        fetch(item.url).then(() => onSuccess()).catch(onError);
      }
      else if (item.type === 'audio') {
        fetch(item.url).then(res => res.blob()).then(onSuccess).catch(onError);
      } 
      else if (item.type === 'component') {
        // 预加载路由组件
        item.importFn().then(onSuccess).catch(onError);
      }
      else {
        // 模拟或者其他类型，给一点延迟让进度条不要跳太快
        setTimeout(onSuccess, 50); 
      }
    });
  };

  return Promise.all(resources.map(loadItem));
};
