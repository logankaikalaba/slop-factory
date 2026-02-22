import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Slop Factory',
  description: 'Image, video, and text content management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <nav className="nav">
            <a href="/" className="logo">
              Slop Factory
            </a>
            <div className="nav-links">
              <a href="/">Gallery</a>
              <a href="/upload">Upload</a>
            </div>
          </nav>
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  )
}
