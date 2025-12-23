'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '../page.module.css'

interface CountUpStatProps {
  value: string // e.g., "20+", "8", "5"
  label: string
}

export default function CountUpStat({ value, label }: CountUpStatProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const statRef = useRef<HTMLDivElement>(null)

  // Parse the value to get the number and any suffix
  const hasPlus = value.includes('+')
  const targetNumber = parseInt(value.replace('+', ''), 10)
  const duration = 1500 // Animation duration in ms

  useEffect(() => {
    if (hasAnimated || !statRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            
            // Start counting animation
            const startTime = Date.now()
            const startValue = 0

            const animate = () => {
              const elapsed = Date.now() - startTime
              const progress = Math.min(elapsed / duration, 1)
              
              // Easing function (ease-out)
              const easeOut = 1 - Math.pow(1 - progress, 3)
              const currentValue = Math.floor(startValue + (targetNumber - startValue) * easeOut)
              
              setCount(currentValue)

              if (progress < 1) {
                requestAnimationFrame(animate)
              } else {
                setCount(targetNumber)
              }
            }

            requestAnimationFrame(animate)
          }
        })
      },
      {
        threshold: 0.5, // Trigger when 50% of the element is visible
      }
    )

    observer.observe(statRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasAnimated, targetNumber])

  return (
    <div ref={statRef} className={styles.statItem}>
      <p className={styles.statNumber}>
        <span className={styles.statNumberValue}>{count}</span>
        {hasPlus && <span className={styles.statNumberPlus}>+</span>}
      </p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  )
}

