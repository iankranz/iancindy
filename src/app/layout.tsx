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
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  // No manual preference - let system preference handle it via media query
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (prefersDark) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${centuryFont.variable} ${lithosBlackFont.variable}`}>
        {children}
      </body>
    </html>
  )
}
