'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import useFaceDetection from '../hooks/useFaceDetection'
import { TEMPLATE_CONFIG } from '../utils/templateConfig'
import { isHeicFile, convertHeicToJpeg } from '../utils/heicConverter'
import styles from './FaceInHoleModal.module.css'

interface CameraCaptureProps {
  onImageCapture: (
    imageDataUrl: string,
    faceData: any,
    isFromCamera: boolean
  ) => void
  onBack?: () => void
  skipInitialScreen?: boolean
  onCapture?: () => void
}

export default function CameraCapture({
  onImageCapture,
  onBack,
  skipInitialScreen = false,
  onCapture,
}: CameraCaptureProps) {
  const [mode, setMode] = useState<'camera' | 'upload' | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { detectFace } = useFaceDetection()
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (skipInitialScreen && !mode && !stream) {
      const timer = setTimeout(() => {
        startCamera()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [skipInitialScreen])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [stream])

  useEffect(() => {
    if (mode !== 'camera' || cameraLoading) return

    const canvas = overlayCanvasRef.current
    const video = videoRef.current

    if (!canvas || !video) {
      return
    }

    const drawOverlay = () => {
      if (mode !== 'camera' || cameraLoading) return

      if (video.readyState < 2 || video.videoWidth === 0) {
        animationFrameRef.current = requestAnimationFrame(drawOverlay)
        return
      }

      const rect = video.getBoundingClientRect()
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width
        canvas.height = rect.height
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const config = TEMPLATE_CONFIG
      let ovalCenterX: number, ovalCenterY: number, ovalRadiusX: number, ovalRadiusY: number

      if (config.oval) {
        ovalCenterX = canvas.width / 2
        ovalCenterY = canvas.height / 2

        const templateWidth = canvas.width
        const templateHeight = canvas.height

        ovalRadiusX = config.oval.radiusX * templateWidth
        ovalRadiusY = config.oval.radiusY * templateHeight

        const currentSize = Math.max(ovalRadiusX * 2, ovalRadiusY * 2)
        const targetSize = Math.min(canvas.width, canvas.height) * 0.666
        const scaleFactor = targetSize / currentSize

        ovalRadiusX *= scaleFactor
        ovalRadiusY *= scaleFactor
      } else {
        ovalCenterX = canvas.width / 2
        ovalCenterY = canvas.height / 2
        ovalRadiusX = canvas.width * 0.3
        ovalRadiusY = canvas.height * 0.35
      }

      const rotation = config.oval?.rotation || 0
      ctx.strokeStyle = '#4ECDC4'
      ctx.lineWidth = 4
      ctx.setLineDash([10, 5])
      ctx.beginPath()
      ctx.ellipse(
        ovalCenterX,
        ovalCenterY,
        ovalRadiusX,
        ovalRadiusY,
        (rotation * Math.PI) / 180,
        0,
        Math.PI * 2
      )
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#ffffff'
      ctx.font = '18px var(--font-century), sans-serif'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 4
      ctx.fillText('position your face in the oval', ovalCenterX, canvas.height - 40)
      ctx.shadowBlur = 0

      animationFrameRef.current = requestAnimationFrame(drawOverlay)
    }

    animationFrameRef.current = requestAnimationFrame(drawOverlay)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mode, cameraLoading])

  const startCamera = async () => {
    setCameraLoading(true)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)
      setMode('camera')

      setTimeout(() => {
        const video = videoRef.current
        if (video) {
          video.srcObject = mediaStream
          const playVideo = async () => {
            try {
              await video.play()
            } catch {
              // Video play failed silently
            }
          }
          if (video.readyState >= 2) {
            playVideo()
          } else {
            video.onloadedmetadata = playVideo
          }
        }
      }, 200)
    } catch (error: any) {
      setCameraLoading(false)

      let errorMessage = 'Unable to access camera. '

      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        errorMessage +=
          'Permission denied. Please allow camera access in your browser settings.'
      } else if (
        error.name === 'NotFoundError' ||
        error.name === 'DevicesNotFoundError'
      ) {
        errorMessage += 'No camera found. Please connect a camera and try again.'
      } else if (
        error.name === 'NotReadableError' ||
        error.name === 'TrackStartError'
      ) {
        errorMessage +=
          'Camera is already in use by another application.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage +=
          'Camera does not meet requirements. Trying with relaxed constraints...'
        trySimpleCamera()
        return
      } else {
        errorMessage += error.message || 'Unknown error occurred.'
      }

      errorMessage += '\n\nPlease use "Upload Photo" instead.'
      alert(errorMessage)
    }
  }

  const trySimpleCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      })

      setStream(mediaStream)
      setMode('camera')

      setTimeout(() => {
        const video = videoRef.current
        if (video) {
          video.srcObject = mediaStream
          const playVideo = async () => {
            try {
              await video.play()
            } catch {
              // Video play failed silently
            }
          }
          if (video.readyState >= 2) {
            playVideo()
          } else {
            video.onloadedmetadata = playVideo
          }
        }
      }, 200)
    } catch (error) {
      setCameraLoading(false)
      alert('Camera is not accessible. Please use "Upload Photo" instead.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setMode(null)
  }

  const capturePhoto = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (video && canvas) {
      const context = canvas.getContext('2d')
      if (!context) return

      const targetAspectRatio = 1389 / 1000
      let cropWidth: number, cropHeight: number

      if (video.videoHeight / video.videoWidth > targetAspectRatio) {
        cropWidth = video.videoWidth
        cropHeight = cropWidth * targetAspectRatio
      } else {
        cropHeight = video.videoHeight
        cropWidth = cropHeight / targetAspectRatio
      }

      canvas.width = cropWidth
      canvas.height = cropHeight

      const startX = (video.videoWidth - cropWidth) / 2
      const startY = (video.videoHeight - cropHeight) / 2

      context.translate(canvas.width, 0)
      context.scale(-1, 1)

      context.drawImage(
        video,
        startX,
        startY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      )

      const imageDataUrl = canvas.toDataURL('image/png')

      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }

      setIsDetecting(true)
      try {
        const faceData = await detectFace(imageDataUrl)
        onImageCapture(imageDataUrl, faceData, true)
      } catch (error) {
        onImageCapture(imageDataUrl, null, true)
      } finally {
        setIsDetecting(false)
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    let fileToProcess = file
    if (isHeicFile(file)) {
      try {
        fileToProcess = await convertHeicToJpeg(file)
      } catch (error) {
        alert('Failed to process HEIC file. Please convert it to JPEG first.')
        return
      }
    }
    
    if (fileToProcess.type.startsWith('image/') || isHeicFile(file)) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string

        setIsDetecting(true)
        try {
          const faceData = await detectFace(imageDataUrl)
          onImageCapture(imageDataUrl, faceData, false)
        } catch (error) {
          onImageCapture(imageDataUrl, null, false)
        } finally {
          setIsDetecting(false)
        }
      }
      reader.readAsDataURL(fileToProcess)
    }
  }

  if (mode === 'camera') {
    return (
      <div className={styles.cameraCapture}>
        <div className={styles.videoContainer}>
          {cameraLoading && (
            <div className={styles.cameraPlaceholder}>
              <div className={styles.spinner}></div>
              <p>Starting camera...</p>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.cameraVideo}
            style={{ display: cameraLoading ? 'none' : 'block' }}
            onCanPlay={() => {
              setCameraLoading(false)
              if (videoRef.current && stream) {
                videoRef.current.play().catch(() => {})
              }
            }}
          />
          <canvas 
            ref={overlayCanvasRef} 
            className={styles.cameraOverlayCanvas}
            style={{ display: cameraLoading ? 'none' : 'block' }}
          />
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif,.hif"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          data-capture-button
          onClick={capturePhoto}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      </div>
    )
  }

  return null
}

