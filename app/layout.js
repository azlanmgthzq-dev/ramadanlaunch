import './globals.css'

export const metadata = {
  title: 'Tadarus Al-Quran Ceremony',
  description: 'Global Turbine Asia presents Tadarus Al-Quran Ceremony',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}