// Matrix Animation
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
let cols, drops;
let animationFrame;
const FOOTER_MARGIN = 40;
let footerHeight = 0;

// Panel Management
let isDragging = false;
let currentPanel = null;
let offsetX, offsetY;

function calculateFooterHeight() {
  const footer = document.querySelector('.footer');
  footerHeight = footer ? footer.offsetHeight + FOOTER_MARGIN : FOOTER_MARGIN;
}

function enforceBoundaries(panel) {
  const rect = panel.getBoundingClientRect();
  const maxTop = window.innerHeight - rect.height - footerHeight;
  const maxLeft = window.innerWidth - rect.width;

  let top = parseInt(panel.style.top) || 0;
  let left = parseInt(panel.style.left) || 0;

  top = Math.min(Math.max(top, 20), maxTop);
  left = Math.min(Math.max(left, 20), maxLeft);

  panel.style.top = `${top}px`;
  panel.style.left = `${left}px`;
}

// Initialize Canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / 16);
  drops = Array(cols).fill(1);
}

// Matrix Animation
const katakana = "アァイィウヴエェオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

function drawMatrix() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  ctx.fillStyle = isMobile ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#0f0';
  ctx.font = '16px monospace';

  drops.forEach((y,i) => {
    const char = katakana[Math.floor(Math.random()*katakana.length)];
    ctx.fillText(char, i*16, y*16);
    drops[i] = (y*16 > canvas.height && Math.random()>0.975) ? 0 : y+1;
  });

  animationFrame = requestAnimationFrame(drawMatrix);
}

// Panel Dragging
function createTrail(panel) {
  const clone = panel.cloneNode(true);
  clone.classList.add('trailing');
  document.body.appendChild(clone);
  setTimeout(() => clone.remove(), 200);
}

function makeDraggable(panel) {
  const startDrag = (clientX, clientY) => {
    isDragging = true;
    currentPanel = panel;
    offsetX = clientX - panel.offsetLeft;
    offsetY = clientY - panel.offsetTop;
    createTrail(panel);
  };

  // Mouse Events
  panel.querySelector('.header').addEventListener('mousedown', (e) => {
    startDrag(e.clientX, e.clientY);
  });

  // Touch Events
  panel.querySelector('.header').addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  });

  const moveHandler = (clientX, clientY) => {
    if (!isDragging || !currentPanel) return;
    
    let newTop = clientY - offsetY;
    let newLeft = clientX - offsetX;
    
    const maxTop = window.innerHeight - currentPanel.offsetHeight - footerHeight;
    const maxLeft = window.innerWidth - currentPanel.offsetWidth;

    newTop = Math.min(Math.max(newTop, 20), maxTop);
    newLeft = Math.min(Math.max(newLeft, 20), maxLeft);

    currentPanel.style.top = `${newTop}px`;
    currentPanel.style.left = `${newLeft}px`;
    
    if (Date.now() % 5 === 0) createTrail(currentPanel);
  };

  document.addEventListener('mousemove', (e) => moveHandler(e.clientX, e.clientY));
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    moveHandler(e.touches[0].clientX, e.touches[0].clientY);
  });

  const stopDrag = () => {
    isDragging = false;
    currentPanel = null;
  };

  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  calculateFooterHeight();

  // Initialize Panels
  document.querySelectorAll('.window:not(#fact)').forEach(panel => {
    makeDraggable(panel);
    panel.style.left = Math.random() * (window.innerWidth - 300 - 40) + 20 + 'px';
    panel.style.top = Math.random() * (window.innerHeight - 200 - footerHeight - 40) + 20 + 'px';
    new ResizeObserver(() => enforceBoundaries(panel)).observe(panel);
  });

  // Position Fact Panel
  const factPanel = document.getElementById('fact');
  factPanel.style.position = 'fixed';
  factPanel.style.left = '50%';
  factPanel.style.transform = 'translateX(-50%)';
  factPanel.style.top = '20px';

  // Fetch Fact
  fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    .then(response => response.json())
    .then(data => {
      document.getElementById('fact-text').textContent = data.text;
    })
    .catch(() => {
      document.getElementById('fact-text').textContent = 'Error loading fact';
    });

  // Start Animation
  const startAnimation = () => {
    if (!animationFrame) drawMatrix();
    document.body.removeEventListener('touchstart', startAnimation);
    document.body.removeEventListener('mousedown', startAnimation);
  };
  document.body.addEventListener('touchstart', startAnimation, { once: true });
  document.body.addEventListener('mousedown', startAnimation, { once: true });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      switch(e.key.toLowerCase()) {
        case 'h': togglePanel('help'); break;
        case 'c': togglePanel('contact'); break;
        case 'w': togglePanel('whoami'); break;
        case 't': togglePanel('tools'); break;
        case 'p': togglePanel('projects'); break;
      }
    }
  });
});

// Toggle Panels
function togglePanel(id) {
  const panel = document.getElementById(id);
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'block';
    enforceBoundaries(panel);
    document.querySelectorAll('.window').forEach(w => w.style.zIndex = 0);
    panel.style.zIndex = 1000;
  } else {
    panel.style.display = 'none';
  }
}

// Window Resize Handler
window.addEventListener('resize', () => {
  resizeCanvas();
  calculateFooterHeight();
  document.querySelectorAll('.window:not(#fact)').forEach(enforceBoundaries);
});
