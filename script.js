// Matrix digital rain effect
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const letters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F0';
  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, i) => {
    const text = letters.charAt(Math.floor(Math.random() * letters.length));
    ctx.fillText(text, i * fontSize, y * fontSize);
    if (y * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  });
}
setInterval(drawMatrix, 33);

// Clone trail logic
function createGhostClone(original) {
  const clone = original.cloneNode(true);
  clone.classList.add('ghost');
  clone.style.pointerEvents = 'none';
  clone.style.opacity = '0.3';
  document.body.appendChild(clone);
  const rect = original.getBoundingClientRect();
  clone.style.position = 'absolute';
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;

  setTimeout(() => {
    clone.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    clone.style.transform = 'scale(1.1) rotate(10deg)';
    clone.style.opacity = '0';
  }, 10);

  setTimeout(() => clone.remove(), 800);
}

// Drag with trail effect
document.querySelectorAll('.window').forEach(win => {
  const header = win.querySelector('.window-header');
  header.addEventListener('mousedown', startDrag);

  function startDrag(e) {
    let startX = e.clientX;
    let startY = e.clientY;
    const rect = win.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    function onMouseMove(e) {
      win.style.left = `${e.clientX - offsetX}px`;
      win.style.top = `${e.clientY - offsetY}px`;

      // Create a ghost clone every few frames
      if (Math.random() < 0.25) {
        createGhostClone(win);
      }
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
});
