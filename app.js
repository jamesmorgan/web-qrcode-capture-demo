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

    // Capture image
    captureButton.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Display captured image
        capturedImage.src = canvas.toDataURL('image/png');
        capturedImage.style.display = 'block';
        resetButton.style.display = 'block';
        
        // Stop video stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
            captureButton.style.display = 'none';
        }

        // Display image details
        displayImageDetails(canvas.width, canvas.height);
        
        // Process QR code
        processQRCode(context);
    });

    // Reset button
    resetButton.addEventListener('click', async () => {
        capturedImage.style.display = 'none';
        resetButton.style.display = 'none';
        imageDetails.innerHTML = '';
        qrResult.innerHTML = '';
        
        // Restart camera
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' }
            });
            video.srcObject = stream;
            video.style.display = 'block';
            captureButton.style.display = 'block';
        } catch (err) {
            console.error('Error restarting camera:', err);
            alert('Error restarting camera. Please refresh the page.');
        }
    });

    // Add keyboard shortcut for capturing image
    document.addEventListener('keydown', (event) => {
        // Check if space bar was pressed and video is visible
        if (event.code === 'Space' && video.style.display === 'block') {
            event.preventDefault(); // Prevent page scrolling
            captureButton.click(); // Trigger the capture button click
        }
    });

    function displayImageDetails(width, height) {
        const details = `
            <p>Width: ${width}px</p>
            <p>Height: ${height}px</p>
            <p>Aspect Ratio: ${(width / height).toFixed(2)}</p>
        `;
        imageDetails.innerHTML = details;
    }

    async function processQRCode(context) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        let results = [];
        
        // Try QR Code detection
        try {
            const qrCode = jsQR(
                imageData.data,
                imageData.width,
                imageData.height
            );

            if (qrCode) {
                console.log("QRCode result", qrCode);
                results.push({
                    type: 'QR Code',
                    data: qrCode.data
                });
            }
        } catch (err) {
            console.error('Error processing QR code:', err);
        }

        // Try Barcode detection with Quagga
        try {
            const result = await new Promise((resolve) => {
                Quagga.decodeSingle({
                    decoder: {
                        readers: [
                            "ean_reader",
                            "ean_8_reader",
                            "code_128_reader",
                            "code_39_reader",
                            "upc_reader",
                            "upc_e_reader",
                            "codabar_reader"
                        ]
                    },
                    locate: true,
                    src: canvas.toDataURL()
                }, function(result) {
                    console.log("Barcode result", result);
                    if (result && result.codeResult) {
                        resolve(result.codeResult);
                    } else {
                        resolve(null);
                    }
                });
            });

            if (result) {
                results.push({
                    type: result.format.toUpperCase(),
                    data: result.code
                });
            }
        } catch (err) {
            console.error('Error processing barcode:', err);
        }

        // Display results
        if (results.length > 0) {
            qrResult.innerHTML = results.map(result => `
                <div>
                    <p>Found ${result.type}:</p>
                    <p>${result.data}</p>
                </div>
            `).join('<hr>');
        } else {
            qrResult.innerHTML = '<p>No codes found in image</p>';
        }
    }
}); 