/**
 * Compresses an image file proportionally using HTML5 Canvas and returns a base64 JPEG data URL.
 *
 * @param file - The image file to compress
 * @param maxWidth - The maximum width/dimension in pixels (default: 800)
 * @param quality - The JPEG quality from 0.0 to 1.0 (default: 0.75)
 * @returns Promise resolving to the compressed base64 JPEG data URL
 */
export function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        const maxDimension = maxWidth;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // If canvas 2D context is unavailable, fallback to original data URL
          resolve(reader.result as string);
          return;
        }

        // Fill white background to prevent transparent PNGs from having black backgrounds in JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
