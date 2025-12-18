/**
 * Convert HEIC/HEIF files to a format the browser can handle
 */

export const isHeicFile = (file: File): boolean => {
  const heicTypes = [
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence',
  ]
  const heicExtensions = ['.heic', '.heif', '.hif']
  
  // Check MIME type
  if (heicTypes.includes(file.type.toLowerCase())) {
    return true
  }
  
  // Check file extension (fallback for cases where MIME type might not be set correctly)
  const fileName = file.name.toLowerCase()
  return heicExtensions.some(ext => fileName.endsWith(ext))
}

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  try {
    // Dynamically import heic2any to avoid issues if package is not installed
    const heic2any = (await import('heic2any')).default
    
    // Convert HEIC to JPEG
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    })
    
    // heic2any returns an array of blobs (for sequences) or a single blob
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
    
    // Create a new File object with the converted blob
    const convertedFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif|hif)$/i, '.jpg'),
      { type: 'image/jpeg' }
    )
    
    return convertedFile
  } catch (error) {
    throw new Error('Failed to convert HEIC file. Please try converting it to JPEG first.')
  }
}

