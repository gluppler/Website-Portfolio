// Matrix background animation
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const katakana = "アァイィウヴエェオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const columns = Math.floor(canvas.width / 16);
const drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f0';
  ctx.font = '16px monospace';

  for (let i = 0; i < drops.length; i++) {
    const char = katakana[Math.floor(Math.random() * katakana.length)];
    ctx.fillText(char, i * 16, drops[i] * 16);

    if (drops[i] * 16 > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
  requestAnimationFrame(drawMatrix);
}

// Drag-and-drop windows + ghost clone
const windows = document.querySelectorAll('.window');

windows.forEach(win => {
  let offsetX, offsetY, isDragging = false;
  const header = win.querySelector('.header');

  header.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    const clone = win.cloneNode(true);
    clone.classList.add('ghost');
    clone.style.opacity = '0.2';
    document.body.appendChild(clone);
    win.cloneElement = clone;
  });

  document.addEventListener('mousemove', e => {
    if (isDragging) {
      win.style.left = `${e.clientX - offsetX}px`;
      win.style.top = `${e.clientY - offsetY}px`;

      const trail = win.cloneElement.cloneNode(true);
      trail.style.position = 'absolute';
      trail.style.left = win.style.left;
      trail.style.top = win.style.top;
      trail.style.opacity = '0.1';
      trail.style.pointerEvents = 'none';
      trail.style.zIndex = '0';
      trail.classList.add('trail');
      document.body.appendChild(trail);

      setTimeout(() => trail.remove(), 1000);
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    if (win.cloneElement) win.cloneElement.remove();
  });
});

// Keyboard Shortcuts
window.addEventListener('keydown', e => {
  const key = e.ctrlKey && e.key.toLowerCase();
  if (key === 'a') toggle('about');
  if (key === 'e') toggle('projects');
  if (key === 'l') toggle('contact');
  if (key === 'h') toggle('help');
});

function toggle(id) {
  const win = document.getElementById(id);
  win.style.display = win.style.display === 'none' ? 'block' : 'none';
}

// Resize fix
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Start matrix animation
drawMatrix();

// Fetch and display Fact of the Day
document.addEventListener('DOMContentLoaded', () => {
  fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    .then(response => response.json())
    .then(data => {
      const factElement = document.getElementById('fact-text');
      if (factElement) {
        factElement.textContent = data.text;
      }
    })
    .catch(error => {
      console.error('Error fetching fact:', error);
    });
  
  // Touch Events
  header.addEventListener('touchstart', e => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - win.offsetLeft;
    offsetY = touch.clientY - win.offsetTop;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (isDragging) {
      const touch = e.touches[0];
      win.style.left = `${touch.clientX - offsetX}px`;
      win.style.top = `${touch.clientY - offsetY}px`;
    }
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });
});

