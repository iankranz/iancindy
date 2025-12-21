# Ian & Cindy Holiday Card 2025

An interactive holiday card website themed around the classic movie "Home Alone". Put your face in Kevin McCallister's place and become part of the card!

## Features

- 🎬 **Home Alone Theme**: Interactive holiday card featuring Ian & Cindy as the Wet Bandits
- 📸 **Face-in-Hole**: Use your camera to replace Kevin's face with your own
- 🎨 **Parallax Scrolling**: Beautiful parallax effects as you scroll through the page
- ❄️ **Snow Animation**: Interactive snowflake button with confetti effects
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🖼️ **Image Optimization**: Automated scripts for optimizing SVGs and images

## Tech Stack

- **Framework**: Next.js 16.0.7
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Face Detection**: face-api.js
- **Image Processing**: sharp, heic2any
- **Icons**: lucide-react

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iancindy
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production bundle
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Project Structure

```
iancindy/
├── public/
│   ├── images/          # SVG templates and optimized images
│   └── fonts/           # Custom fonts
├── src/
│   └── app/
│       ├── components/  # React components
│       ├── hooks/       # Custom React hooks
│       ├── utils/       # Utility functions
│       └── page.tsx     # Main page component
├── scripts/             # Image optimization scripts
└── next.config.ts       # Next.js configuration
```

## Key Components

- **FaceInHoleModal**: Modal for camera capture and face replacement
- **WindowFrame**: Animated window frame component
- **FloatingButtons**: Camera and snowflake action buttons
- **CameraCapture**: Camera interface with face detection
- **CropEditorHandles**: Image cropping functionality

## Image Optimization

The project includes scripts for optimizing images and SVGs:

- `scripts/optimize-images.js` - Optimizes PNG/WebP images
- `scripts/optimize-svgs.js` - Optimizes SVG files
- `scripts/re-embed-images.js` - Re-embeds images in SVGs

## Browser Support

- Modern browsers with camera API support
- Face detection requires a device with a front-facing camera
- HEIC image format conversion supported

## Notes

- Face detection runs entirely client-side using face-api.js
- Images are processed in the browser (no server upload required)
- The site uses parallax scrolling for visual effects
- Snow animation uses canvas-confetti library

## License

Private project - All rights reserved

---

Made with ❤️ by Ian & Cindy, 2025

