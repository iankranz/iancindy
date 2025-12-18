"use client"

import { useEffect, useState } from "react"
import { Sun, Moon, Camera, Snowflake } from "lucide-react"
import styles from "./FloatingButtons.module.css"

interface FloatingButtonsProps {
  onCameraClick?: () => void
  onSnowflakeClick?: () => void
}

export default function FloatingButtons({ 
  onCameraClick,
  onSnowflakeClick 
}: FloatingButtonsProps) {
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

  const toggleTheme = () => {
    const newIsDark = !isDark
    
    if (newIsDark) {
      document.documentElement.classList.add("dark")
      document.documentElement.setAttribute("data-theme", "dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.setAttribute("data-theme", "light")
      localStorage.setItem("theme", "light")
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Desktop: Button group with theme toggle and camera (vertical) */}
      <div className={styles.iconButtonParent}>
        <button
          className={styles.iconButton}
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className={styles.themeIconWrapper}>
            {isDark ? (
              <Sun key="sun" size={24} className={styles.themeIcon} />
            ) : (
              <Moon key="moon" size={24} className={styles.themeIcon} />
            )}
          </div>
        </button>
        <button
          className={styles.iconButton}
          onClick={onCameraClick}
          aria-label="Open camera"
        >
          <Camera size={24} className={`${styles.icon} ${styles.cameraIcon}`} />
        </button>
      </div>

      {/* Desktop: Separate snowflake button */}
      <button
        className={`${styles.iconButton} ${styles.snowflakeButton}`}
        onClick={onSnowflakeClick}
        aria-label="Snowflake"
      >
        <Snowflake size={24} className={`${styles.icon} ${styles.snowflakeIcon}`} />
      </button>

      {/* Mobile: Horizontal button bar at bottom */}
      <div className={styles.mobileButtonBar}>
        <button
          className={styles.mobileIconButton}
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className={styles.themeIconWrapper}>
            {isDark ? (
              <Sun key="sun-mobile" size={24} className={styles.themeIcon} />
            ) : (
              <Moon key="moon-mobile" size={24} className={styles.themeIcon} />
            )}
          </div>
        </button>
        <button
          className={styles.mobileSnowflakeButton}
          onClick={onSnowflakeClick}
          aria-label="Make it snow"
        >
          <Snowflake size={24} className={`${styles.icon} ${styles.snowflakeIcon}`} />
          <span className={styles.snowflakeText}>Make it snow</span>
        </button>
        <button
          className={styles.mobileIconButton}
          onClick={onCameraClick}
          aria-label="Open camera"
        >
          <Camera size={24} className={`${styles.icon} ${styles.cameraIcon}`} />
        </button>
      </div>
    </>
  )
}

