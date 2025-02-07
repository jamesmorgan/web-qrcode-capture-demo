# Image & QR Code Reader

A simple web application that allows users to capture images using their device's camera and scan QR codes in real-time.

## Features

- Camera access using device's camera
- Image capture functionality
- QR code detection and decoding
- Image details display (dimensions and aspect ratio)
- Keyboard shortcuts (space bar to capture)
- Reset functionality

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click the "Start Camera" button to initialize your device's camera
2. Once the camera feed is visible, you can:
   - Click the "Capture Image" button or press the SPACE BAR to take a photo
   - The application will automatically detect and decode any QR codes in the image
3. After capturing:
   - The image details will be displayed
   - If a QR code is detected, its content will be shown
   - Click the "Reset" button to return to camera mode

## Requirements

- Modern web browser with camera access
- Node.js and npm installed
- Camera permissions enabled in browser

## Technical Details

- Built with vanilla JavaScript
- Uses the MediaDevices API for camera access
- QR code detection powered by jsQR library
- Express.js for the server

## Browser Compatibility

Works on modern browsers that support:

- MediaDevices API
- Canvas API
- async/await
- ES6+ features

## License

MIT License
    