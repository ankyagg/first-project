// Edit page functionality
let photoStripData = null;
let capturedPhotos = [];
let currentTheme = 'classic';
let decorations = [];

window.addEventListener('DOMContentLoaded', function() {
    loadPhotoStripData();
    drawPhotoStrip();
});

function loadPhotoStripData() {

    const urlParams = new URLSearchParams(window.location.search);
    const photosParam = urlParams.get('photos');

    if (photosParam) {
        try {
            capturedPhotos = JSON.parse(decodeURIComponent(photosParam));
            console.log('Loaded photos from URL:', capturedPhotos.length);
        } catch (e) {
            console.error('Error parsing photos from URL:', e);
        }
    }


    if (capturedPhotos.length === 0) {
        const storedPhotos = localStorage.getItem('capturedPhotos');
        if (storedPhotos) {
            try {
                capturedPhotos = JSON.parse(storedPhotos);
                console.log('Loaded photos from localStorage:', capturedPhotos.length);
            } catch (e) {
                console.error('Error parsing photos from localStorage:', e);
            }
        }
    }


    if (capturedPhotos.length === 0) {
        alert('No photos found! Please go back and capture some photos first.');
        goBackToCapture();
        return;
    }

    console.log('Photos loaded for editing:', capturedPhotos);
}
function addImageSticker(src) {
  const frame = document.getElementById('frameContainer');
  const sticker = document.createElement('img');
  sticker.src = src;
  sticker.classList.add('draggable-sticker');

  // Initial position
  sticker.style.top = '50px';
  sticker.style.left = '50px';

  frame.appendChild(sticker);

  makeDraggable(sticker);
}

function makeDraggable(element) {
  let startX, startY, origX, origY;

  const container = element.offsetParent; // make sure container is relative

  function onMouseMove(e) {
    const x = e.clientX - startX + origX;
    const y = e.clientY - startY + origY;
    element.style.left = x + 'px';
    element.style.top = y + 'px';
  }

  function onTouchMove(e) {
    const touch = e.touches[0];
    const x = touch.clientX - startX + origX;
    const y = touch.clientY - startY + origY;
    element.style.left = x + 'px';
    element.style.top = y + 'px';
  }

  function onEnd() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onEnd);
  }

  element.addEventListener('mousedown', function (e) {
    e.preventDefault();
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    startX = e.clientX;
    startY = e.clientY;
    origX = rect.left - containerRect.left;
    origY = rect.top - containerRect.top;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onEnd);
  });

  element.addEventListener('touchstart', function (e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    startX = touch.clientX;
    startY = touch.clientY;
    origX = rect.left - containerRect.left;
    origY = rect.top - containerRect.top;

    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onEnd);
  });
}

function drawPhotoStrip() {
    const canvas = document.getElementById('photoStripCanvas');
    const ctx = canvas.getContext('2d');


    const photoCount = capturedPhotos.length;
    const photoWidth = 280;
    const photoHeight = 200;
    const spacing = 20;
    const padding = 40;

    canvas.width = 400;
    canvas.height = padding + (photoHeight * photoCount) + (spacing * (photoCount - 1)) + padding;

    applyThemeBackground(ctx);

    let loadedCount = 0;
    capturedPhotos.forEach((photoUri, index) => {
        const img = new Image();
        img.onload = function() {
            const startX = (canvas.width - photoWidth) / 2;
            const startY = padding;
            const photoY = startY + (index * (photoHeight + spacing));

            // Draw photo frame
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(startX - 5, photoY - 5, photoWidth + 10, photoHeight + 10);
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            ctx.strokeRect(startX - 5, photoY - 5, photoWidth + 10, photoHeight + 10);


            ctx.drawImage(img, startX, photoY, photoWidth, photoHeight);

            loadedCount++;
            if (loadedCount === capturedPhotos.length) {

                drawDecorations();
            }
        };
        img.src = photoUri;
    });


    ctx.fillStyle = getThemeTextColor();
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('photobooth', canvas.width / 2, 25);
}

