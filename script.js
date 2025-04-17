    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    let cols, drops;
    let animationFrameId; // Use ID for cancellation
    const FOOTER_MARGIN = 40; // Space above footer
    let footerHeight = 0;

    // Panel Management
    let isDragging = false;
    let currentPanel = null;
    let offsetX, offsetY;
    let zIndexCounter = 10; // To bring panels to front

    // --- Utility Functions ---
    function calculateFooterHeight() {
      const footer = document.querySelector('.footer');
      footerHeight = footer ? footer.offsetHeight + FOOTER_MARGIN : FOOTER_MARGIN;
    }

    function enforceBoundaries(panel) {
      // Only enforce if panel is displayed and not fixed (like fact panel maybe)
      if (!panel || panel.style.display === 'none' || panel.style.position === 'fixed') return;

      const rect = panel.getBoundingClientRect();
      // Ensure rect dimensions are valid (might be 0 if not fully rendered)
      const panelWidth = rect.width || parseInt(panel.style.width) || panel.offsetWidth;
      const panelHeight = rect.height || parseInt(panel.style.height) || panel.offsetHeight;

      if (panelWidth === 0 || panelHeight === 0) return; // Avoid division by zero or weird calcs

      const maxTop = window.innerHeight - panelHeight - footerHeight;
      const maxLeft = window.innerWidth - panelWidth;

      let top = parseInt(panel.style.top) || 0;
      let left = parseInt(panel.style.left) || 0;

      // Keep panel within viewport, considering footer space
      top = Math.min(Math.max(top, 10), Math.max(10, maxTop)); // Min top 10px
      left = Math.min(Math.max(left, 10), Math.max(10, maxLeft)); // Min left 10px

      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
    }

    // --- Matrix Animation ---
    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.floor(canvas.width / 16); // Font size approx 16px
        drops = Array(cols).fill(1).map(() => Math.random() * canvas.height); // Random start Y
    }

    const katakana = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const chars = katakana + latin + nums;

    function drawMatrix() {
        if (!ctx) return;
        // Slower fade on desktop, faster on mobile for performance
        const isMobile = window.innerWidth <= 768;
        ctx.fillStyle = isMobile ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0'; // Green text
        ctx.font = '16px monospace';

        drops.forEach((y, i) => {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * 16;
            ctx.fillText(text, x, y);

            // Reset drop randomly or if it goes off screen
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            } else {
                drops[i] = y + 16; // Move down by font size
            }
        });

        animationFrameId = requestAnimationFrame(drawMatrix); // Continue animation
    }

    // --- Panel Dragging & Interaction ---
    function createTrail(panel) {
        const clone = panel.cloneNode(true); // Deep clone
        clone.id = ''; // Remove ID from clone
        clone.classList.add('trailing');
        clone.style.zIndex = parseInt(panel.style.zIndex || 10) - 1; // Trail behind
        clone.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out'; // CSS transition
        document.body.appendChild(clone);
        // Remove after transition
        setTimeout(() => clone.remove(), 200);
    }

    function makeDraggable(panel) {
        const header = panel.querySelector('.header');
        if (!header) return; // No header, not draggable

        const startDrag = (clientX, clientY) => {
            isDragging = true;
            currentPanel = panel;
            offsetX = clientX - panel.offsetLeft;
            offsetY = clientY - panel.offsetTop;
            zIndexCounter++; // Increment z-index counter
            panel.style.zIndex = zIndexCounter; // Bring panel to front
            panel.style.cursor = 'grabbing';
            if (window.innerWidth > 768) createTrail(panel); // Trail effect on desktop only
        };

        header.addEventListener('mousedown', (e) => {
            // Prevent drag on resize handles if they exist
            if (e.target !== header) return;
            startDrag(e.clientX, e.clientY);
            e.preventDefault(); // Prevent text selection
        });

        header.addEventListener('touchstart', (e) => {
            if (e.target !== header) return;
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault(); // Prevent scrolling while dragging header
        }, { passive: false }); // Need false to preventDefault

        // Add listener to bring panel to front on any click inside it
        panel.addEventListener('mousedown', () => {
             if (panel !== currentPanel) { // Only if not currently dragging this panel
                zIndexCounter++;
                panel.style.zIndex = zIndexCounter;
             }
        });
         panel.addEventListener('touchstart', () => {
             if (panel !== currentPanel) {
                zIndexCounter++;
                panel.style.zIndex = zIndexCounter;
             }
        }, { passive: true });
    }

    // Global move and end listeners
    const moveHandler = (clientX, clientY) => {
        if (!isDragging || !currentPanel) return;

        let newTop = clientY - offsetY;
        let newLeft = clientX - offsetX;

        // Boundary checks (simplified, use enforceBoundaries on drop)
        const maxTop = window.innerHeight - currentPanel.offsetHeight - footerHeight;
        const maxLeft = window.innerWidth - currentPanel.offsetWidth;
        newTop = Math.min(Math.max(newTop, 10), Math.max(10, maxTop));
        newLeft = Math.min(Math.max(newLeft, 10), Math.max(10, maxLeft));

        currentPanel.style.top = `${newTop}px`;
        currentPanel.style.left = `${newLeft}px`;

        // Create trail less frequently for performance
        if (window.innerWidth > 768 && Math.random() < 0.2) createTrail(currentPanel);
    };

    const stopDrag = () => {
        if (isDragging && currentPanel) {
            enforceBoundaries(currentPanel); // Final boundary check
            currentPanel.style.cursor = 'move'; // Reset cursor
        }
        isDragging = false;
        currentPanel = null;
    };

    document.addEventListener('mousemove', (e) => moveHandler(e.clientX, e.clientY));
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            moveHandler(e.touches[0].clientX, e.touches[0].clientY);
            // e.preventDefault(); // Prevent page scroll ONLY when dragging
        }
    }, { passive: false }); // Need false to check isDragging

    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);


    // --- Panel Toggling ---
    let activeMobilePanelId = null; // Track currently shown mobile panel

    function togglePanel(id) {
        const panel = document.getElementById(id);
        if (!panel) return;

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Mobile: Only one panel visible at a time (except maybe 'fact')
            document.querySelectorAll('.window').forEach(win => {
                if (win.id !== id && win.id !== 'fact') { // Keep fact potentially visible
                    win.style.display = 'none';
                    win.classList.remove('active');
                }
            });

            if (panel.style.display === 'none' || !panel.classList.contains('active')) {
                panel.style.display = 'flex';
                panel.classList.add('active');
                activeMobilePanelId = id;
                // Bring to front (important for mobile overlay)
                zIndexCounter++;
                panel.style.zIndex = zIndexCounter;
            } else {
                panel.style.display = 'none';
                panel.classList.remove('active');
                activeMobilePanelId = null; // No panel is active
            }
        } else {
            // Desktop: Toggle visibility, bring to front if opening
            if (panel.style.display === 'none' || !panel.style.display) {
                panel.style.display = 'flex';
                enforceBoundaries(panel); // Position check
                zIndexCounter++;
                panel.style.zIndex = zIndexCounter; // Bring to front
            } else {
                panel.style.display = 'none';
            }
        }
    }

    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', () => {
        resizeCanvas();
        calculateFooterHeight();

        // Make panels draggable and position randomly (desktop)
        document.querySelectorAll('.window').forEach((panel, index) => {
             // Make all draggable
             makeDraggable(panel);
             // Set initial z-index
             panel.style.zIndex = 10 + index;
             zIndexCounter = 10 + index + 1; // Update counter

             // Random position only on desktop and not for 'fact' or 'help' initially
             if (window.innerWidth > 768 && panel.id !== 'fact' && panel.id !== 'help') {
                const maxTop = window.innerHeight - (parseInt(panel.style.height) || 200) - footerHeight;
                const maxLeft = window.innerWidth - (parseInt(panel.style.width) || 300);
                panel.style.top = `${Math.max(10, Math.random() * maxTop)}px`;
                panel.style.left = `${Math.max(10, Math.random() * maxLeft)}px`;
                panel.style.display = 'flex'; // Show panels on desktop
             } else if (panel.id !== 'fact' && panel.id !== 'help') {
                 panel.style.display = 'none'; // Hide other panels on mobile initially
             }

             // Add resize observer for boundary enforcement after resize
             new ResizeObserver(() => {
                 // Throttle enforcement slightly
                 setTimeout(() => enforceBoundaries(panel), 50);
             }).observe(panel);
        });

        // Special handling for 'fact' and 'help' panels
        const factPanel = document.getElementById('fact');
        if (factPanel) {
            factPanel.style.position = 'absolute'; // Let it be draggable too
            factPanel.style.left = 'calc(50% - 150px)'; // Center initially
            factPanel.style.top = '20px';
            factPanel.style.width = '300px'; // Fixed width
            factPanel.style.height = 'auto'; // Auto height
            factPanel.style.resize = 'none'; // Disable resize for fact
            factPanel.style.display = 'flex'; // Show fact panel
            makeDraggable(factPanel); // Make fact draggable
        }
        const helpPanel = document.getElementById('help');
        if (helpPanel) {
            if (window.innerWidth > 768) {
                 helpPanel.style.display = 'none'; // Hide help initially on desktop
                 // Position it somewhere reasonable if opened
                 helpPanel.style.top = '150px';
                 helpPanel.style.left = 'calc(50% - 150px)';
            } else {
                 helpPanel.style.display = 'flex'; // Show help by default on mobile
                 helpPanel.classList.add('active');
                 activeMobilePanelId = 'help';
                 helpPanel.style.zIndex = zIndexCounter++; // Ensure it's on top initially
            }
        }


        // Fetch Random Fact
        fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
            .then(response => response.ok ? response.json() : Promise.reject('API error'))
            .then(data => {
                if (factPanel) factPanel.querySelector('#fact-text').textContent = data.text;
            })
            .catch(error => {
                console.error("Fact API Error:", error);
                if (factPanel) factPanel.querySelector('#fact-text').textContent = 'Facts are stubborn things... but the API failed.';
            });

        // Start Matrix Animation (only once)
        if (!animationFrameId) {
           drawMatrix();
        }

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                let targetPanelId = null;
                switch(e.key.toLowerCase()) {
                    case 'h': targetPanelId = 'help'; break;
                    case 'c': targetPanelId = 'contact'; break;
                    case 'w': targetPanelId = 'whoami'; break;
                    case 't': targetPanelId = 'tools'; break;
                    case 'p': targetPanelId = 'projects'; break;
                }
                if (targetPanelId) {
                    e.preventDefault(); // Prevent browser default action (e.g., Ctrl+H history)
                    togglePanel(targetPanelId);
                }
            }
        });
    });

    // --- Window Resize Handler ---
    window.addEventListener('resize', () => {
        // Clear existing animation frame before resizing
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null; // Reset ID
        }
        resizeCanvas();
        calculateFooterHeight();
        // Re-draw matrix immediately after resize
        if (!animationFrameId) {
           drawMatrix();
        }
        // Re-enforce boundaries on all visible windows
        document.querySelectorAll('.window').forEach(panel => {
            if (panel.style.display !== 'none') {
                enforceBoundaries(panel);
            }
        });

        // Adjust mobile/desktop view
        const isMobile = window.innerWidth <= 768;
        document.querySelectorAll('.window').forEach(panel => {
            if (isMobile) {
                // If switching to mobile, hide all except the active one (or help)
                if (panel.id !== activeMobilePanelId && panel.id !== 'fact' && !(activeMobilePanelId === null && panel.id ==='help')) {
                     panel.style.display = 'none';
                     panel.classList.remove('active');
                } else if (panel.id === activeMobilePanelId || (activeMobilePanelId === null && panel.id ==='help')) {
                     panel.style.display = 'flex'; // Ensure active/help is visible
                     panel.classList.add('active');
                }
            } else {
                 // If switching to desktop, show all except help by default
                 if (panel.id !== 'help') {
                     panel.style.display = 'flex';
                 } else {
                     // Keep help hidden unless it was explicitly opened
                     panel.style.display = (panel.style.zIndex > 10 && panel.style.display !== 'none') ? 'flex' : 'none';
                 }
            }
        });

    });
