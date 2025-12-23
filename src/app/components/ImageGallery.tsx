'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './ImageGallery.module.css'
import ImageGalleryModal from './ImageGalleryModal'

export interface GalleryImage {
  src: string
  alt: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  // Limit to 2-9 images as specified
  const displayImages = images.slice(0, 9)

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleCloseModal = () => {
    setSelectedImageIndex(null)
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return

    if (direction === 'prev') {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? displayImages.length - 1 : selectedImageIndex - 1
      )
    } else {
      setSelectedImageIndex(
        selectedImageIndex === displayImages.length - 1 ? 0 : selectedImageIndex + 1
      )
    }
  }

  // Determine grid layout based on number of images
  const getGridClass = () => {
    const count = displayImages.length
    if (count === 2) return styles.grid2
    if (count === 3) return styles.grid3
    if (count === 4) return styles.grid4
    if (count === 5) return styles.grid5
    if (count === 6) return styles.grid6
    if (count === 7) return styles.grid7
    if (count === 8) return styles.grid8
    return styles.grid9
  }

  return (
    <>
      <div className={`${styles.gallery} ${getGridClass()}`}>
        {displayImages.map((image, index) => (
          <button
            key={index}
            className={styles.galleryItem}
            onClick={() => handleImageClick(index)}
            aria-label={`View image ${index + 1}: ${image.alt}`}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className={styles.galleryImage}
                sizes="(max-width: 600px) 50vw, 33vw"
              />
            </div>
          </button>
        ))}
      </div>

      {selectedImageIndex !== null && (
        <ImageGalleryModal
          images={displayImages}
          initialIndex={selectedImageIndex}
          onClose={handleCloseModal}
          onNavigate={handleNavigate}
        />
      )}
    </>
  )
}