function applyThemeBackground(ctx) {
    const canvas = ctx.canvas;

    switch (currentTheme) {
        case 'classic':
            ctx.fillStyle = '#e6e6e6ff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'vintage':
            ctx.fillStyle = '#f4f1e8';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(139, 69, 19, 0.1)';
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.fillRect(x, y, 2, 2);
            }
            break;

        // ... all your other themes here ...

        case 'filmstrip':
            ctx.fillStyle = '#000000';  // black background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw perforations
            ctx.fillStyle = '#444444';
            const holeWidth = 15;
            const holeHeight = 25;
            const spacing = 40;
            for (let y = 20; y < canvas.height; y += spacing) {
                ctx.fillRect(5, y, holeWidth, holeHeight); // left
                ctx.fillRect(canvas.width - holeWidth - 5, y, holeWidth, holeHeight); // right
            }
            break;
                case 'summer':
            ctx.fillStyle = '#e3d584ff'; // warm sandy yellow
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#c8dd3cff'; // coral waves
            for (let i = 0; i < 10; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 20, 0, Math.PI * 2);
                ctx.fill();
            }
            break;


        case 'space':
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 100; i++) {
                ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
            }
            ctx.fillStyle = '#ffff99';
            ctx.fillText('🌟', canvas.width / 2, 50);
            break;

        case 'neon':
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const neonGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            neonGradient.addColorStop(0, '#c05dc0ff');
            neonGradient.addColorStop(1, '#7745a6ff');
            ctx.fillStyle = neonGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.fillText('💫', canvas.width / 2, 40);
            break;

        case 'autumn':
            ctx.fillStyle = '#f4a460';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#8b4513';
            for (let i = 0; i < 20; i++) {
                ctx.fillText('🍂', Math.random() * canvas.width, Math.random() * canvas.height);
            }
            break;

        case 'winter':
            ctx.fillStyle = '#e0f7fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 40; i++) {
                ctx.fillText('❄️', Math.random() * canvas.width, Math.random() * canvas.height);
            }
            break;

        case 'spring':
            ctx.fillStyle = '#ccffcc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 20; i++) {
                ctx.fillText('🌸', Math.random() * canvas.width, Math.random() * canvas.height);
            }
            break;
            // Dark Theme 1: Galactic Stars
case 'galactic':
    ctx.fillStyle = '#0b0c10'; // very dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 1; // small stars
        const alpha = Math.random() * 0.8 + 0.2; // varying brightness
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Optional: add a glowing moon
    ctx.fillStyle = 'rgba(255,255,200,0.3)';
    ctx.beginPath();
    ctx.arc(canvas.width - 80, 80, 50, 0, Math.PI * 2);
    ctx.fill();
    break;

// Dark Theme 2: Neon Grid
case 'neonGrid':
    ctx.fillStyle = '#111111'; // pitch black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw neon grid
    const gridSpacing = 50;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)'; // cyan neon lines
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)'; // pink neon lines
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Optional: glow in center
    const neonGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 100);
    neonGrad.addColorStop(0, 'rgba(0,255,255,0.4)');
    neonGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = neonGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    break;

        case 'ocean':
            ctx.fillStyle = '#1e90ff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ced1';
            for (let i = 0; i < 15; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 30, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.fillText('🌊', canvas.width / 2, 40);
            break;

        case 'sunset':
            const sunsetGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            sunsetGrad.addColorStop(0, '#ff7e5f');
            sunsetGrad.addColorStop(1, '#feb47b');
            ctx.fillStyle = sunsetGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillText('🌅', canvas.width / 2, 40);
            break;

        case 'forest':
            ctx.fillStyle = '#228B22';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 15; i++) {
                ctx.fillText('🌲', Math.random() * canvas.width, Math.random() * canvas.height);
            }
            break;

        case 'midnight':
            ctx.fillStyle = '#191970';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fffacd';
            ctx.fillText('🌙', canvas.width / 2, 40);
            break;

        case 'rainbow':
            const rainbowGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
            rainbowGrad.addColorStop(0, 'red');
            rainbowGrad.addColorStop(0.17, 'orange');
            rainbowGrad.addColorStop(0.34, 'yellow');
            rainbowGrad.addColorStop(0.51, 'green');
            rainbowGrad.addColorStop(0.68, 'blue');
            rainbowGrad.addColorStop(0.85, 'indigo');
            rainbowGrad.addColorStop(1, 'violet');
            ctx.fillStyle = rainbowGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillText('🌈', canvas.width / 2, 40);
            break;
        case 'love':
    // Gradient background
    const loveGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    loveGrad.addColorStop(0, '#ffafbd'); // light pink
    loveGrad.addColorStop(1, '#ffc3a0'); // peachy pink
    ctx.fillStyle = loveGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw floating hearts
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 30 + 20; // 20-50px
        const angle = Math.random() * Math.PI * 2;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Draw heart emoji with slight transparency for depth
        ctx.font = `${size}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 0, 0, ${Math.random() * 0.5 + 0.5})`; // semi-transparent
        ctx.fillText('❤️', 0, 0);

        ctx.restore();
    }

    // Optional: Add a subtle “photobooth” text on top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('photobooth', canvas.width / 2, 30);

    break;

        case 'minimalist':
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
            ctx.fillText('⚪', canvas.width / 2, 40);
            break;

        case 'pastel':
            const pastelGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            pastelGrad.addColorStop(0, '#ffd1dc');
            pastelGrad.addColorStop(1, '#c1e1c1');
            ctx.fillStyle = pastelGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillText('🎨', canvas.width / 2, 40);
            break;

        case 'gradient':
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#8e2de2');
            grad.addColorStop(1, '#4a00e0');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillText('🔮', canvas.width / 2, 40);
            break;

        case 'plainMaroon':
            ctx.fillStyle = '#800000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'plainRed':
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'plainPink':
            ctx.fillStyle = '#ffc0cb';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'plainBlue':
            ctx.fillStyle = '#090935ff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'plainBlack':
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;
        case 'Matcha':
            ctx.fillStyle = '#1d3110ff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;


        default:
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function getThemeTextColor() {
    switch (currentTheme) {
        case 'space':
        case 'neon':
        case 'midnight':
        case 'love':
        case 'forest':
        case 'ocean':
        case 'filmstrip':
        case 'plainBlack':
        case 'plainMaroon':
        case 'plainBlue':
            return '#ffffff'; // light text on dark
        case 'party':
        case 'sunset':
        case 'rainbow':
        case 'gradient':
        case 'autumn':
            return '#ffffff';
        case 'plainRed':
        case 'plainPink':
            return '#000000'; // dark text on light
        default:
            return '#333333';
    }
}


