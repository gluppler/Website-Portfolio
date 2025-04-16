// Section contents
const sections = {
  about: `About Me:
I’m a hacker, coder, and terminal aesthetic enthusiast.`,
  contact: `Contact Info:
Email: you@example.com
GitHub: @yourhandle`,
  projects: `Projects:
- TerminalOS: A Linux-like fake OS in JavaScript
- RedTeamSim: Simulated CTF Red Team Labs`,
  help: `Available Shortcuts:
  Ctrl+A - About
  Ctrl+L - Contact
  Ctrl+E - Projects
  Ctrl+H - Help
  Ctrl+Q - Quit`,
  quit: `Exiting...`
};

const contentEl = document.getElementById('content');
const footerEl = document.getElementById('footer');

function setContent(text) {
  contentEl.textContent = text;
}

function setFooter(text) {
  footerEl.textContent = text;
}

// Keyboard shortcuts handler
document.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const key = e.key.toLowerCase();
  let section = null;
  switch (key) {
    case 'a': section = 'about'; break;
    case 'l': section = 'contact'; break;
    case 'e': section = 'projects'; break;
    case 'h': section = 'help'; break;
    case 'q': section = 'quit'; break;
  }
  if (section) {
    e.preventDefault();
    setContent(sections[section]);
    if (section === 'quit') {
      setFooter('⚡ Session ended');
    } else {
      setFooter(`⚡ Displaying: ${section}`);
    }
  }
});

// Initial state
document.addEventListener('DOMContentLoaded', () => {
  setContent('Press Ctrl+A, Ctrl+L, Ctrl+E, Ctrl+H, or Ctrl+Q');
});
