"use client"

import { useEffect, useState } from "react"
import styles from "./ThemeToggle.module.css"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Sync with what the script in layout.tsx set
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
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

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button 
        className={styles.toggleButton}
        aria-label="Toggle theme"
      >
        🌙 Dark
      </button>
    )
  }

  return (
    <button 
      onClick={toggleTheme}
      className={styles.toggleButton}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  )
}

