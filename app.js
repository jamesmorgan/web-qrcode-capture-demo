document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const capturedImage = document.getElementById('captured-image');
    const startButton = document.getElementById('start-camera');
    const captureButton = document.getElementById('capture-image');
    const imageDetails = document.getElementById('image-details');
    const qrResult = document.getElementById('qr-result');
    const resetButton = document.getElementById('reset');
    
    let stream = null;

    // Start camera
    startButton.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' }
            });
            video.srcObject = stream;
            video.style.display = 'block';
            captureButton.style.display = 'block';
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Error accessing camera. Please make sure you have granted camera permissions.');
        }
    });

    // Rest of your existing app.js code...
}); 