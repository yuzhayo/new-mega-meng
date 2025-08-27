# React + TypeScript + Vite App

A modern React application built with TypeScript and Vite.

## Features

- ⚡️ Vite for fast development and building
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 🔍 ESLint for code quality
- 📱 Responsive design
- 🚀 Ready for Netlify deployment

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

This app is configured for easy deployment on Netlify:

1. Connect your repository to Netlify
2. Netlify will automatically detect the build settings from `netlify.toml`
3. Your app will be deployed automatically on every push to main

### Manual Deployment

You can also deploy manually:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

## Environment Variables

Copy `.env.example` to `.env` and configure your environment variables as needed.

## Project Structure

```
src/
├── components/     # Reusable components
├── testscreen/     # Test screen component
├── App.tsx         # Main app component
├── main.tsx        # App entry point
└── index.css       # Global styles
```