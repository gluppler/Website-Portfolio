// Matrix background animation
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const katakana = "アァイィウヴエェオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const cols = Math.floor(canvas.width / 16);
const drops = Array(cols).fill(1);

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#0f0'; ctx.font = '16px monospace';
  drops.forEach((y,i)=>{
    const char = katakana[Math.floor(Math.random()*katakana.length)];
    ctx.fillText(char, i*16, y*16);
    drops[i] = (y*16>canvas.height && Math.random()>0.975)?0:y+1;
  });
  requestAnimationFrame(drawMatrix);
}

drawMatrix();

// Random placement for all windows except #fact
function randomizePositions() {
  document.querySelectorAll('.window:not(#fact)').forEach(win=>{
    const maxX = window.innerWidth - win.offsetWidth - 20;
    const maxY = window.innerHeight - win.offsetHeight - 20;
    win.style.left = Math.random()*maxX + 'px';
    win.style.top  = Math.random()*maxY + 'px';
  });
}

// Drag & touch support for non-fact windows
function makeDraggable(win) {
  const header = win.querySelector('.header');
  let offsetX, offsetY, dragging=false;

  const start = (x,y)=>{
    dragging=true;
    offsetX = x - win.offsetLeft;
    offsetY = y - win.offsetTop;
  };
  const move = (x,y)=>{
    if(dragging) {
      win.style.left = x - offsetX + 'px';
      win.style.top  = y - offsetY + 'px';
    }
  };
  const end = ()=>{ dragging=false; };

  header.addEventListener('mousedown', e=>{ start(e.clientX,e.clientY); e.preventDefault(); });
  document.addEventListener('mousemove', e=>move(e.clientX,e.clientY));
  document.addEventListener('mouseup', end);

  header.addEventListener('touchstart', e=>{
    const t=e.touches[0]; start(t.clientX,t.clientY);
  },{passive:false});
  document.addEventListener('touchmove', e=>{
    const t=e.touches[0]; move(t.clientX,t.clientY);
    e.preventDefault();
  },{passive:false});
  document.addEventListener('touchend', end);
}

document.addEventListener('DOMContentLoaded', ()=>{
  // Randomize
  randomizePositions();
  // Make draggable
  document.querySelectorAll('.window:not(#fact)').forEach(makeDraggable);

  // Fetch Fact of the Day
  fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    .then(r=>r.json())
    .then(d=>{ document.getElementById('fact-text').textContent = d.text; })
    .catch(()=>{ document.getElementById('fact-text').textContent = 'Failed to load fact.'; });

  // Keyboard shortcuts
  window.addEventListener('keydown', e=>{
    if(e.ctrlKey) {
      const key=e.key.toLowerCase();
      if(key==='a') toggle('whoami');
      if(key==='e') toggle('ls');
      if(key==='l') toggle('contact');
      if(key==='h') toggle('help');
    }
  });

  function toggle(id) {
    const w=document.getElementById(id);
    w.style.display = w.style.display==='none'?'block':'none';
  }
});
