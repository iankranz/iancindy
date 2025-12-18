'use client'

import { useEffect, useState } from 'react'
import * as faceapi from 'face-api.js'

export interface FaceData {
  box: { x: number; y: number; width: number; height: number }
  center: { x: number; y: number }
  angle: number
  landmarks: {
    nose: { x: number; y: number }
    leftEye: { x: number; y: number }
    rightEye: { x: number; y: number }
  }
}

function useFaceDetection() {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadModels = async () => {
    if (isReady || isLoading) return

    setIsLoading(true)
    try {
      // Load face detection models from CDN
      const MODEL_URL =
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ])

      setIsReady(true)
    } catch (error) {
      console.error('Failed to load face detection models:', error)
      setIsReady(true) // Set ready even on error to allow fallback
    } finally {
      setIsLoading(false)
    }
  }

  const detectFace = async (
    imageDataUrl: string
  ): Promise<FaceData | null> => {
    if (!isReady) return null

    try {
      // Create image element from data URL
      const img = await loadImage(imageDataUrl)

      // Detect face with landmarks
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()

      if (!detection) return null

      // Extract face bounding box
      const { x, y, width, height } = detection.detection.box

      // Get face landmarks for better positioning
      const landmarks = detection.landmarks
      const nose = landmarks.getNose()
      const leftEye = landmarks.getLeftEye()
      const rightEye = landmarks.getRightEye()

      // Calculate face center and angle
      const faceCenter = {
        x: x + width / 2,
        y: y + height / 2,
      }

      // Calculate eye angle for rotation
      const eyeLeft = {
        x: leftEye[0].x,
        y: leftEye[0].y,
      }
      const eyeRight = {
        x: rightEye[3].x,
        y: rightEye[3].y,
      }

      const angle =
        Math.atan2(eyeRight.y - eyeLeft.y, eyeRight.x - eyeLeft.x) *
        (180 / Math.PI)

      return {
        box: { x, y, width, height },
        center: faceCenter,
        angle,
        landmarks: {
          nose: nose[3],
          leftEye: eyeLeft,
          rightEye: eyeRight,
        },
      }
    } catch (error) {
      console.error('Face detection error:', error)
      return null
    }
  }

  const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = dataUrl
    })
  }

  return {
    isReady,
    isLoading,
    detectFace,
  }
}

export default useFaceDetection

