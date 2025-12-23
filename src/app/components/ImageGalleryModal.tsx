'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { GalleryImage } from './ImageGallery'
import styles from './ImageGalleryModal.module.css'

interface ImageGalleryModalProps {
  images: GalleryImage[]
  initialIndex: number
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
}

export default function ImageGalleryModal({
  images,
  initialIndex,
  onClose,
  onNavigate,
}: ImageGalleryModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50

  useEffect(() => {
    // Reset image loaded state when index changes
    setImageLoaded(false)
  }, [initialIndex])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onNavigate('prev')
      } else if (e.key === 'ArrowRight') {
        onNavigate('next')
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
    
    // Prevent body scroll
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    html.style.overflow = 'hidden'
    
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleArrowKeys)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleArrowKeys)
      
      // Restore original styles
      body.style.overflow = originalBodyOverflow
      body.style.position = originalBodyPosition
      body.style.top = originalBodyTop
      body.style.width = originalBodyWidth
      html.style.overflow = originalHtmlOverflow
      
      // Restore scroll position
      window.scrollTo(0, scrollY)
    }
  }, [onClose, onNavigate])

  const currentImage = images[initialIndex]
  const hasMultipleImages = images.length > 1

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    
    const currentX = e.targetTouches[0].clientX
    const diff = currentX - touchStart
    setSwipeOffset(diff)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) {
      setTouchStart(null)
      setTouchEnd(null)
      setSwipeOffset(0)
      return
    }

    const touch = e.changedTouches[0]
    setTouchEnd(touch.clientX)

    const distance = touchStart - touch.clientX
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && hasMultipleImages) {
      onNavigate('next')
    } else if (isRightSwipe && hasMultipleImages) {
      onNavigate('prev')
    } else {
      // Reset if swipe wasn't far enough
      setSwipeOffset(0)
    }

    // Reset touch state
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Reset swipe state when image changes
  useEffect(() => {
    setTouchStart(null)
    setTouchEnd(null)
    setSwipeOffset(0)
  }, [initialIndex])

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close gallery"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {hasMultipleImages && (
          <>
            <button
              className={styles.navButton}
              onClick={() => onNavigate('prev')}
              aria-label="Previous image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className={`${styles.navButton} ${styles.navButtonNext}`}
              onClick={() => onNavigate('next')}
              aria-label="Next image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}

        <div 
          ref={imageContainerRef}
          className={styles.imageContainer}
          style={{
            transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined,
            transition: swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          {!imageLoaded && (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
            </div>
          )}
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            className={styles.modalImage}
            sizes="100vw"
            onLoad={() => setImageLoaded(true)}
            priority
            draggable={false}
          />
        </div>

        {hasMultipleImages && (
          <div className={styles.imageCounter}>
            {initialIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}

