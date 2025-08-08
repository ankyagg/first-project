// Get elements
const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');

// Initialize webcam-easy
const webcam = new Webcam(webcamElement, canvasElement, { facingMode: "user" });

// Start webcam
webcam.start()
  .then(result => {
    console.log("Webcam started successfully");
    updateCaptureButton(); // Initialize button text
  })
  .catch(err => {
    console.error("Failed to start webcam:", err);
    alert("Could not access your webcam. Please check browser permissions.");
  });

// Apply filter function
function setFilter(filterValue) {
  if (filterValue === 'none') {
    webcamElement.style.filter = '';
  } else {
    webcamElement.style.filter = filterValue;
  }
}

function clickPic(){
  console.log("Capture button clicked!");
  
  // Capture the current filtered view
  captureCurrentView();
}

function captureCurrentView() {
  console.log("Capturing photo with CSS filters...");
  const captureCanvas = document.createElement('canvas');
  const ctx = captureCanvas.getContext('2d');
  
  // Set canvas size
  captureCanvas.width = webcamElement.videoWidth || 640;
  captureCanvas.height = webcamElement.videoHeight || 480;
  
  // Apply current CSS filter
  if (webcamElement.style.filter) {
    ctx.filter = webcamElement.style.filter;
    console.log("Applied filter:", webcamElement.style.filter);
  }
  
  // Draw webcam frame
  ctx.drawImage(webcamElement, 0, 0, captureCanvas.width, captureCanvas.height);
  
  // Convert to image
  const imageUri = captureCanvas.toDataURL('image/png');
  console.log("Photo captured successfully");
  addPhotoToGallery(imageUri);
}

// Gallery Management Functions
let capturedPhotos = [];
const MAX_PHOTOS = 3;

function addPhotoToGallery(imageUri) {
  console.log("Adding photo to gallery:", imageUri ? "URI received" : "No URI");
  
  if (capturedPhotos.length >= MAX_PHOTOS) {
    alert("Maximum 3 photos allowed! Creating your photo strip...");
    return;
  }
  
  capturedPhotos.push(imageUri);
  console.log("Total photos:", capturedPhotos.length);
  updateGalleryDisplay();
  
  // Check if we've reached the limit
  if (capturedPhotos.length === MAX_PHOTOS) {
    setTimeout(() => {
      // Store photos and redirect to edit page
      console.log('3 photos captured, redirecting to edit page');
      localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos));
      window.location.href = 'edit.html';
    }, 500);
  }
  
  // Update capture button
  updateCaptureButton();
}

function updateCaptureButton() {
  const captureBtn = document.getElementById('captureBtn');
  const captureText = document.getElementById('captureText');
  
  if (capturedPhotos.length >= MAX_PHOTOS) {
    captureBtn.disabled = true;
    captureBtn.style.opacity = '0.5';
    captureText.textContent = 'Creating Photo Strip...';
  } else {
    const remaining = MAX_PHOTOS - capturedPhotos.length;
    captureText.textContent = `Capture Photo (${remaining} left)`;
  }
}

function updateGalleryDisplay() {
  const galleryGrid = document.getElementById('galleryGrid');
  
  // Remove placeholder if it exists
  const placeholder = galleryGrid.querySelector('.gallery-placeholder');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Clear existing items
  galleryGrid.innerHTML = '';
  
  // Add photo counter
  const counter = document.createElement('div');
  counter.className = 'photo-counter';
  counter.textContent = `${capturedPhotos.length}/${MAX_PHOTOS} photos taken`;
  counter.style.cssText = `
    grid-column: 1 / -1;
    text-align: center;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    margin-bottom: 10px;
    color: white;
    font-weight: bold;
  `;
  galleryGrid.appendChild(counter);
  
  // Add all photos
  capturedPhotos.forEach((photoUri, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.onclick = () => viewPhoto(photoUri, index);
    
    const img = document.createElement('img');
    img.src = photoUri;
    img.alt = `Captured photo ${index + 1}`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '8px';
    
    galleryItem.appendChild(img);
    galleryGrid.appendChild(galleryItem);
  });
  
  // Show remaining slots
  for (let i = capturedPhotos.length; i < MAX_PHOTOS; i++) {
    const emptySlot = document.createElement('div');
    emptySlot.className = 'gallery-item empty-slot';
    emptySlot.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.5);">
        <div style="font-size: 30px; margin-bottom: 10px;">📷</div>
        <div>Photo ${i + 1}</div>
      </div>
    `;
    emptySlot.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      border: 2px dashed rgba(255, 255, 255, 0.3);
      border-radius: 8px;
    `;
    galleryGrid.appendChild(emptySlot);
  }
  
  // Show placeholder if no photos
  if (capturedPhotos.length === 0) {
    const placeholder = document.createElement('div');
    placeholder.className = 'gallery-placeholder';
    placeholder.innerHTML = `
      <div class="placeholder-icon">📷</div>
      <p>Take up to ${MAX_PHOTOS} photos to create your photo strip!</p>
    `;
    galleryGrid.appendChild(placeholder);
  }
}

