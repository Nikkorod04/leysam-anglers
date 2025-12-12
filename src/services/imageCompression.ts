import * as ImageManipulator from 'expo-image-manipulator';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1400, // Not used anymore, kept for future use
  maxHeight: 1400,
  quality: 0.45, // 45% quality - aggressive compression for Firebase free tier
};

/**
 * Compress an image to reduce storage and bandwidth usage
 * Reduces image size by compressing quality without resizing
 * Preserves original aspect ratio perfectly
 * 
 * @param imageUri - URI of the image to compress
 * @param options - Compression options (quality)
 * @returns Compressed image blob
 */
export const compressImage = async (
  imageUri: string,
  options: CompressionOptions = {}
): Promise<Blob> => {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    console.log('Starting image compression...');
    
    // Compress using ImageManipulator with quality reduction only (no resizing)
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [], // Empty actions array = no resizing, just quality compression
      {
        compress: finalOptions.quality!,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('Manipulated image URI:', manipulatedImage.uri);

    // Fetch the compressed image and get its size
    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();
    const fileSizeKB = (blob.size / 1024).toFixed(2);
    
    console.log(`✓ Image compressed successfully: ${fileSizeKB} KB`);
    return blob;
  } catch (error) {
    console.error('Error compressing image:', error);
    
    // Fallback: try to compress with lower quality
    try {
      console.log('Attempting fallback compression with lower quality...');
      const fallbackImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const fallbackResponse = await fetch(fallbackImage.uri);
      const fallbackBlob = await fallbackResponse.blob();
      const fallbackSizeKB = (fallbackBlob.size / 1024).toFixed(2);
      
      console.log(`✓ Fallback compression successful: ${fallbackSizeKB} KB`);
      return fallbackBlob;
    } catch (fallbackError) {
      console.error('Fallback compression also failed:', fallbackError);
      // Last resort: return original image
      const response = await fetch(imageUri);
      const originalBlob = await response.blob();
      console.log(`⚠ Using original image: ${(originalBlob.size / 1024).toFixed(2)} KB`);
      return originalBlob;
    }
  }
};

/**
 * Compress multiple images (useful for batch uploads)
 * 
 * @param imageUris - Array of image URIs to compress
 * @param options - Compression options
 * @returns Array of compressed image blobs
 */
export const compressImages = async (
  imageUris: string[],
  options: CompressionOptions = {}
): Promise<Blob[]> => {
  const compressedImages = await Promise.all(
    imageUris.map(uri => compressImage(uri, options))
  );
  return compressedImages;
};

/**
 * Get file size in KB for logging
 */
export const getFileSizeKB = (blob: Blob): number => {
  return blob.size / 1024;
};
