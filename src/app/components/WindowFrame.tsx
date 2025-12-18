"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import styles from "../page.module.css"

interface WindowFrameProps {
  scrollY?: number
}

export default function WindowFrame({ scrollY = 0 }: WindowFrameProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check theme: first check data-theme attribute, then class, then system preference
    const getCurrentTheme = () => {
      const dataTheme = document.documentElement.getAttribute("data-theme")
      if (dataTheme === "dark") return true
      if (dataTheme === "light") return false
      if (document.documentElement.classList.contains("dark")) return true
      // Fall back to system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    
    setIsDark(getCurrentTheme())

    const observer = new MutationObserver(() => {
      setIsDark(getCurrentTheme())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    })

    // Also listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleSystemThemeChange = () => {
      // Only update if no manual preference is set
      if (!document.documentElement.getAttribute("data-theme")) {
        setIsDark(mediaQuery.matches)
      }
    }
    mediaQuery.addEventListener("change", handleSystemThemeChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [])

  return (
    <div 
      className={styles.windowFrameLayer}
      style={{
        transform: `translateY(${scrollY}px)`,
      }}
    >
      <Image 
        src="/images/window-frame-light.svg" 
        alt="" 
        fill 
        className={`${styles.layerImage} ${styles.windowFrameImage}`}
        style={{ opacity: mounted && !isDark ? 1 : 0 }}
      />
      <Image 
        src="/images/window-frame-dark.svg" 
        alt="" 
        fill 
        className={`${styles.layerImage} ${styles.windowFrameImage}`}
        style={{ opacity: mounted && isDark ? 1 : 0 }}
      />
    </div>
  )
}

