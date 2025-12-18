'use client'

import { Camera, Upload } from 'lucide-react'
import styles from './FaceInHoleModal.module.css'

interface InfoScreenProps {
  onTakePicture: () => void
  onUpload: () => void
}

export default function InfoScreen({
  onTakePicture,
  onUpload,
}: InfoScreenProps) {
  return (
    <div className={styles.infoScreen}>
      <div className={styles.infoContent}>
        <h2 className={styles.infoHeading}>face in hole!</h2>
        <div className={styles.infoBody}>
          <p>
            Take a photo or upload an image to become Kevin on our holiday card.
          </p>
        </div>
        <div className={styles.infoPreview}>
          <img
            src="/images/preview.png"
            alt="Preview of face in hole card"
            className={styles.infoPreviewImage}
          />
        </div>
      </div>
    </div>
  )
}

