import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Clutch SAAS",
  description: "Kanban board for content",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@uploadcare/file-uploader@v1/web/uc-file-uploader-regular.min.css"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Script
          id="uploadcare-config"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.UPLOADCARE_PUBLIC_KEY = 'd8d785e3fe6bd846b390';
            `,
          }}
        />
        <Script
          id="uploadcare-script"
          type="module"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              import * as UC from "https://cdn.jsdelivr.net/npm/@uploadcare/file-uploader@v1/web/file-uploader.min.js";
              UC.defineComponents(UC);
            `,
          }}
        />
      </body>
    </html>
  )
}