function viewPhoto(photoUri, index) {
  // Create modal to view photo
  const modal = document.createElement('div');
  modal.className = 'photo-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(10px);
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    position: relative;
  `;
  
  const img = document.createElement('img');
  img.src = photoUri;
  img.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 12px;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: -40px;
    right: 0;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    backdrop-filter: blur(10px);
  `;
  
  const downloadBtn = document.createElement('button');
  downloadBtn.innerHTML = '⬇️ Download';
  downloadBtn.style.cssText = `
    position: absolute;
    bottom: -50px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #EC68A6, #F06292);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
  `;
  
  closeBtn.onclick = () => modal.remove();
  downloadBtn.onclick = () => downloadPhoto(photoUri, index);
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  modalContent.appendChild(img);
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(downloadBtn);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function downloadPhoto(photoUri, index) {
  const link = document.createElement('a');
  link.download = `photo-${index + 1}.png`;
  link.href = photoUri;
  link.click();
}

function finishSession() {
  if (capturedPhotos.length === 0) {
    alert('No photos captured yet! Take some photos first.');
    return;
  }
  
  console.log('Finishing session with', capturedPhotos.length, 'photos');
  
  // Store photos in localStorage for the edit page
  localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos));
  
  // Navigate to edit page
  window.location.href = 'edit.html';
}

function startVHSEffect() {
  // Apply VHS CSS filters
  webcamElement.style.filter = 'contrast(1.3) brightness(1.1) saturate(1.4) hue-rotate(2deg)';
  
  // Add scanlines
  addScanlines();
  
  // Add timestamp
  addTimestamp();
  

  drawVHS();
}

function stopVHSEffect() {
  // Stop animation
  if (vhsAnimationId) {
    cancelAnimationFrame(vhsAnimationId);
    vhsAnimationId = null;
  }
  
  // Clear video filters
  webcamElement.style.filter = '';
  webcamElement.style.mixBlendMode = 'normal';
  
  // Remove overlays
  removeScanlines();
  removeTimestamp();
  
  // Clear canvas
  const ctx = canvasElement.getContext('2d');
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasElement.style.display = 'none';
}

function addScanlines() {
  const scanlines = document.createElement('div');
  scanlines.className = 'vhs-scanlines';
  
  // Position exactly over the webcam
  scanlines.style.cssText = `
    position: absolute;
    top: ${webcamElement.offsetTop}px;
    left: ${webcamElement.offsetLeft}px;
    width: ${webcamElement.offsetWidth}px;
    height: ${webcamElement.offsetHeight}px;
    background-image: repeating-linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0.2) 1px,
      transparent 1px,
      transparent 2px
    );
    animation: vhs-flicker 0.1s infinite;
    pointer-events: none;
    z-index: 1001;
    mix-blend-mode: multiply;
    border-radius: 20px;
    overflow: hidden;
  `;
  
  webcamElement.parentElement.appendChild(scanlines);
  
  if (!document.querySelector('#vhs-styles')) {
    const style = document.createElement('style');
    style.id = 'vhs-styles';
    style.textContent = `
      @keyframes vhs-flicker {
        0% { opacity: 0.8; transform: translateY(0px); }
        25% { opacity: 0.9; transform: translateY(1px); }
        50% { opacity: 0.7; transform: translateY(-1px); }
        75% { opacity: 0.85; transform: translateY(0.5px); }
        100% { opacity: 0.8; transform: translateY(0px); }
      }
    `;
    document.head.appendChild(style);
  }
}

function removeScanlines() {
  const scanlines = document.querySelector('.vhs-scanlines');
  if (scanlines) scanlines.remove();
}

function addTimestamp() {
  const timestamp = document.createElement('div');
  timestamp.className = 'vhs-timestamp';
  
  // Position in top-right corner of webcam
  timestamp.style.cssText = `
    position: absolute;
    top: ${webcamElement.offsetTop + 15}px;
    left: ${webcamElement.offsetLeft + webcamElement.offsetWidth - 110}px;
    color: white;
    font-size: 14px;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 3px 8px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    z-index: 1002;
    border-radius: 2px;
  `;
  timestamp.textContent = Date();
  
  webcamElement.parentElement.appendChild(timestamp);
}

function removeTimestamp() {
  const timestamp = document.querySelector('.vhs-timestamp');
  if (timestamp) timestamp.remove();
}

