const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
let cols, drops;
let animationFrameId;
const FOOTER_MARGIN = 40;
let footerHeight = 0;

let isDragging = false;
let currentPanel = null;
let offsetX, offsetY;
let zIndexCounter = 10;
let activeMobilePanelId = null;

// --- Utility Functions ---
function calculateFooterHeight() {
  const footer = document.querySelector('.footer');
  footerHeight = footer ? footer.offsetHeight + FOOTER_MARGIN : FOOTER_MARGIN;
  if (footer) footer.style.borderTop = 'none';
}

function enforceBoundaries(panel) {
  if (!panel || panel.style.display === 'none' || panel.style.position === 'fixed') return;
  const rect = panel.getBoundingClientRect();
  const panelWidth = rect.width || panel.offsetWidth;
  const panelHeight = rect.height || panel.offsetHeight;
  if (panelWidth === 0 || panelHeight === 0) return;
  const maxTop = window.innerHeight - panelHeight - footerHeight;
  const maxLeft = window.innerWidth - panelWidth;
  let top = parseInt(panel.style.top) || 0;
  let left = parseInt(panel.style.left) || 0;
  top = Math.min(Math.max(top, 10), Math.max(10, maxTop));
  left = Math.min(Math.max(left, 10), Math.max(10, maxLeft));
  panel.style.top = `${top}px`;
  panel.style.left = `${left}px`;
}

// --- Matrix Animation ---
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / 16);
  drops = Array(cols).fill(0).map(() => Math.random() * canvas.height);
}

const katakana = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nums = "0123456789";
const chars = katakana + latin + nums;

function drawMatrix() {
  if (!ctx) return;
  const isMobile = window.innerWidth <= 768;
  ctx.fillStyle = isMobile ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F0';
  ctx.font = '16px monospace';
  drops.forEach((y, i) => {
    const text = chars[Math.floor(Math.random() * chars.length)];
    const x = i * 16;
    ctx.fillText(text, x, y);
    drops[i] = (y > canvas.height && Math.random() > 0.975) ? 0 : y + 16;
  });
  animationFrameId = requestAnimationFrame(drawMatrix);
}

// --- Panel Dragging & Interaction ---
function createTrail(panel) {
  const clone = panel.cloneNode(true);
  clone.id = '';
  clone.classList.add('trailing');
  clone.style.zIndex = (parseInt(panel.style.zIndex) || 10) - 1;
  document.body.appendChild(clone);
  setTimeout(() => clone.remove(), 200);
}

function makeDraggable(panel) {
  const header = panel.querySelector('.header');
  if (!header) return;
  const startDrag = (x, y) => {
    isDragging = true;
    currentPanel = panel;
    offsetX = x - panel.offsetLeft;
    offsetY = y - panel.offsetTop;
    panel.style.zIndex = ++zIndexCounter;
    if (window.innerWidth > 768) createTrail(panel);
  };
  header.addEventListener('mousedown', e => {
    if (e.target !== header) return;
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  });
  header.addEventListener('touchstart', e => {
    if (e.target !== header) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  }, { passive: false });
  panel.addEventListener('mousedown', () => panel.style.zIndex = ++zIndexCounter);
}

document.addEventListener('mousemove', e => {
  if (!isDragging || !currentPanel) return;
  let newTop = e.clientY - offsetY;
  let newLeft = e.clientX - offsetX;
  const maxTop = window.innerHeight - currentPanel.offsetHeight - footerHeight;
  const maxLeft = window.innerWidth - currentPanel.offsetWidth;
  newTop = Math.min(Math.max(newTop, 10), Math.max(10, maxTop));
  newLeft = Math.min(Math.max(newLeft, 10), Math.max(10, maxLeft));
  currentPanel.style.top = `${newTop}px`;
  currentPanel.style.left = `${newLeft}px`;
});

document.addEventListener('mouseup', () => {
  if (isDragging && currentPanel) enforceBoundaries(currentPanel);
  isDragging = false;
  currentPanel = null;
});

// --- Panel Toggling ---
function togglePanel(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    document.querySelectorAll('.window').forEach(w => {
      if (w.id !== 'fact' && w.id !== id) w.style.display = 'none';
    });
    panel.style.display = (panel.style.display === 'flex') ? 'none' : 'flex';
    panel.style.zIndex = ++zIndexCounter;
  } else {
    const show = (panel.style.display !== 'flex');
    panel.style.display = show ? 'flex' : 'none';
    if (show) {
      enforceBoundaries(panel);
      panel.style.zIndex = ++zIndexCounter;
    }
  }
}

// --- Initialization & Resize Handling ---
function init() {
  resizeCanvas();
  calculateFooterHeight();
  drawMatrix();
  document.querySelectorAll('.window').forEach((panel, i) => {
    if (panel.id !== 'fact') panel.style.display = (window.innerWidth > 768) ? 'flex' : 'none';
    panel.style.zIndex = 10 + i;
    makeDraggable(panel);
  });
  const fact = document.getElementById('fact');
  if (fact) {
    fact.style.position = 'fixed';
    fact.style.top = '10px';
    fact.style.left = '50%';
    fact.style.transform = 'translateX(-50%)';
    fact.style.zIndex = '100';
    fact.style.resize = 'none';
  }
  const footer = document.querySelector('.footer');
  if (footer) footer.style.borderTop = 'none';
  fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => fact && fact.querySelector('#fact-text').textContent = data.text)
    .catch(() => fact && fact.querySelector('#fact-text').textContent = 'Fact fetch failed.');
  window.addEventListener('keydown', e => {
    if (e.ctrlKey) {
      const map = { h: 'help', c: 'contact', w: 'whoami', t: 'tools', p: 'projects' };
      const id = map[e.key.toLowerCase()];
      if (id) { e.preventDefault(); togglePanel(id); }
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  resizeCanvas();
  calculateFooterHeight();
  drawMatrix();
  const fact = document.getElementById('fact');
  if (fact) {
    fact.style.position = 'fixed';
    fact.style.top = '10px';
    fact.style.left = '50%';
    fact.style.transform = 'translateX(-50%)';
  }
  const footer = document.querySelector('.footer');
  if (footer) footer.style.borderTop = 'none';
  document.querySelectorAll('.window').forEach(panel => {
    if (panel.style.display === 'flex') enforceBoundaries(panel);
  });
});
