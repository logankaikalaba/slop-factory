import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Slop Factory',
  description: 'Image, video, and text content management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrainsMono.variable}`}>
      <body>
        <header className="header">
          <nav className="nav">
            <a href="/" className="logo">Slop Factory</a>
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
