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
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
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

