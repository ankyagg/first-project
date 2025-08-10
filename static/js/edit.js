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
  let offsetX, offsetY;

  element.onmousedown = function (e) {
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;

    document.onmousemove = function (e) {
      element.style.left = e.clientX - offsetX + 'px';
      element.style.top = e.clientY - offsetY + 'px';
    };

    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}


function drawPhotoStrip() {
    const canvas = document.getElementById('photoStripCanvas');
    const ctx = canvas.getContext('2d');


    const photoCount = capturedPhotos.length;
    const photoWidth = 320;
    const photoHeight = 120;
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

        default:
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function getThemeTextColor() {
    switch (currentTheme) {
        case 'space':
            return '#ffffff';
        case 'party':
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

function downloadFinalStrip() {
    const canvas = document.getElementById('photoStripCanvas');
    const ctx = canvas.getContext('2d');

    // First, draw all draggable stickers onto the canvas
    const frame = document.getElementById('frameContainer');
    const stickers = frame.querySelectorAll('.draggable-sticker');

    stickers.forEach(sticker => {
        const img = new Image();
        img.src = sticker.src;

        // Calculate position relative to canvas
        const canvasRect = canvas.getBoundingClientRect();
        const stickerRect = sticker.getBoundingClientRect();
        const x = stickerRect.left - canvasRect.left;
        const y = stickerRect.top - canvasRect.top;

        img.onload = () => {
            ctx.drawImage(img, x, y, sticker.width, sticker.height);
        };
    });

    // Wait briefly to ensure all stickers are drawn
    setTimeout(() => {
        const editedStripData = canvas.toDataURL('image/png');
        localStorage.setItem('editedPhotoStrip', editedStripData);

        const link = document.createElement('a');
        link.download = 'final-photo-strip.png';
        link.href = editedStripData;
        link.click();

        // Redirect to printer animation
        setTimeout(() => {
            window.location.href = '../templates/printer-new.html';
        }, 500);
    }, 300); // Adjust delay if needed
}


function goBackToCapture() {
    // Clear stored data
    localStorage.removeItem('capturedPhotos');

    // Navigate back to capture page
    window.location.href = '../templates/capture.html';
}
