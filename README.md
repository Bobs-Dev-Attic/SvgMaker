# SvgMaker — PNG to SVG Converter

A high-performance, client-side PNG/JPG/WebP to SVG conversion tool built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

- **Client-side only** — images never leave your browser
- **imagetracerjs** pixel-to-path tracing with color, grayscale, and binary modes
- **Paper.js** path simplification (clean wobbles) and smoothing (round corners)
- **SVGO** optimization on export for smaller file sizes
- **Framer Motion** animations throughout the UI
- **Live stats** panel showing SVG file size and path point count
- Dark theme UI with violet accent colors

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Stack

- [Next.js 16](https://nextjs.org) with App Router
- [TypeScript](https://www.typescriptlang.org/) + [Tailwind CSS](https://tailwindcss.com/)
- [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs) — bitmap to SVG tracing
- [Paper.js](http://paperjs.org/) — vector path manipulation
- [SVGO](https://github.com/svg/svgo) — SVG optimization
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Lucide React](https://lucide.dev/) — icons

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
