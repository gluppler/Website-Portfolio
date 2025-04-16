// Matrix Background
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
let trails = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const cols = Math.floor(canvas.width / 15);
const drops = Array(cols).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#0f0';
  ctx.font = '15px Terminal';
  
  drops.forEach((y,i) => {
    const char = chars[Math.floor(Math.random()*chars.length)];
    ctx.fillText(char, i*15, y*15);
    drops[i] = y > canvas.height/15 ? 0 : y+1;
  });
  requestAnimationFrame(drawMatrix);
}
drawMatrix();

// Panel Trail Effect
function createTrail(panel) {
  const clone = panel.cloneNode(true);
  clone.classList.add('trailing');
  document.body.appendChild(clone);
  
  setTimeout(() => {
    clone.remove();
  }, 200);
}

// Draggable Panels with Trail
function makeDraggable(panel) {
  let isDragging = false;
  let offsetX, offsetY;
  
  panel.querySelector('.header').addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    
    // Create initial trail
    createTrail(panel);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    // Update position
    panel.style.left = `${e.clientX - offsetX}px`;
    panel.style.top = `${e.clientY - offsetY}px`;
    
    // Create trail effect
    if (Date.now() % 5 === 0) createTrail(panel);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    panel.style.transform = 'none';
  });
}

// Toggle Visibility
function togglePanel(id) {
  const panel = document.getElementById(id);
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Make panels draggable
  document.querySelectorAll('.window:not(#fact)').forEach(makeDraggable);
  
  // Randomize positions
  document.querySelectorAll('.window:not(#fact)').forEach(panel => {
    panel.style.left = Math.random() * (window.innerWidth - 300) + 'px';
    panel.style.top = Math.random() * (window.innerHeight - 200) + 'px';
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
        case 'c': togglePanel('contact'); break;
        case 's': togglePanel('socials'); break;
        case 'k': togglePanel('skills'); break;
      }
    }
  });
});
