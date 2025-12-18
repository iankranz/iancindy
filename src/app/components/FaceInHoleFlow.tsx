'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, X, Download, Share2, Camera, RotateCcw } from 'lucide-react'
import InfoScreen from './InfoScreen'
import CameraCapture from './CameraCapture'
import CropEditorHandles from './CropEditorHandles'
import ResultScreen from './ResultScreen'
import { createDualComposites, type Transform } from '../utils/canvasHelpers'
import { TEMPLATE_CONFIG } from '../utils/templateConfig'
import type { FaceData } from '../hooks/useFaceDetection'
import { isHeicFile, convertHeicToJpeg } from '../utils/heicConverter'
import styles from './FaceInHoleModal.module.css'

const TEMPLATE_WIDTH = 1000
const TEMPLATE_HEIGHT = 1389

type FlowStep = 'capture' | 'crop' | 'result'

interface FaceInHoleFlowProps {
  onReplaceKevin: (kevinCompositeUrl: string) => void
  onClose: () => void
}

export default function FaceInHoleFlow({
  onReplaceKevin,
  onClose,
}: FaceInHoleFlowProps) {
  const [step, setStep] = useState<FlowStep>('capture')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [faceData, setFaceData] = useState<FaceData | null>(null)
  const [isFromCamera, setIsFromCamera] = useState(false)
  const [cardCompositeUrl, setCardCompositeUrl] = useState<string | null>(null)
  const [kevinCompositeUrl, setKevinCompositeUrl] = useState<string | null>(
    null
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraStarted, setCameraStarted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageCapture = async (
    image: string,
    face: FaceData | null,
    fromCamera: boolean
  ) => {
    setCapturedImage(image)
    setFaceData(face)
    setIsFromCamera(fromCamera)

    if (fromCamera) {
      setCroppedImage(image)
      await processImage(image)
    } else {
      setStep('crop')
    }
  }

  const handleCropComplete = async (croppedImg: string) => {
    setCroppedImage(croppedImg)
    await processImage(croppedImg)
  }

  const processImage = async (imageUrl: string) => {
    setIsProcessing(true)
    try {
      const config = TEMPLATE_CONFIG
      
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      const templateWidth = TEMPLATE_WIDTH
      const templateHeight = TEMPLATE_HEIGHT
      const templateAspectRatio = templateHeight / templateWidth
      
      const templateOvalWidth = config.oval.radiusX * 2 * templateWidth
      const templateOvalHeight = config.oval.radiusY * 2 * templateHeight
      const templateOvalCenterX = config.oval.centerX * templateWidth
      const templateOvalCenterY = config.oval.centerY * templateHeight

      const imageWidth = img.width
      const imageHeight = img.height
      const imageAspectRatio = imageHeight / imageWidth

      const aspectRatioTolerance = 0.01
      const isCameraCapture = Math.abs(imageAspectRatio - templateAspectRatio) < aspectRatioTolerance

      let scale: number
      let x: number
      let y: number

      if (isCameraCapture) {
        const captureOvalWidth = config.oval.radiusX * 2 * imageWidth
        const captureOvalHeight = config.oval.radiusY * 2 * imageHeight

        const scaleX = templateOvalWidth / captureOvalWidth
        const scaleY = templateOvalHeight / captureOvalHeight
        
        scale = Math.max(scaleX, scaleY)

        const scaledWidth = imageWidth * scale
        const scaledHeight = imageHeight * scale
        x = templateOvalCenterX - scaledWidth / 2
        y = templateOvalCenterY - scaledHeight / 2
      } else {
        const scaleX = templateOvalWidth / imageWidth
        const scaleY = templateOvalHeight / imageHeight
        
        scale = Math.max(scaleX, scaleY)

        const scaledWidth = imageWidth * scale
        const scaledHeight = imageHeight * scale
        x = templateOvalCenterX - scaledWidth / 2
        y = templateOvalCenterY - scaledHeight / 2
      }

      const transform: Transform = {
        x,
        y,
        scale,
        rotation: config.oval.rotation || 0,
      }

      const { cardComposite, kevinComposite } = await createDualComposites(
        imageUrl,
        transform,
        templateWidth,
        templateHeight
      )

      setCardCompositeUrl(cardComposite)
      setKevinCompositeUrl(kevinComposite)
      setStep('result')
    } catch (error) {
      alert('Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    if (step === 'crop') {
      setStep('capture')
      setCapturedImage(null)
      setFaceData(null)
      setCameraStarted(false)
    }
  }

  const getStepHeader = () => {
    if (step === 'capture') return 'take a pic'
    if (step === 'crop') return 'upload'
    if (step === 'result') return 'tada!'
    return ''
  }

  const handleBackFromHeader = () => {
    if (step === 'crop') {
      handleBack()
    } else if (step === 'capture' && cameraStarted) {
      setCameraStarted(false)
    } else {
      onClose()
    }
  }

  const showBackButton = () => {
    return (step === 'capture' && cameraStarted) || step === 'crop'
  }

  const handleStartOver = () => {
    setStep('capture')
    setCapturedImage(null)
    setCroppedImage(null)
    setFaceData(null)
    setIsFromCamera(false)
    setCardCompositeUrl(null)
    setKevinCompositeUrl(null)
    setCameraStarted(false)
  }

  const handleReplaceKevin = (url: string) => {
    onReplaceKevin(url)
    onClose()
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
        if (imageDataUrl) {
          handleImageCapture(imageDataUrl, null, false)
        }
      }
      reader.readAsDataURL(fileToProcess)
    }
  }
  
  const handleTakePicture = () => {
    setCameraStarted(true)
  }
  
  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      {!(step === 'capture' && !cameraStarted) && (
        <div className={styles.stepHeader}>
          {step === 'result' ? (
            <button
              className={styles.stepHeaderBack}
              onClick={handleStartOver}
              aria-label="Start over"
            >
              <RotateCcw size={24} />
            </button>
          ) : showBackButton() ? (
            <button
              className={styles.stepHeaderBack}
              onClick={handleBackFromHeader}
              aria-label="Back"
            >
              <ArrowLeft size={24} />
            </button>
          ) : null}
          <h1 className={styles.stepHeaderText}>{getStepHeader()}</h1>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
      )}
      {step === 'capture' && !cameraStarted && (
        <>
          <button
            className={`${styles.modalClose} ${styles.modalCloseStandalone}`}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <InfoScreen
            onTakePicture={handleTakePicture}
            onUpload={handleUpload}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif,.hif"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <div className={styles.modalFooter}>
            <div className={styles.modalFooterRow}>
              <button
                className={`${styles.modalFooterButton} ${styles.modalFooterButtonSecondary}`}
                onClick={handleUpload}
              >
                Upload
              </button>
              <button
                className={`${styles.modalFooterButton} ${styles.modalFooterButtonPrimary}`}
                onClick={handleTakePicture}
              >
                Take a pic
              </button>
            </div>
          </div>
        </>
      )}
      {step === 'capture' && cameraStarted && (
        <>
          <CameraCapture
            onImageCapture={handleImageCapture}
            onBack={() => {
              setCameraStarted(false)
            }}
            skipInitialScreen={true}
            onCapture={() => {
              const captureButton = document.querySelector('[data-capture-button]') as HTMLButtonElement
              captureButton?.click()
            }}
          />
          <div className={styles.modalFooter}>
            <button
              className={`${styles.modalFooterButton} ${styles.modalFooterButtonPrimary}`}
              onClick={() => {
                const captureButton = document.querySelector('[data-capture-button]') as HTMLButtonElement
                captureButton?.click()
              }}
            >
              <Camera size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              Capture
            </button>
          </div>
        </>
      )}
      {step === 'crop' && capturedImage && (
        <>
          <CropEditorHandles
            userImage={capturedImage}
            onCropComplete={handleCropComplete}
          />
          <div className={styles.modalFooter}>
            <div className={styles.modalFooterRow}>
              <button
                className={`${styles.modalFooterButton} ${styles.modalFooterButtonSecondary}`}
                onClick={() => {
                  const resetButton = document.querySelector('[data-reset-button]') as HTMLButtonElement
                  resetButton?.click()
                }}
              >
                Reset
              </button>
              <button
                className={`${styles.modalFooterButton} ${styles.modalFooterButtonPrimary}`}
                onClick={() => {
                  const continueButton = document.querySelector('[data-continue-button]') as HTMLButtonElement
                  continueButton?.click()
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}
      {step === 'result' &&
        cardCompositeUrl &&
        kevinCompositeUrl && (
          <>
            <ResultScreen
              cardCompositeUrl={cardCompositeUrl}
              kevinCompositeUrl={kevinCompositeUrl}
              onReplaceKevin={handleReplaceKevin}
            />
            <div className={styles.modalFooter}>
              <div className={styles.modalFooterRow}>
                <button
                  className={`${styles.modalFooterButton} ${styles.modalFooterButtonSecondary}`}
                  onClick={async () => {
                    try {
                      const img = new Image()
                      img.onload = async () => {
                        const canvas = document.createElement('canvas')
                        canvas.width = img.width
                        canvas.height = img.height
                        const ctx = canvas.getContext('2d')
                        if (!ctx) return
                        ctx.drawImage(img, 0, 0)
                        const blob = await canvas.toBlob((b) => {
                          if (b) {
                            const url = URL.createObjectURL(b)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = `face-in-hole-${Date.now()}.png`
                            link.click()
                            URL.revokeObjectURL(url)
                          }
                        })
                      }
                      img.src = cardCompositeUrl
                    } catch (error) {
                      // Download failed silently
                    }
                  }}
                >
                  <Download size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Download
                </button>
                <button
                  className={`${styles.modalFooterButton} ${styles.modalFooterButtonSecondary}`}
                  onClick={async () => {
                    try {
                      const img = new Image()
                      img.onload = async () => {
                        const canvas = document.createElement('canvas')
                        canvas.width = img.width
                        canvas.height = img.height
                        const ctx = canvas.getContext('2d')
                        if (!ctx) return
                        ctx.drawImage(img, 0, 0)
                        const blob = await canvas.toBlob((b) => {
                          if (b) {
                            const file = new File([b], `face-in-hole-${Date.now()}.png`, {
                              type: 'image/png',
                            })
                            if (navigator.share && navigator.canShare({ files: [file] })) {
                              navigator.share({
                                files: [file],
                                title: 'My Face-in-Hole Creation',
                                text: 'Check out my face-in-hole creation!',
                              }).catch(() => {})
                            } else {
                              const url = URL.createObjectURL(b)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = `face-in-hole-${Date.now()}.png`
                              link.click()
                              URL.revokeObjectURL(url)
                            }
                          }
                        })
                      }
                      img.src = cardCompositeUrl
                    } catch (error) {
                      // Share failed silently
                    }
                  }}
                >
                  <Share2 size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  share
                </button>
              </div>
              <button
                className={`${styles.modalFooterButton} ${styles.modalFooterButtonPrimary} ${styles.modalFooterButtonFullWidth}`}
                onClick={() => handleReplaceKevin(kevinCompositeUrl)}
              >
                You are kevin!
              </button>
            </div>
          </>
        )}
    </>
  )
}

