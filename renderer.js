window.addEventListener('DOMContentLoaded', () => {
  const minBtn = document.getElementById('min-btn');
  const maxBtn = document.getElementById('max-btn');
  const closeBtn = document.getElementById('close-btn');

  if (minBtn) {
    minBtn.addEventListener('click', () => {
      window.electronAPI.minimize();
    });
  }
  if (maxBtn) {
    maxBtn.addEventListener('click', () => {
      window.electronAPI.maximize();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.electronAPI.close();
    });
  }
});