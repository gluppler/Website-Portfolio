const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
let cols, drops, animationFrameId;
let isDragging = false, currentPanel = null, offsetX = 0, offsetY = 0, zIndexCounter = 10;
const FOOTER_MARGIN = 40; let footerHeight = 0;

function calculateFooterHeight() {
  const footer = document.querySelector('.footer');
  footerHeight = footer ? footer.offsetHeight + FOOTER_MARGIN : FOOTER_MARGIN;
  if (footer) footer.style.borderTop = 'none';
}

function enforceBoundaries(panel) {
  if (!panel || panel.style.display === 'none' || panel.style.position === 'fixed') return;
  const { width, height } = panel.getBoundingClientRect();
  const maxTop = window.innerHeight - height - footerHeight;
  const maxLeft = window.innerWidth - width;
  let top = parseInt(panel.style.top) || 0;
  let left = parseInt(panel.style.left) || 0;
  top = Math.min(Math.max(top, 10), maxTop);
  left = Math.min(Math.max(left, 10), maxLeft);
  panel.style.top = top + 'px';
  panel.style.left = left + 'px';
}

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

function makeDraggable(panel) {
  const header = panel.querySelector('.header');
  header.addEventListener('mousedown', (e) => {
    isDragging = true; currentPanel = panel;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    panel.style.zIndex = ++zIndexCounter;
  });
}

function stopDrag() {
  if (isDragging && currentPanel) enforceBoundaries(currentPanel);
  isDragging = false; currentPanel = null;
}

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  currentPanel.style.left = (e.clientX - offsetX) + 'px';
  currentPanel.style.top = (e.clientY - offsetY) + 'px';
});

document.addEventListener('mouseup', stopDrag);

function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = (panel.style.display === 'flex' ? 'none' : 'flex');
  if (panel.style.display === 'flex') { enforceBoundaries(panel); panel.style.zIndex = ++zIndexCounter; }
}

document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas(); calculateFooterHeight();
  document.querySelectorAll('.window').forEach((panel, i) => {
    makeDraggable(panel);
    panel.style.zIndex = 10 + i;
    if (panel.id === 'fact') {
      panel.style.position = 'fixed';
      panel.style.top = '10px';
      panel.style.left = '50%';
      panel.style.transform = 'translateX(-50%)';
      panel.style.display = 'flex';
    } else {
      panel.style.display = (window.innerWidth > 768 ? 'flex' : 'none');
    }
  });
  const help = document.getElementById('help');
  if (window.innerWidth <= 768) { help.style.display = 'flex'; }
  fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    .then(r => r.json())
    .then(d => document.getElementById('fact-text').textContent = d.text)
    .catch(_ => document.getElementById('fact-text').textContent = 'Fact fetch failed.');
  drawMatrix();
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      const map = { 'h': 'help', 'c': 'contact', 'w': 'whoami', 't': 'tools', 'p': 'projects' };
      const id = map[e.key.toLowerCase()];
      if (id) { e.preventDefault(); togglePanel(id); }
    }
  });
});

window.addEventListener('resize', () => {
  cancelAnimationFrame(animationFrameId);
  resizeCanvas(); calculateFooterHeight(); drawMatrix();
  document.querySelectorAll('.window').forEach(panel => { if (panel.style.display === 'flex') enforceBoundaries(panel); });
});
