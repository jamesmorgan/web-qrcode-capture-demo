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

    // Add after variable declarations at the top
    async function displayCameraInfo() {
        const infoDiv = document.createElement('div');
        infoDiv.id = 'camera-info';
        infoDiv.style.marginTop = '20px';
        document.body.appendChild(infoDiv);

        try {
            // Get supported constraints
            const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
            
            // Get all media devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            // If we have an active stream, get its tracks info
            let trackInfo = 'No active stream';
            if (stream) {
                const videoTrack = stream.getVideoTracks()[0];
                if (videoTrack) {
                    const capabilities = videoTrack.getCapabilities();
                    const settings = videoTrack.getSettings();
                    trackInfo = `
                        <h4>Active Video Track:</h4>
                        <pre>${JSON.stringify({
                            label: videoTrack.label,
                            id: videoTrack.id,
                            capabilities,
                            settings
                        }, null, 2)}</pre>
                    `;
                }
            }

            infoDiv.innerHTML = `
                <h3>Camera Information:</h3>
                
                <h4>Available Video Devices:</h4>
                <pre>${JSON.stringify(videoDevices.map(device => ({
                    deviceId: device.deviceId,
                    label: device.label,
                    kind: device.kind
                })), null, 2)}</pre>

                <h4>Supported Constraints:</h4>
                <pre>${JSON.stringify(supportedConstraints, null, 2)}</pre>

                <h4>Current Stream Info:</h4>
                ${trackInfo}

                <h4>User Agent:</h4>
                <pre>${navigator.userAgent}</pre>
            `;
        } catch (err) {
            infoDiv.innerHTML = `
                <h3>Error Getting Camera Info:</h3>
                <pre>${err.toString()}</pre>
            `;
        }
    }

    // Start camera
    startButton.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    // width: { ideal: 1920 },
                    // height: { ideal: 1080 }
                }
            });
            video.srcObject = stream;
            video.style.display = 'block';
            captureButton.style.display = 'block';
            
            // Display camera info after stream is active
            await displayCameraInfo();
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
                    debug: true,
                    // debug: {
                        // drawBoundingBox: true,
                        // showFrequency: false,
                        // drawScanline: false,
                        // showPattern: false
                    // },
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