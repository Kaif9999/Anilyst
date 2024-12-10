import './globals.css'
import { Inter } from 'next/font/google'
import StarryBackground from '../components/starry-background'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Data Analyzer',
  description: 'Analyze CSV data and ask questions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white overflow-x-hidden`}>
        <StarryBackground />
        <div className="corner-light"></div>
        {children}
      </body>
    </html>
  )
}

