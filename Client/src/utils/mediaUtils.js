/**
 * Media Utilities for HeartEcho
 * Includes watermarking logic for images and videos.
 */

/**
 * Applies a watermark to an image or video file.
 * @param {File} file - The file to watermark.
 * @returns {Promise<File>} - The watermarked file.
 */
export const applyWatermark = async (file) => {
  if (!file) return file;

  try {
    if (file.type.startsWith('image/')) {
      return await applyWatermarkToImage(file);
    } 
    // Video watermarking removed as per user request to avoid performance/glitch issues
    return file;
  } catch (error) {
    console.error("Watermark application failed:", error);
    return file; 
  }
};

/**
 * Watermarks an image using Canvas.
 */
const applyWatermarkToImage = async (file) => {
  const logo = await loadLogo().catch(() => null);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(img, 0, 0);

        // 1. Draw Logo (Top Left)
        if (logo) {
          const logoWidth = Math.max(25, Math.floor(canvas.width * 0.08));
          const logoHeight = (logo.height / logo.width) * logoWidth;
          const padding = Math.max(8, Math.floor(canvas.width * 0.02));
          
          ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
          ctx.shadowBlur = 10;
          ctx.drawImage(logo, padding, padding, logoWidth, logoHeight);
          ctx.shadowBlur = 0;
        }

        // 2. Draw Text (Bottom Right)
        const fontSize = Math.max(16, Math.floor(img.width * 0.04));
        ctx.font = `italic 700 ${fontSize}px "Inter", sans-serif`;
        
        // Visibility: Dark color with white glow
        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 15;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        const paddingText = Math.max(10, Math.floor(img.width * 0.03));
        ctx.fillText('heartecho.in', canvas.width - paddingText, canvas.height - paddingText);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, file.type, 0.9);
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
};

/**
 * Loads the brand logo from public directory
 */
const loadLogo = () => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = '/heartecho_b.png';
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};