function drawVHS() {
  if (!vhsActive) return;
  
  const ctx = canvasElement.getContext('2d');
  
  // Get webcam position and dimensions
  const webcamRect = webcamElement.getBoundingClientRect();
  const parentRect = webcamElement.parentElement.getBoundingClientRect();
  
  // Set canvas size to match webcam exactly
  canvasElement.width = webcamElement.offsetWidth;
  canvasElement.height = webcamElement.offsetHeight;
  
  canvasElement.style.cssText = `
    position: absolute;
    top: ${webcamElement.offsetTop}px;
    left: ${webcamElement.offsetLeft}px;
    width: ${webcamElement.offsetWidth}px;
    height: ${webcamElement.offsetHeight}px;
    border-radius: 20px;
    z-index: 1000;
    pointer-events: none;
    display: block;
    position:relative;
    top:200px;
  `;
  
  // Draw video frame to canvas
  ctx.drawImage(webcamElement, 0, 0, canvasElement.width, canvasElement.height);
  
  // Get frame data
  const frame = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
  const data = frame.data;
  
  // Create RGB split effect
  const offset = 3;
  
  for (let i = 0; i < data.length; i += 4) {
    const pixel = i / 4;
    const x = pixel % canvasElement.width;
    const y = Math.floor(pixel / canvasElement.width);
    
    // Red channel shift left
    const redIndex = ((y * canvasElement.width) + Math.max(0, x - offset)) * 4;
    if (redIndex < data.length) {
      data[i] = frame.data[redIndex];
    }
    
    // Blue channel shift right  
    const blueIndex = ((y * canvasElement.width) + Math.min(canvasElement.width - 1, x + offset)) * 4 + 2;
    if (blueIndex < data.length) {
      data[i + 2] = frame.data[blueIndex];
    }
    
    // Green enhancement
    data[i + 1] = Math.min(255, data[i + 1] * 1.1);
    
    // Add VHS noise
    if (Math.random() < 0.1) {
      const noise = (Math.random() - 0.5) * 20;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
  }
  
  ctx.putImageData(frame, 0, 0);
  
  vhsAnimationId = requestAnimationFrame(drawVHS);
}

// Photo Strip Creation Functions
function createPhotoStrip() {
  console.log("Creating photo strip with", capturedPhotos.length, "photos");
  
  // Hide the main interface
  document.querySelector('.webcam-container').style.display = 'none';
  
  // Create photo strip viewer
  const stripViewer = document.createElement('div');
  stripViewer.className = 'photo-strip-viewer';
  stripViewer.innerHTML = `
    <div class="strip-container">
      <h2 style="text-align: center; color: white; margin-bottom: 20px;">📸 Your Photo Strip</h2>
      <div class="strip-canvas-container" style="display: flex; justify-content: center; margin-bottom: 20px;">
        <canvas id="photoStripCanvas" width="400" height="600" style="border: 3px solid #333; border-radius: 15px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"></canvas>
      </div>
      <div class="strip-controls" style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
        <button onclick="downloadPhotoStrip()" style="padding: 12px 24px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px;">💾 Download Photo Strip</button>
        <button onclick="restartSession()" style="padding: 12px 24px; background: #757575; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px;">� Take New Photos</button>
      </div>
    </div>
  `;
  
  stripViewer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
    box-sizing: border-box;
  `;
  
  document.body.appendChild(stripViewer);
  
  // Draw the photo strip
  setTimeout(drawPhotoStrip, 100);
}

function drawPhotoStrip() {
  const canvas = document.getElementById('photoStripCanvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size for vertical photo strip (like your image)
  canvas.width = 400;
  canvas.height = 600;
  
  // Clear canvas with light background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calculate photo dimensions for vertical strip
  const photoWidth = 320;
  const photoHeight = 120;
  const spacing = 20; // Small space between photos
  const startX = (canvas.width - photoWidth) / 2;
  const startY = 40;
  
  // Add title at top
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('photobooth', canvas.width / 2, 25);
  
  // Load and draw each photo
  let loadedCount = 0;
  capturedPhotos.forEach((photoUri, index) => {
    const img = new Image();
    img.onload = function() {
      const photoX = startX;
      const photoY = startY + (index * (photoHeight + spacing));
      
      // Draw white frame around photo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(photoX - 5, photoY - 5, photoWidth + 10, photoHeight + 10);
      
      // Draw subtle border
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.strokeRect(photoX - 5, photoY - 5, photoWidth + 10, photoHeight + 10);
      
      // Draw the photo
      ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
      
      loadedCount++;
      if (loadedCount === capturedPhotos.length) {
        console.log("Photo strip ready for download");
      }
    };
    img.src = photoUri;
  });
}

function downloadPhotoStrip() {
  const canvas = document.getElementById('photoStripCanvas');
  const link = document.createElement('a');
  link.download = 'photo-strip.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  
  alert('Photo strip downloaded! 🎉');
}

function restartSession() {
  // Reset everything
  capturedPhotos = [];
  
  // Remove photo strip viewer
  const stripViewer = document.querySelector('.photo-strip-viewer');
  if (stripViewer) {
    stripViewer.remove();
  }
  
  // Show main interface
  document.querySelector('.webcam-container').style.display = 'block';
  
  // Update gallery
  updateGalleryDisplay();
  
  alert('Ready to take new photos! 📸');
}
