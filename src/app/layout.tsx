import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SvgMaker — PNG to SVG Converter',
  description: 'High-performance PNG to SVG conversion with smart editing tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  )
}
