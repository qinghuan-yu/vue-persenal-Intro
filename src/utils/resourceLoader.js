export const preloadResources = async (resources, onProgress) => {
  const DEFAULT_WEIGHT = 64 * 1024;
  const itemStates = resources.map((item) => ({
    item,
    weight: DEFAULT_WEIGHT,
    loaded: 0
  }));

  let totalWeight = itemStates.reduce((sum, state) => sum + state.weight, 0);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const updateProgress = () => {
    const loadedWeight = itemStates.reduce((sum, state) => sum + state.loaded, 0);
    const percentage = totalWeight > 0 ? Math.floor((loadedWeight / totalWeight) * 100) : 100;
    if (onProgress) onProgress(clamp(percentage, 0, 100));
  };

  const setWeight = (state, nextWeight) => {
    const safeWeight = Math.max(1, Math.floor(nextWeight));
    if (safeWeight === state.weight) return;
    totalWeight += safeWeight - state.weight;
    state.weight = safeWeight;
    state.loaded = Math.min(state.loaded, state.weight);
  };

  const increaseLoaded = (state, delta) => {
    if (!delta || delta <= 0) return;
    state.loaded = Math.min(state.weight, state.loaded + delta);
    updateProgress();
  };

  const completeItem = (state) => {
    state.loaded = state.weight;
    updateProgress();
  };

  const estimateByHead = async (state) => {
    if (!state.item.url) return;
    try {
      const response = await fetch(state.item.url, { method: 'HEAD' });
      if (!response.ok) return;
      const contentLength = Number(response.headers.get('content-length'));
      if (Number.isFinite(contentLength) && contentLength > 0) {
        setWeight(state, contentLength);
      }
    } catch {
      // Ignore HEAD failures and keep fallback weight.
    }
  };

  const preloadByFetch = async (state) => {
    const response = await fetch(state.item.url);
    if (!response.ok) throw new Error(`Fetch failed: ${state.item.url}`);

    const headerLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(headerLength) && headerLength > 0) {
      setWeight(state, headerLength);
    }

    if (!response.body) {
      const blob = await response.blob();
      const blobSize = blob?.size || state.weight;
      setWeight(state, blobSize);
      completeItem(state);
      return;
    }

    const reader = response.body.getReader();
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunkSize = value?.length || 0;
      received += chunkSize;
      increaseLoaded(state, chunkSize);
    }

    if (!Number.isFinite(headerLength) || headerLength <= 0) {
      setWeight(state, Math.max(received, 1));
    }
    completeItem(state);
  };

  const loadItem = async (state) => {
    const item = state.item;
    try {
      if (item.type === 'image' || item.type === 'file' || item.type === 'audio') {
        await preloadByFetch(state);
      }
      else if (item.type === 'component') {
        await item.importFn();
        completeItem(state);
      }
      else {
        await new Promise((resolve) => setTimeout(resolve, 50));
        completeItem(state);
      }
      return item;
    } catch (error) {
      console.warn('Failed:', item.url || item.name, error);
      completeItem(state);
      return item;
    }
  };

  updateProgress();
  await Promise.all(itemStates.map(estimateByHead));
  updateProgress();
  return Promise.all(itemStates.map(loadItem));
};
