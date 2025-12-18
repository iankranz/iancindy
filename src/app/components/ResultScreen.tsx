'use client'

import { Download, Share2 } from 'lucide-react'
import { canvasToBlob } from '../utils/canvasHelpers'
import styles from './FaceInHoleModal.module.css'

interface ResultScreenProps {
  cardCompositeUrl: string
  kevinCompositeUrl: string
  onReplaceKevin: (kevinCompositeUrl: string) => void
}

export default function ResultScreen({
  cardCompositeUrl,
  kevinCompositeUrl,
  onReplaceKevin,
}: ResultScreenProps) {

  const handleDownload = async () => {
    try {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0)

        const blob = await canvasToBlob(canvas)
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `face-in-hole-${Date.now()}.png`
        link.click()
        URL.revokeObjectURL(url)
      }
      img.src = cardCompositeUrl
    } catch (error) {
      console.error('Failed to download image:', error)
      alert('Failed to download image')
    }
  }

  const handleShare = async () => {
    try {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0)

        const blob = await canvasToBlob(canvas)
        const file = new File(
          [blob],
          `face-in-hole-${Date.now()}.png`,
          { type: 'image/png' }
        )

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Face-in-Hole Creation',
            text: 'Check out my face-in-hole creation!',
          })
        } else {
          handleDownload()
        }
      }
      img.src = cardCompositeUrl
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to share image:', error)
        handleDownload()
      }
    }
  }

  const handleReplaceKevin = () => {
    onReplaceKevin(kevinCompositeUrl)
  }

  return (
    <div className={styles.resultScreen}>
      <div className={styles.resultImageContainer}>
        <img
          src={cardCompositeUrl}
          alt="Your face in the card"
          className={styles.resultImage}
        />
      </div>
    </div>
  )
}

