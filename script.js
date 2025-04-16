// Matrix background animation
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
let cols, drops;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / 16);
  drops = Array(cols).fill(1);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const katakana = "アァイィウヴエェオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#0f0'; 
  ctx.font = '16px monospace';
  drops.forEach((y,i) => {
    const char = katakana[Math.floor(Math.random()*katakana.length)];
    ctx.fillText(char, i*16, y*16);
    drops[i] = (y*16 > canvas.height && Math.random()>0.975) ? 0 : y+1;
  });
  requestAnimationFrame(drawMatrix);
}
drawMatrix();

// Panel Trail Effect
function createTrail(panel) {
  const clone = panel.cloneNode(true);
  clone.classList.add('trailing');
  document.body.appendChild(clone);
  setTimeout(() => clone.remove(), 200);
}

// Draggable Panels
function makeDraggable(panel) {
  let isDragging = false;
  let offsetX, offsetY;
  
  panel.querySelector('.header').addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    createTrail(panel);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panel.style.left = `${e.clientX - offsetX}px`;
    panel.style.top = `${e.clientY - offsetY}px`;
    if (Date.now() % 5 === 0) createTrail(panel);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    panel.style.transform = 'none';
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Make all windows draggable
  document.querySelectorAll('.window').forEach(makeDraggable);

  // Randomize positions
  document.querySelectorAll('.window').forEach(panel => {
    if(panel.id !== 'fact') {
      panel.style.left = Math.random() * (window.innerWidth - 300) + 'px';
      panel.style.top = Math.random() * (window.innerHeight - 200) + 'px';
    }
  });

  // Fetch Fact
  fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    .then(response => response.json())
    .then(data => {
      document.getElementById('fact-text').textContent = data.text;
    })
    .catch(() => {
      document.getElementById('fact-text').textContent = 'Error loading fact - check your connection';
    });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      switch(e.key.toLowerCase()) {
        case 'w': togglePanel('whoami'); break;
        case 't': togglePanel('tools'); break;
        case 'p': togglePanel('projects'); break;
      }
    }
  });
});

// Toggle Visibility
function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}
