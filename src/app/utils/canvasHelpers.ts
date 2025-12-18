import { TEMPLATE_CONFIG, type TemplateConfig } from './templateConfig'

/**
 * Load an image from a data URL or URL
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export interface Transform {
  x: number
  y: number
  scale: number
  rotation: number
}

export interface OvalBounds {
  width: number
  height: number
  centerX: number
  centerY: number
}

/**
 * Draw the composite image on canvas
 */
export const drawComposite = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  userImage: HTMLImageElement,
  templateImage: HTMLImageElement,
  transform: Transform,
  ovalBounds: OvalBounds
) => {
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Save context state
  ctx.save()

  // Draw background (white)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Create oval clipping path
  ctx.save()
  ctx.beginPath()
  ctx.ellipse(
    ovalBounds.centerX,
    ovalBounds.centerY,
    ovalBounds.width / 2,
    ovalBounds.height / 2,
    0,
    0,
    Math.PI * 2
  )
  ctx.clip()

  // Draw user image with transforms inside clipping region
  ctx.save()
  ctx.translate(transform.x, transform.y)
  ctx.scale(transform.scale, transform.scale)
  ctx.rotate((transform.rotation * Math.PI) / 180)
  ctx.drawImage(userImage, 0, 0)
  ctx.restore()

  // Restore to remove clip
  ctx.restore()

  // Draw template overlay
  ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight)

  // Restore context
  ctx.restore()
}

/**
 * Get oval bounds from template configuration
 */
export const getOvalConfiguration = (
  canvasWidth: number,
  canvasHeight: number,
  config: TemplateConfig = TEMPLATE_CONFIG
): OvalBounds => {
  if (config.oval) {
    return {
      width: config.oval.radiusX * 2 * canvasWidth,
      height: config.oval.radiusY * 2 * canvasHeight,
      centerX: config.oval.centerX * canvasWidth,
      centerY: config.oval.centerY * canvasHeight,
    }
  }

  return getOvalBounds(canvasWidth, canvasHeight)
}

/**
 * Get oval bounds based on canvas size (fallback)
 */
export const getOvalBounds = (
  canvasWidth: number,
  canvasHeight: number
): OvalBounds => {
  const width = canvasWidth * 0.5
  const height = canvasHeight * 0.6
  const centerX = canvasWidth / 2
  const centerY = canvasHeight * 0.45

  return {
    width,
    height,
    centerX,
    centerY,
  }
}

/**
 * Load template image and return with oval bounds
 */
export const loadTemplate = async (
  width: number,
  height: number,
  templateSrc: string
): Promise<{ templateImage: HTMLImageElement; ovalBounds: OvalBounds }> => {
  const templateImg = await loadImage(templateSrc)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  ctx.drawImage(templateImg, 0, 0, width, height)

  const ovalBounds = getOvalConfiguration(width, height)

  return {
    templateImage: templateImg,
    ovalBounds,
  }
}

/**
 * Export canvas as blob for download/share
 */
export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality: number = 0.95
): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        throw new Error('Failed to create blob')
      }
    }, type, quality)
  })
}

/**
 * Create dual composite images (card-template and kevin-template)
 * Returns both as data URLs
 */
export const createDualComposites = async (
  userImageUrl: string,
  transform: Transform,
  canvasWidth: number = 1000,
  canvasHeight: number = 1389
): Promise<{ cardComposite: string; kevinComposite: string }> => {
  // Load user image
  const userImage = await loadImage(userImageUrl)

  // Load both templates
  const [cardTemplate, kevinTemplate] = await Promise.all([
    loadTemplate(canvasWidth, canvasHeight, '/images/card-template.svg'),
    loadTemplate(canvasWidth, canvasHeight, '/images/kevin-template.svg'),
  ])

  // Create canvas for card composite
  const cardCanvas = document.createElement('canvas')
  cardCanvas.width = canvasWidth
  cardCanvas.height = canvasHeight
  const cardCtx = cardCanvas.getContext('2d')
  if (!cardCtx) {
    throw new Error('Could not get card canvas context')
  }

  // Create canvas for kevin composite
  const kevinCanvas = document.createElement('canvas')
  kevinCanvas.width = canvasWidth
  kevinCanvas.height = canvasHeight
  const kevinCtx = kevinCanvas.getContext('2d')
  if (!kevinCtx) {
    throw new Error('Could not get kevin canvas context')
  }

  // Draw composites (using same oval bounds for both)
  const ovalBounds = getOvalConfiguration(canvasWidth, canvasHeight)

  drawComposite(
    cardCtx,
    canvasWidth,
    canvasHeight,
    userImage,
    cardTemplate.templateImage,
    transform,
    ovalBounds
  )

  drawComposite(
    kevinCtx,
    canvasWidth,
    canvasHeight,
    userImage,
    kevinTemplate.templateImage,
    transform,
    ovalBounds
  )

  return {
    cardComposite: cardCanvas.toDataURL('image/png'),
    kevinComposite: kevinCanvas.toDataURL('image/png'),
  }
}

