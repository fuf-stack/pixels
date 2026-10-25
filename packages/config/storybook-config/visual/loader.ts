import type { LoaderFunction } from 'storybook/internal/types';

/** Shares visual settings with Playwright before rendering the story */
const visualLoader: LoaderFunction = async ({ parameters }) => {
  const query = new URLSearchParams(window.location.search);
  if (!query.has('visual-test')) {
    return {};
  }

  const theme = query.get('visual-theme') === 'dark' ? 'dark' : 'light';
  [document.documentElement, document.body].forEach((element) => {
    element.classList.remove('light', 'dark');
    element.classList.add(theme);
  });
  document.body.style.backgroundColor = theme === 'dark' ? '#000' : '#fff';

  // wait for the runner to apply the viewport before render and play begin
  await new Promise<void>((resolve) => {
    const handleReady = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === window.parent &&
        event.data?.type === 'visual:ready'
      ) {
        window.removeEventListener('message', handleReady);
        resolve();
      }
    };
    window.addEventListener('message', handleReady);
    window.parent.postMessage(
      { type: 'visual:prepare', options: parameters.visual },
      window.location.origin,
    );
  });

  return {};
};

export default visualLoader;
