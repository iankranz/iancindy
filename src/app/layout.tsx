import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

// Loading custom fonts from public/fonts
const centuryFont = localFont({
  src: [
    {
      path: "../fonts/Century.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-century",
  display: "swap",
})

const lithosBlackFont = localFont({
  src: [
    {
      path: "../fonts/LithosBlackRegular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-lithos-black",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ian and Cindy's Website",
  description: "Personal website of Ian and Cindy for sharing projects.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    // No manual preference - respect system preference
                    // Don't set data-theme or class, let CSS media queries handle it
                    // This allows the system preference to work via @media (prefers-color-scheme: dark)
                  }
                } catch (e) {
                  // localStorage might not be available in some contexts
                }
              })();
            `,
          }}
        />
        <script
          src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"
        />
      </head>
      <body className={`${centuryFont.variable} ${lithosBlackFont.variable}`}>
        {children}
      </body>
    </html>
  )
}
