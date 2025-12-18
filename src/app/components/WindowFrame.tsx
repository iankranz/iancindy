"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import styles from "../page.module.css"

export default function WindowFrame() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)

    const observer = new MutationObserver(() => {
      const isDarkMode = document.documentElement.classList.contains("dark")
      setIsDark(isDarkMode)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.windowFrameLayer}>
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