function drawDecorations() {
    const canvas = document.getElementById('photoStripCanvas');
    const ctx = canvas.getContext('2d');

    decorations.forEach(decoration => {
        if (decoration.type === 'sticker') {
            ctx.font = '30px Arial';
            ctx.fillText(decoration.emoji, decoration.x, decoration.y);
        } else if (decoration.type === 'text') {
            ctx.fillStyle = decoration.color || '#333333';
            ctx.font = decoration.font || 'bold 24px Arial';
            ctx.fillText(decoration.text, decoration.x, decoration.y);
        }
    });
}

function applyTheme(themeName) {
    currentTheme = themeName;
    console.log('Applying theme:', themeName);

    // Update theme cards to show selection
    document.querySelectorAll('.theme-card').forEach(card => {
        card.style.borderColor = 'transparent';
    });
    event.target.closest('.theme-card').style.borderColor = 'rgba(255, 255, 255, 0.8)';

    // Redraw canvas with new theme
    drawPhotoStrip();
}

function addSticker(emoji) {
    const canvas = document.getElementById('photoStripCanvas');

    // Add sticker at random position
    const decoration = {
        type: 'sticker',
        emoji: emoji,
        x: Math.random() * (canvas.width - 50) + 25,
        y: Math.random() * (canvas.height - 100) + 50
    };

    decorations.push(decoration);
    drawDecorations();
}

function addCustomText() {
    const text = prompt('Enter your custom text:');
    if (!text) return;

    const canvas = document.getElementById('photoStripCanvas');

    const decoration = {
        type: 'text',
        text: text,
        x: canvas.width / 2,
        y: canvas.height - 30,
        font: 'bold 20px Arial',
        color: getThemeTextColor()
    };

    decorations.push(decoration);
    drawDecorations();
}

function clearDecorations() {
  if (confirm('Remove all stickers and text?')) {
    // Remove all draggable sticker elements
    const frame = document.getElementById('frameContainer');
    const stickers = frame.querySelectorAll('.draggable-sticker');
    stickers.forEach(sticker => sticker.remove());

    // Clear canvas-based decorations if used
    const canvas = document.getElementById('photoStripCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw base photo strip if needed
    drawPhotoStrip();

    // Clear internal decoration tracking array if used
    if (typeof decorations !== 'undefined') {
      decorations = [];
    }
  }
}

async function downloadFinalStrip() {
    const canvas = document.getElementById('photoStripCanvas');
    const ctx = canvas.getContext('2d');

    const frame = document.getElementById('frameContainer');
    const stickers = frame.querySelectorAll('.draggable-sticker');

    // Get canvas and frame container positions for coordinate calculation
    const canvasRect = canvas.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    // Calculate scale factors between displayed canvas and actual canvas dimensions
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    const promises = Array.from(stickers).map(sticker => new Promise(resolve => {
        const img = new Image();
        img.src = sticker.src;
        img.onload = () => {
            const stickerRect = sticker.getBoundingClientRect();

            // Calculate position relative to frameContainer first
            const frameRelativeX = stickerRect.left - frameRect.left;
            const frameRelativeY = stickerRect.top - frameRect.top;

            // Then calculate relative to canvas within the frame
            const canvasOffsetX = canvasRect.left - frameRect.left;
            const canvasOffsetY = canvasRect.top - frameRect.top;

            const canvasRelativeX = frameRelativeX - canvasOffsetX;
            const canvasRelativeY = frameRelativeY - canvasOffsetY;

            // Scale coordinates to match actual canvas dimensions
            const x = canvasRelativeX * scaleX;
            const y = canvasRelativeY * scaleY;
            const width = sticker.width * scaleX;
            const height = sticker.height * scaleY;

            ctx.drawImage(img, x, y, width, height);
            resolve();
        };
    }));

    await Promise.all(promises);

    const editedStripData = canvas.toDataURL('image/png');
    localStorage.setItem('editedPhotoStrip', editedStripData);

    const link = document.createElement('a');
    link.download = 'final-photo-strip.png';
    link.href = editedStripData;
    link.click();

    setTimeout(() => {
        window.location.href = '../templates/printer-new.html';
    }, 500);
}



function goBackToCapture() {
    // Clear stored data
    localStorage.removeItem('capturedPhotos');

    // Navigate back to capture page
    window.location.href = '../templates/capture.html';
}
