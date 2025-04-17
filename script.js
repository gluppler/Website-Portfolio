const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
let cols, drops, animationFrameId;
let isDragging = false;
let currentPanel = null;
let offsetX = 0, offsetY = 0;
let zIndexCounter = 10;
const FOOTER_MARGIN = 40;
let footerHeight = 0;

// Calculate footer space to avoid overlap
function calculateFooterHeight() {
  const footer = document.querySelector('.footer');
  footerHeight = footer ? footer.offsetHeight + FOOTER_MARGIN : FOOTER_MARGIN;
  if (footer) footer.style.borderTop = 'none';
}

// Ensure panels stay in view except the fixed fact panel
function enforceBoundaries(panel) {
  if (!panel || panel.id === 'fact' || panel.style.display === 'none') return;
  const rect = panel.getBoundingClientRect();
  const maxTop = window.innerHeight - rect.height - footerHeight;
  const maxLeft = window.innerWidth - rect.width;
  let top = parseInt(panel.style.top) || rect.top;
  let left = parseInt(panel.style.left) || rect.left;
  top = Math.min(Math.max(top, 10), maxTop);
  left = Math.min(Math.max(left, 10), maxLeft);
  panel.style.top = `${top}px`;
  panel.style.left = `${left}px`;
}

// Matrix rain setup
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / 16);
  drops = Array(cols).fill(1);
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F0';
  ctx.font = '16px monospace';
  drops.forEach((y, i) => {
    const text = '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16));
    ctx.fillText(text, i * 16, y * 16);
    drops[i] = (drops[i] * 16 > canvas.height && Math.random() > 0.975) ? 1 : drops[i] + 1;
  });
  animationFrameId = requestAnimationFrame(drawMatrix);
}

// Make panel draggable, but skip fact panel
function makeDraggable(panel) {
  if (panel.id === 'fact') return; // Skip making fact draggable
  const header = panel.querySelector('.header');
  header.addEventListener('mousedown', e => {
    isDragging = true;
    currentPanel = panel;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    panel.style.zIndex = ++zIndexCounter;
  });
}

// Stop dragging and enforce boundaries
function stopDrag() {
  if (isDragging && currentPanel) enforceBoundaries(currentPanel);
  isDragging = false;
  currentPanel = null;
}

document.addEventListener('mousemove', e => {
  if (!isDragging || !currentPanel) return;
  currentPanel.style.left = `${e.clientX - offsetX}px`;
  currentPanel.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener('mouseup', stopDrag);

// Toggle panels via hotkeys or menu
function togglePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.style.display = (panel.style.display === 'flex') ? 'none' : 'flex';
  if (panel.style.display === 'flex') {
    if (panel.id !== 'fact') enforceBoundaries(panel);
    panel.style.zIndex = ++zIndexCounter;
  }
}

// Fetch random fortune
function fetchFact() {
  const factPanel = document.getElementById('fact');
  fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => factPanel.querySelector('#fact-text').textContent = data.text)
    .catch(() => factPanel.querySelector('#fact-text').textContent = 'Fact fetch failed.');
}

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  calculateFooterHeight();
  drawMatrix();
  fetchFact();

  document.querySelectorAll('.window').forEach((panel, i) => {
    if (panel.id === 'fact') {
      panel.style.position = 'fixed';
      panel.style.top = '10px';
      panel.style.left = '50%';
      panel.style.transform = 'translateX(-50%)';
      panel.style.resize = 'none';
      panel.style.display = 'flex';
    } else {
      panel.style.display = (window.innerWidth > 768) ? 'flex' : 'none';
      makeDraggable(panel);
    }
    panel.style.zIndex = 10 + i;
  });

  if (window.innerWidth <= 768) {
    const help = document.getElementById('help');
    help.style.display = 'flex';
  }

  window.addEventListener('keydown', e => {
    if (e.ctrlKey) {
      const map = { 'h': 'help', 'c': 'contact', 'w': 'whoami', 't': 'tools-core', 'p': 'projects' };
      const id = map[e.key.toLowerCase()];
      if (id) {
        e.preventDefault();
        togglePanel(id);
      }
    }
  });
});

window.addEventListener('resize', () => {
  cancelAnimationFrame(animationFrameId);
  resizeCanvas();
  calculateFooterHeight();
  drawMatrix();
  document.querySelectorAll('.window').forEach(panel => {
    if (panel.style.display === 'flex' && panel.id !== 'fact') enforceBoundaries(panel);
  });
});
