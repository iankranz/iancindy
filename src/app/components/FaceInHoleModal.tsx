'use client'

import { useEffect } from 'react'
import FaceInHoleFlow from './FaceInHoleFlow'
import styles from './FaceInHoleModal.module.css'

interface FaceInHoleModalProps {
  isOpen: boolean
  onClose: () => void
  onReplaceKevin: (kevinCompositeUrl: string) => void
}

export default function FaceInHoleModal({
  isOpen,
  onClose,
  onReplaceKevin,
}: FaceInHoleModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    // Store scroll position and styles
    const scrollY = window.scrollY
    const body = document.body
    const html = document.documentElement
    
    // Store original styles
    const originalBodyOverflow = body.style.overflow
    const originalBodyPosition = body.style.position
    const originalBodyTop = body.style.top
    const originalBodyWidth = body.style.width
    const originalHtmlOverflow = html.style.overflow
    
    // Prevent body scroll - works on both desktop and mobile
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    html.style.overflow = 'hidden'
    
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      
      // Restore original styles
      body.style.overflow = originalBodyOverflow
      body.style.position = originalBodyPosition
      body.style.top = originalBodyTop
      body.style.width = originalBodyWidth
      html.style.overflow = originalHtmlOverflow
      
      // Restore scroll position
      window.scrollTo(0, scrollY)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <FaceInHoleFlow
          onReplaceKevin={onReplaceKevin}
          onClose={onClose}
        />
      </div>
    </div>
  )
}

