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
  ovalBounds: OvalBounds,
  transparentBackground: boolean = false
) => {
  // Use imageSmoothingEnabled for better quality/performance balance
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.save()

  if (!transparentBackground) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }

  // Create clipping path for oval
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

  // Draw user image with transform
  ctx.save()
  ctx.translate(transform.x, transform.y)
  ctx.scale(transform.scale, transform.scale)
  if (transform.rotation !== 0) {
    ctx.rotate((transform.rotation * Math.PI) / 180)
  }
  ctx.drawImage(userImage, 0, 0)
  ctx.restore()

  ctx.restore()

  // Draw template on top
  ctx.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight)
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

  // Calculate oval bounds directly without creating unnecessary canvas
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
  const userImage = await loadImage(userImageUrl)

  const [cardTemplate, kevinTemplate] = await Promise.all([
    loadTemplate(canvasWidth, canvasHeight, '/images/card-template.svg'),
    loadTemplate(canvasWidth, canvasHeight, '/images/kevin-template.svg'),
  ])

  const cardCanvas = document.createElement('canvas')
  cardCanvas.width = canvasWidth
  cardCanvas.height = canvasHeight
  const cardCtx = cardCanvas.getContext('2d', {
    willReadFrequently: false, // Optimize for write operations
    alpha: true,
  })
  if (!cardCtx) {
    throw new Error('Could not get card canvas context')
  }

  const kevinCanvas = document.createElement('canvas')
  kevinCanvas.width = canvasWidth
  kevinCanvas.height = canvasHeight
  const kevinCtx = kevinCanvas.getContext('2d', {
    willReadFrequently: false, // Optimize for write operations
    alpha: true,
  })
  if (!kevinCtx) {
    throw new Error('Could not get kevin canvas context')
  }

  const ovalBounds = getOvalConfiguration(canvasWidth, canvasHeight)

  // Draw both composites
  drawComposite(
    cardCtx,
    canvasWidth,
    canvasHeight,
    userImage,
    cardTemplate.templateImage,
    transform,
    ovalBounds,
    false
  )

  drawComposite(
    kevinCtx,
    canvasWidth,
    canvasHeight,
    userImage,
    kevinTemplate.templateImage,
    transform,
    ovalBounds,
    true
  )

  // Convert to data URLs - using toDataURL is actually faster than blob->dataURL conversion
  // but we yield to the browser between operations for better responsiveness
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const cardComposite = cardCanvas.toDataURL('image/png', 0.95)
      requestAnimationFrame(() => {
        const kevinComposite = kevinCanvas.toDataURL('image/png', 0.95)
        resolve({
          cardComposite,
          kevinComposite,
        })
      })
    })
  })
}

