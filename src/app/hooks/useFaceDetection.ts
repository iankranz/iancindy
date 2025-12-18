'use client'

import { useEffect, useState } from 'react'

// Dynamic import to avoid SSR issues and ensure proper initialization
let faceapi: typeof import('face-api.js') | null = null
let isInitializing = false

// Wait for TensorFlow.js backend to be ready
const ensureTensorFlowBackend = async (faceApiModule: any): Promise<boolean> => {
  try {
    // Try multiple ways to access TensorFlow.js
    let tf: any = null
    
    if (faceApiModule) {
      tf = faceApiModule.tf || faceApiModule.tensorflow || (faceApiModule as any).default?.tf
    }
    
    if (!tf && typeof window !== 'undefined') {
      tf = (window as any).tf || (window as any).tensorflow
    }
    
    if (!tf) {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (faceApiModule) {
        tf = faceApiModule.tf || faceApiModule.tensorflow || (faceApiModule as any).default?.tf
      }
      if (!tf && typeof window !== 'undefined') {
        tf = (window as any).tf || (window as any).tensorflow
      }
    }
    
    if (!tf) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return true
    }
    
    if (tf.ready) {
      await tf.ready()
    }
    
    if (tf.getBackend && !tf.getBackend()) {
      if (tf.setBackend) {
        try {
          await tf.setBackend('webgl')
          if (tf.ready) {
            await tf.ready()
          }
        } catch {
          try {
            await tf.setBackend('cpu')
            if (tf.ready) {
              await tf.ready()
            }
          } catch {
            // Backend initialization failed, but continue anyway
          }
        }
      }
    }
    
    return true
  } catch (error) {
    console.warn('TensorFlow.js backend check failed, but continuing:', error)
    return true
  }
}

// Lazy load face-api.js only on client side
const loadFaceApi = async () => {
  if (typeof window === 'undefined') return null
  if (faceapi) return faceapi
  if (isInitializing) {
    // Wait for ongoing initialization
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return faceapi
  }
  
  isInitializing = true
  try {
    // Import face-api.js dynamically
    const faceApiModule = await import('face-api.js')
    
    // After importing, wait for TensorFlow.js to be available and initialized
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Ensure TensorFlow.js backend is ready
    await ensureTensorFlowBackend(faceApiModule)
    
    // Additional wait to ensure everything is fully initialized
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Check if the module is properly loaded
    if (faceApiModule && faceApiModule.nets) {
      faceapi = faceApiModule
      return faceapi
    }
    
    throw new Error('face-api.js module structure invalid')
  } catch (error) {
    console.error('Failed to load face-api.js:', error)
    faceapi = null
    return null
  } finally {
    isInitializing = false
  }
}

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
      // Load face-api.js first with error handling
      const faceApiModule = await loadFaceApi()
      if (!faceApiModule) {
        console.warn('face-api.js failed to load, face detection will be disabled')
        setIsReady(true) // Set ready to allow app to continue without face detection
        return
      }

      if (!faceApiModule.nets) {
        throw new Error('face-api.js nets not available')
      }

      // Ensure TensorFlow.js backend is ready before loading models
      await ensureTensorFlowBackend(faceApiModule)

      // Load face detection models from CDN
      const MODEL_URL =
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'

      await Promise.all([
        faceApiModule.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceApiModule.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ])

      setIsReady(true)
    } catch (error: any) {
      // Handle specific backend errors
      if (error?.message?.includes('backend') || error?.message?.includes('undefined')) {
        console.warn('TensorFlow.js backend initialization issue, face detection disabled:', error.message)
      } else {
        console.error('Failed to load face detection models:', error)
      }
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
      // Ensure face-api.js is loaded
      const faceApiModule = await loadFaceApi()
      if (!faceApiModule || !faceApiModule.nets || !faceApiModule.nets.tinyFaceDetector) {
        console.warn('Face detection models not loaded')
        return null
      }

      // Ensure TensorFlow.js backend is ready before detecting
      await ensureTensorFlowBackend(faceApiModule)

      // Create image element from data URL
      const img = await loadImage(imageDataUrl)

      // Detect face with landmarks
      const detection = await faceApiModule
        .detectSingleFace(img, new faceApiModule.TinyFaceDetectorOptions())
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

