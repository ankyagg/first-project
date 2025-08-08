const videoElement = document.getElementById('webcam');
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        videoElement.srcObject = stream; // Attach the webcam stream
      })
      .catch((err) => {
        console.error("⚠️ Error accessing webcam:", err);
        alert("Could not access your webcam. Please check browser permissions.");
      });
      const video = document.getElementById("webcam");

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Failed to access webcam:", err);
  });

// Apply filter
function setFilter(filterValue) {
  video.style.filter = filterValue;
}
