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
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'vintage':
            ctx.fillStyle = '#f4f1e8';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add vintage texture
            ctx.fillStyle = 'rgba(139, 69, 19, 0.1)';
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.fillRect(x, y, 2, 2);
            }
            break;

        case 'party':
            // Gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#ff6b9d');
            gradient.addColorStop(0.5, '#c44569');
            gradient.addColorStop(1, '#f8b500');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'summer':
            const summerGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            summerGradient.addColorStop(0, '#87CEEB');
            summerGradient.addColorStop(1, '#F0E68C');
            ctx.fillStyle = summerGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'hearts':
            ctx.fillStyle = '#ffe0e6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add heart pattern
            ctx.fillStyle = 'rgba(255, 182, 193, 0.3)';
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.font = '20px Arial';
                ctx.fillText('💕', x, y);
            }
            break;

        case 'space':
            ctx.fillStyle = '#0f0f23';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add stars
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            break;

        case 'neon':
            ctx.fillStyle = '#000510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add neon glow effect
            const neonGradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
            neonGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
            neonGradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.2)');
            neonGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = neonGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'autumn':
            const autumnGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            autumnGradient.addColorStop(0, '#ff7f50');
            autumnGradient.addColorStop(0.5, '#daa520');
            autumnGradient.addColorStop(1, '#8b4513');
            ctx.fillStyle = autumnGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add autumn leaves
            ctx.font = '16px Arial';
            const leaves = ['🍂', '🍁', '🌿'];
            for (let i = 0; i < 15; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const leaf = leaves[Math.floor(Math.random() * leaves.length)];
                ctx.fillText(leaf, x, y);
            }
            break;

        case 'winter':
            const winterGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            winterGradient.addColorStop(0, '#e6f3ff');
            winterGradient.addColorStop(1, '#b8d4f0');
            ctx.fillStyle = winterGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add snowflakes
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.font = '12px Arial';
                ctx.fillText('❄', x, y);
            }
            break;

        case 'spring':
            const springGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            springGradient.addColorStop(0, '#e8f5e8');
            springGradient.addColorStop(0.5, '#ffc0cb');
            springGradient.addColorStop(1, '#98fb98');
            ctx.fillStyle = springGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add cherry blossoms
            ctx.font = '14px Arial';
            const blossoms = ['🌸', '🌼', '🌻'];
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const blossom = blossoms[Math.floor(Math.random() * blossoms.length)];
                ctx.fillText(blossom, x, y);
            }
            break;

        case 'ocean':
            const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            oceanGradient.addColorStop(0, '#87ceeb');
            oceanGradient.addColorStop(0.5, '#4682b4');
            oceanGradient.addColorStop(1, '#191970');
            ctx.fillStyle = oceanGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add wave effects
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(0, canvas.height * 0.2 + i * 40);
                for (let x = 0; x < canvas.width; x += 20) {
                    ctx.quadraticCurveTo(x + 10, canvas.height * 0.2 + i * 40 - 10, x + 20, canvas.height * 0.2 + i * 40);
                }
                ctx.stroke();
            }
            break;

        case 'sunset':
            const sunsetGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            sunsetGradient.addColorStop(0, '#ff7f50');
            sunsetGradient.addColorStop(0.3, '#ffa500');
            sunsetGradient.addColorStop(0.7, '#ff69b4');
            sunsetGradient.addColorStop(1, '#4b0082');
            ctx.fillStyle = sunsetGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add sun
            ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 30, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'forest':
            const forestGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            forestGradient.addColorStop(0, '#90ee90');
            forestGradient.addColorStop(0.5, '#228b22');
            forestGradient.addColorStop(1, '#006400');
            ctx.fillStyle = forestGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add trees
            ctx.font = '18px Arial';
            const trees = ['🌲', '🌳', '🌿'];
            for (let i = 0; i < 12; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const tree = trees[Math.floor(Math.random() * trees.length)];
                ctx.fillText(tree, x, y);
            }
            break;

        case 'midnight':
            const midnightGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            midnightGradient.addColorStop(0, '#191970');
            midnightGradient.addColorStop(0.5, '#000080');
            midnightGradient.addColorStop(1, '#000000');
            ctx.fillStyle = midnightGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add moon and stars
            ctx.fillStyle = '#f0f8ff';
            ctx.beginPath();
            ctx.arc(canvas.width * 0.8, canvas.height * 0.15, 25, 0, Math.PI * 2);
            ctx.fill();
            // Add stars
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height * 0.5;
                ctx.font = '10px Arial';
                ctx.fillText('✨', x, y);
            }
            break;

        case 'rainbow':
            const rainbowGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            rainbowGradient.addColorStop(0, '#ff0000');
            rainbowGradient.addColorStop(0.17, '#ff8000');
            rainbowGradient.addColorStop(0.33, '#ffff00');
            rainbowGradient.addColorStop(0.5, '#00ff00');
            rainbowGradient.addColorStop(0.67, '#0000ff');
            rainbowGradient.addColorStop(0.83, '#8000ff');
            rainbowGradient.addColorStop(1, '#ff00ff');
            ctx.fillStyle = rainbowGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            break;

        case 'minimalist':
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add subtle grid lines
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 50) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 50) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            break;

        case 'pastel':
            const pastelGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            pastelGradient.addColorStop(0, '#ffeaa7');
            pastelGradient.addColorStop(0.25, '#fab1a0');
            pastelGradient.addColorStop(0.5, '#fd79a8');
            pastelGradient.addColorStop(0.75, '#e17055');
            pastelGradient.addColorStop(1, '#fdcb6e');
            ctx.fillStyle = pastelGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Add soft clouds
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            for (let i = 0; i < 8; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 20 + Math.random() * 20, 0, Math.PI * 2);
                ctx.fill();
            }
            break;

        case 'gradient':
            const customGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            customGradient.addColorStop(0, '#667eea');
            customGradient.addColorStop(0.5, '#764ba2');
            customGradient.addColorStop(1, '#f093fb');
            ctx.fillStyle = customGradient;
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
        case 'forest':
        case 'ocean':
            return '#ffffff';
        case 'party':
        case 'sunset':
        case 'rainbow':
        case 'gradient':
            return '#ffffff';
        case 'autumn':
            return '#ffffff';
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
