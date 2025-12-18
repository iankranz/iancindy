'use client'

import { useState, useRef, useEffect } from 'react'
import useFaceDetection, { type FaceData } from '../hooks/useFaceDetection'
import { TEMPLATE_CONFIG } from '../utils/templateConfig'
import styles from './FaceInHoleModal.module.css'

interface CropEditorHandlesProps {
  userImage: string
  onCropComplete: (croppedImage: string) => void
  continueButtonRef?: React.RefObject<HTMLButtonElement>
  onReset?: () => void
  onContinue?: () => void
}

interface OvalBounds {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export default function CropEditorHandles({
  userImage,
  onCropComplete,
  continueButtonRef,
  onReset,
  onContinue,
}: CropEditorHandlesProps) {
  const { detectFace, isReady, isLoading } = useFaceDetection()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 })
  const [isDetectingFace, setIsDetectingFace] = useState(false)
  const [ovalBounds, setOvalBounds] = useState<OvalBounds | null>(null)
  const [initialOvalBounds, setInitialOvalBounds] = useState<OvalBounds | null>(null)
  const [dragMode, setDragMode] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [tempBounds, setTempBounds] = useState<OvalBounds | null>(null)

  useEffect(() => {
    // Initialize crop editor immediately, don't wait for face detection
    initializeCrop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userImage])
  
  // Update oval position when face detection becomes ready (if it wasn't ready initially)
  useEffect(() => {
    if (isReady && imageObj && ovalBounds && !isDetectingFace) {
      // Check if current oval is centered (default position), if so, try to update with face detection
      const currentCenterX = ovalBounds.x + ovalBounds.width / 2
      const currentCenterY = ovalBounds.y + ovalBounds.height / 2
      const canvasCenterX = canvasSize.width / 2
      const canvasCenterY = canvasSize.height / 2
      const isCentered = Math.abs(currentCenterX - canvasCenterX) < 10 && Math.abs(currentCenterY - canvasCenterY) < 10
      
      if (isCentered) {
        // Re-run face detection to update oval position if face detection just became ready
        const updateWithFaceDetection = async () => {
          setIsDetectingFace(true)
          const faceData = await detectFace(userImage)
          setIsDetectingFace(false)
          
          if (faceData && imageObj) {
            const config = TEMPLATE_CONFIG
            const width = canvasSize.width
            const height = canvasSize.height
            
            let ovalRadiusX: number, ovalRadiusY: number
            let ovalAspectRatio = 1
            if (config.oval) {
              const templateAspectRatio = config.templateAspectRatio || 1.25
              ovalAspectRatio =
                (config.oval.radiusY * templateAspectRatio) / config.oval.radiusX
            }
            
            const imgScale = Math.min(width / imageObj.width, height / imageObj.height)
            const scaledWidth = imageObj.width * imgScale
            const scaledHeight = imageObj.height * imgScale
            const offsetX = (width - scaledWidth) / 2
            const offsetY = (height - scaledHeight) / 2
            
            const faceBox = faceData.box
            const faceWidthInCanvas = faceBox.width * imgScale
            const faceHeightInCanvas = faceBox.height * imgScale
            
            const widthScale = 0.9
            ovalRadiusX = (faceWidthInCanvas * widthScale) / 2
            ovalRadiusY = ovalRadiusX * ovalAspectRatio
            
            const maxOvalWidth = width * 0.9
            const maxOvalHeight = height * 0.9
            
            if (ovalRadiusX * 2 > maxOvalWidth) {
              ovalRadiusX = maxOvalWidth / 2
              ovalRadiusY = ovalRadiusX * ovalAspectRatio
            }
            if (ovalRadiusY * 2 > maxOvalHeight) {
              ovalRadiusY = maxOvalHeight / 2
              ovalRadiusX = ovalRadiusY / ovalAspectRatio
            }
            
            const minSize = Math.min(width, height) * 0.15
            if (ovalRadiusX * 2 < minSize) {
              ovalRadiusX = minSize / 2
              ovalRadiusY = ovalRadiusX * ovalAspectRatio
            }
            
            const faceCenterXInOriginal = faceBox.x + faceBox.width / 2
            const faceCenterYInOriginal = faceBox.y + faceBox.height / 2
            
            const faceCenterXInCanvas =
              faceCenterXInOriginal * imgScale + offsetX
            const faceCenterYInCanvas =
              faceCenterYInOriginal * imgScale + offsetY
            
            const heightOffsetPercent = 0.2
            const yOffset = faceHeightInCanvas * heightOffsetPercent
            const ovalCenterY = faceCenterYInCanvas - yOffset
            
            const updatedOvalBounds: OvalBounds = {
              x: faceCenterXInCanvas - ovalRadiusX,
              y: ovalCenterY - ovalRadiusY,
              width: ovalRadiusX * 2,
              height: ovalRadiusY * 2,
              rotation: 0,
            }
            
            setOvalBounds(updatedOvalBounds)
            setInitialOvalBounds(updatedOvalBounds)
          }
        }
        updateWithFaceDetection()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady])

  useEffect(() => {
    if (imageObj && canvasRef.current) {
      drawCropPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageObj, canvasSize, ovalBounds, tempBounds])

  const initializeCrop = async () => {
    try {
      const img = new Image()
      img.onload = async () => {
        setImageObj(img)

        // Use full width of screen (accounting for padding)
        // On mobile, the canvas container extends to full width with negative margins
        const isMobile = window.innerWidth <= 768
        const padding = isMobile ? 0 : 32 // 16px padding on each side for desktop
        const maxWidth = window.innerWidth - padding
        const imgAspectRatio = img.height / img.width
        let width: number, height: number

        // Always use full width, calculate height based on aspect ratio
        width = maxWidth
        height = width * imgAspectRatio

        setCanvasSize({ width, height })

        // Try face detection if ready, otherwise use default position
        let faceData: FaceData | null = null
        if (isReady) {
          setIsDetectingFace(true)
          faceData = await detectFace(userImage)
          setIsDetectingFace(false)
        }

        const config = TEMPLATE_CONFIG
        let ovalRadiusX: number, ovalRadiusY: number

        let ovalAspectRatio = 1
        if (config.oval) {
          const templateAspectRatio = config.templateAspectRatio || 1.25
          ovalAspectRatio =
            (config.oval.radiusY * templateAspectRatio) / config.oval.radiusX
        }

        const imgScale = Math.min(width / img.width, height / img.height)
        const scaledWidth = img.width * imgScale
        const scaledHeight = img.height * imgScale
        const offsetX = (width - scaledWidth) / 2
        const offsetY = (height - scaledHeight) / 2

        let initialOvalBounds: OvalBounds

        if (faceData) {
          const faceBox = faceData.box

          const faceWidthInCanvas = faceBox.width * imgScale
          const faceHeightInCanvas = faceBox.height * imgScale

          const widthScale = 0.9

          ovalRadiusX = (faceWidthInCanvas * widthScale) / 2
          ovalRadiusY = ovalRadiusX * ovalAspectRatio

          const maxOvalWidth = width * 0.9
          const maxOvalHeight = height * 0.9

          if (ovalRadiusX * 2 > maxOvalWidth) {
            ovalRadiusX = maxOvalWidth / 2
            ovalRadiusY = ovalRadiusX * ovalAspectRatio
          }
          if (ovalRadiusY * 2 > maxOvalHeight) {
            ovalRadiusY = maxOvalHeight / 2
            ovalRadiusX = ovalRadiusY / ovalAspectRatio
          }

          const minSize = Math.min(width, height) * 0.15
          if (ovalRadiusX * 2 < minSize) {
            ovalRadiusX = minSize / 2
            ovalRadiusY = ovalRadiusX * ovalAspectRatio
          }

          const faceCenterXInOriginal = faceBox.x + faceBox.width / 2
          const faceCenterYInOriginal = faceBox.y + faceBox.height / 2

          const faceCenterXInCanvas =
            faceCenterXInOriginal * imgScale + offsetX
          const faceCenterYInCanvas =
            faceCenterYInOriginal * imgScale + offsetY

          const heightOffsetPercent = 0.2
          const yOffset = faceHeightInCanvas * heightOffsetPercent
          const ovalCenterY = faceCenterYInCanvas - yOffset

          initialOvalBounds = {
            x: faceCenterXInCanvas - ovalRadiusX,
            y: ovalCenterY - ovalRadiusY,
            width: ovalRadiusX * 2,
            height: ovalRadiusY * 2,
            rotation: 0,
          }
        } else {
          if (config.oval) {
            const targetSize = Math.min(width, height) * 0.5

            if (ovalAspectRatio >= 1) {
              ovalRadiusY = targetSize / 2
              ovalRadiusX = ovalRadiusY / ovalAspectRatio
            } else {
              ovalRadiusX = targetSize / 2
              ovalRadiusY = ovalRadiusX * ovalAspectRatio
            }
          } else {
            ovalRadiusX = width * 0.2
            ovalRadiusY = height * 0.2
          }

          initialOvalBounds = {
            x: width / 2 - ovalRadiusX,
            y: height / 2 - ovalRadiusY,
            width: ovalRadiusX * 2,
            height: ovalRadiusY * 2,
            rotation: 0,
          }
        }

        setOvalBounds(initialOvalBounds)
        setInitialOvalBounds(initialOvalBounds)
      }
      img.onerror = () => {
        alert('Failed to load image')
      }
      img.src = userImage
    } catch (error) {
      alert('Failed to initialize crop editor')
    }
  }

  const drawCropPreview = () => {
    if (!imageObj || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? '#1a161a' : '#ffffff'
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    const imgScale = Math.min(
      canvasSize.width / imageObj.width,
      canvasSize.height / imageObj.height
    )
    const scaledWidth = imageObj.width * imgScale
    const scaledHeight = imageObj.height * imgScale
    const offsetX = (canvasSize.width - scaledWidth) / 2
    const offsetY = (canvasSize.height - scaledHeight) / 2

    ctx.drawImage(imageObj, offsetX, offsetY, scaledWidth, scaledHeight)
    const bounds = tempBounds || ovalBounds
    if (bounds) {
      const { x, y, width, height, rotation = 0 } = bounds
      const centerX = x + width / 2
      const centerY = y + height / 2
      const radiusX = width / 2
      const radiusY = height / 2

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)

      ctx.strokeStyle = '#4ECDC4'
      ctx.lineWidth = 3
      ctx.setLineDash([10, 5])
      ctx.beginPath()
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      const handleSize = 16
      const corners = [
        { x: -radiusX, y: -radiusY, label: 'tl' },
        { x: radiusX, y: -radiusY, label: 'tr' },
        { x: -radiusX, y: radiusY, label: 'bl' },
        { x: radiusX, y: radiusY, label: 'br' },
      ]

      ctx.fillStyle = '#4ECDC4'
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      corners.forEach((corner) => {
        ctx.beginPath()
        ctx.arc(corner.x, corner.y, handleSize / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      })

      const rotateHandleY = -radiusY - 40
      ctx.beginPath()
      ctx.moveTo(0, -radiusY)
      ctx.lineTo(0, rotateHandleY + 10)
      ctx.strokeStyle = '#FFA07A'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(0, rotateHandleY, handleSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = '#FFA07A'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.stroke()

      ctx.restore()
    }
  }

  const getMousePos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX =
      'clientX' in e ? e.clientX : e.touches?.[0]?.clientX ?? 0
    const clientY =
      'clientY' in e ? e.clientY : e.touches?.[0]?.clientY ?? 0

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    return { x, y }
  }

  const getHandleAtPoint = (mouseX: number, mouseY: number): string | null => {
    if (!ovalBounds) return null

    const { x, y, width, height, rotation = 0 } = ovalBounds
    const centerX = x + width / 2
    const centerY = y + height / 2
    const radiusX = width / 2
    const radiusY = height / 2

    const rad = -(rotation * Math.PI) / 180
    const dx = mouseX - centerX
    const dy = mouseY - centerY
    const localX = dx * Math.cos(rad) - dy * Math.sin(rad)
    const localY = dx * Math.sin(rad) + dy * Math.cos(rad)

    const handleSize = 30

    const rotateHandleY = -radiusY - 40
    if (
      Math.abs(localX) < handleSize &&
      Math.abs(localY - rotateHandleY) < handleSize
    ) {
      return 'rotate'
    }

    const corners = [
      { x: -radiusX, y: -radiusY, label: 'tl' },
      { x: radiusX, y: -radiusY, label: 'tr' },
      { x: -radiusX, y: radiusY, label: 'bl' },
      { x: radiusX, y: radiusY, label: 'br' },
    ]

    for (const corner of corners) {
      if (
        Math.abs(localX - corner.x) < handleSize &&
        Math.abs(localY - corner.y) < handleSize
      ) {
        return corner.label
      }
    }

    const normalizedX = localX / radiusX
    const normalizedY = localY / radiusY
    const distanceFromCenter =
      normalizedX * normalizedX + normalizedY * normalizedY

    if (distanceFromCenter <= 1) {
      return 'move'
    }

    return null
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const pos = getMousePos(e as unknown as MouseEvent | TouchEvent)

    if (ovalBounds) {
      const handle = getHandleAtPoint(pos.x, pos.y)
      if (handle) {
        setDragMode(handle)
        setDragStart(pos)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    e.preventDefault()
    const pos = getMousePos(e as unknown as MouseEvent | TouchEvent)

    if (dragMode && dragStart && ovalBounds) {
      const dx = pos.x - dragStart.x
      const dy = pos.y - dragStart.y
      const currentBounds = tempBounds || ovalBounds

      if (dragMode === 'move') {
        const newBounds = {
          ...currentBounds,
          x: currentBounds.x + dx,
          y: currentBounds.y + dy,
        }
        setTempBounds(newBounds)
        setDragStart(pos)
      } else if (dragMode === 'rotate') {
        const centerX = currentBounds.x + currentBounds.width / 2
        const centerY = currentBounds.y + currentBounds.height / 2
        const angle =
          (Math.atan2(pos.y - centerY, pos.x - centerX) * 180) / Math.PI + 90
        setTempBounds({
          ...currentBounds,
          rotation: angle,
        })
      } else if (
        dragMode.includes('t') ||
        dragMode.includes('b') ||
        dragMode.includes('l') ||
        dragMode.includes('r')
      ) {
        const bounds = { ...currentBounds }
        const centerX = bounds.x + bounds.width / 2
        const centerY = bounds.y + bounds.height / 2

        const aspectRatio = bounds.height / bounds.width

        const distX = Math.abs(pos.x - centerX)
        const distY = Math.abs(pos.y - centerY)

        let newWidth: number, newHeight: number
        if (distX / bounds.width > distY / bounds.height) {
          newWidth = Math.max(40, distX * 2)
          newHeight = newWidth * aspectRatio
        } else {
          newHeight = Math.max(40, distY * 2)
          newWidth = newHeight / aspectRatio
        }

        bounds.width = newWidth
        bounds.height = newHeight
        bounds.x = centerX - bounds.width / 2
        bounds.y = centerY - bounds.height / 2

        setTempBounds(bounds)
        setDragStart(pos)
      }
    } else if (ovalBounds) {
      const handle = getHandleAtPoint(pos.x, pos.y)
      const canvas = canvasRef.current
      if (handle === 'rotate') {
        canvas.style.cursor = 'grab'
      } else if (handle === 'move') {
        canvas.style.cursor = 'move'
      } else if (handle) {
        canvas.style.cursor = 'nwse-resize'
      } else {
        canvas.style.cursor = 'default'
      }
    }
  }

  const handleMouseUp = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault()
    if (dragMode && tempBounds) {
      setOvalBounds(tempBounds)
      setTempBounds(null)
    }
    setDragMode(null)
    setDragStart(null)
  }

  const handleReset = () => {
    if (initialOvalBounds) {
      setOvalBounds({ ...initialOvalBounds })
    }
    onReset?.()
  }

  const handleCrop = () => {
    if (!ovalBounds || !imageObj) return
    onContinue?.()

    const cropCanvas = document.createElement('canvas')
    const { x, y, width, height } = ovalBounds
    cropCanvas.width = width
    cropCanvas.height = height

    const ctx = cropCanvas.getContext('2d')
    if (!ctx) return

    const imgScale = Math.min(
      canvasSize.width / imageObj.width,
      canvasSize.height / imageObj.height
    )
    const scaledWidth = imageObj.width * imgScale
    const scaledHeight = imageObj.height * imgScale
    const offsetX = (canvasSize.width - scaledWidth) / 2
    const offsetY = (canvasSize.height - scaledHeight) / 2

    ctx.drawImage(
      imageObj,
      (x - offsetX) / imgScale,
      (y - offsetY) / imgScale,
      width / imgScale,
      height / imgScale,
      0,
      0,
      width,
      height
    )

    const croppedDataUrl = cropCanvas.toDataURL('image/png')
    onCropComplete(croppedDataUrl)
  }

  if (isLoading || !isReady) {
    return (
      <div className={styles.cropEditor}>
        <div className={styles.cropInstructionsContainer}>
          <p className={styles.cropInstructionText}>⏳ loading face detection models...</p>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.cropEditor}>
      <div className={styles.cropInstructionsContainer}>
        <p className={styles.cropInstructionText}>adjust until your face fills the oval</p>
      </div>

      <div className={styles.cropCanvasContainer}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className={styles.cropCanvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{
            cursor: dragMode ? 'grabbing' : 'default',
            touchAction: 'none',
          }}
        />
      </div>

      <button
        data-reset-button
        onClick={handleReset}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <button
        data-continue-button
        ref={continueButtonRef}
        onClick={handleCrop}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  )
}

