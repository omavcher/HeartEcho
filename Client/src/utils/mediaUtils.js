/**
 * Media Utilities for HeartEcho
 * Includes watermarking logic for images and videos.
 */

/**
 * Applies a watermark to an image or video file.
 * @param {File} file - The file to watermark.
 * @returns {Promise<File>} - The watermarked file.
 */
const CROP_BOTTOM_PERCENT = 0.06;
const CROP_SIDE_PERCENT = CROP_BOTTOM_PERCENT / 2;

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
    if (file.type.startsWith('video/')) {
      return await cropVideo(file);
    }
    return file;
  } catch (error) {
    console.error("Watermark/Crop application failed:", error);
    return file; 
  }
};

/**
 * Watermarks and crops an image using Canvas.
 */
const applyWatermarkToImage = async (file) => {
  const logo = await loadLogo().catch(() => null);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions to preserve aspect ratio
        const newWidth = Math.floor(img.width * (1 - CROP_BOTTOM_PERCENT));
        const newHeight = Math.floor(img.height * (1 - CROP_BOTTOM_PERCENT));
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        
        // Define crop window from original image
        const sourceX = Math.floor(img.width * CROP_SIDE_PERCENT);
        const sourceY = 0;
        
        // Crop the bottom watermark and the sides to preserve aspect ratio
        ctx.drawImage(img, sourceX, sourceY, newWidth, newHeight, 0, 0, newWidth, newHeight);

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
        const fontSize = Math.max(16, Math.floor(newWidth * 0.04));
        ctx.font = `italic 700 ${fontSize}px "Inter", sans-serif`;
        
        // Visibility: Dark color with white glow
        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 15;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        const paddingText = Math.max(10, Math.floor(newWidth * 0.03));
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
 * Crops a video client-side using Canvas and MediaRecorder to remove bottom-right watermarks.
 */
const cropVideo = async (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    // Safety timeout to resolve with original file if metadata loading fails
    const safetyTimeout = setTimeout(() => {
      console.warn("Video metadata loading timed out. Falling back to original video file.");
      resolve(file);
    }, 8000);

    video.onloadedmetadata = () => {
      clearTimeout(safetyTimeout);
      
      const W = video.videoWidth;
      const H = video.videoHeight;
      if (!W || !H) {
        console.warn("Could not determine video dimensions, falling back.");
        resolve(file);
        return;
      }

      // Calculate cropped size to remove bottom 6% while preserving aspect ratio
      const cropHeight = H * CROP_BOTTOM_PERCENT;
      const cropWidthSide = W * CROP_SIDE_PERCENT;
      
      const newW = Math.floor(W - (cropWidthSide * 2));
      const newH = Math.floor(H - cropHeight);

      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(30); // Capture at 30 FPS
      let combinedStream = stream;

      // Extract original audio tracks if available to preserve sound
      try {
        const videoStream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null);
        if (videoStream) {
          const audioTracks = videoStream.getAudioTracks();
          if (audioTracks.length > 0) {
            combinedStream = new MediaStream([...stream.getVideoTracks(), ...audioTracks]);
          }
        }
      } catch (err) {
        console.warn("Could not copy audio tracks. Video will be processed without sound or fallback.", err);
      }

      // Choose a mimeType supported by the browser
      let mediaRecorder;
      try {
        const mimeTypes = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
          'video/mp4;codecs=h264',
          'video/mp4'
        ];
        
        let selectedMime = '';
        for (const mime of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mime)) {
            selectedMime = mime;
            break;
          }
        }
        
        mediaRecorder = new MediaRecorder(combinedStream, selectedMime ? { mimeType: selectedMime } : {});
      } catch (err) {
        console.warn("Failed to initialize MediaRecorder, falling back to original:", err);
        resolve(file);
        return;
      }

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType || file.type });
          let name = file.name;
          // Sync extension if format was changed to webm
          if (mediaRecorder.mimeType.includes('webm') && !name.endsWith('.webm')) {
            name = name.substring(0, name.lastIndexOf('.')) + '.webm';
          }
          const croppedFile = new File([blob], name, { type: blob.type });
          URL.revokeObjectURL(video.src);
          resolve(croppedFile);
        } catch (e) {
          console.error("Error finalizing cropped video file:", e);
          resolve(file);
        }
      };

      let animationFrameId;
      const drawFrame = () => {
        if (video.paused || video.ended) {
          if (mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          return;
        }

        ctx.drawImage(
          video,
          cropWidthSide, 0, newW, newH, // Source (cropped bounding box)
          0, 0, newW, newH // Destination
        );

        if (video.requestVideoFrameCallback) {
          video.requestVideoFrameCallback(drawFrame);
        } else {
          animationFrameId = requestAnimationFrame(drawFrame);
        }
      };

      video.onplay = () => {
        try {
          mediaRecorder.start();
          if (video.requestVideoFrameCallback) {
            video.requestVideoFrameCallback(drawFrame);
          } else {
            animationFrameId = requestAnimationFrame(drawFrame);
          }
        } catch (err) {
          console.warn("Failed to start MediaRecorder recording, falling back.", err);
          resolve(file);
        }
      };

      video.onended = () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };

      video.onerror = (err) => {
        console.warn("Video playback encountered error, stopping recorder.", err);
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        } else {
          resolve(file);
        }
      };

      video.play().catch((err) => {
        console.warn("Failed to play video during crop processing, falling back.", err);
        resolve(file);
      });
    };

    video.onerror = (err) => {
      console.warn("Video loaded error, resolving original file.", err);
      clearTimeout(safetyTimeout);
      resolve(file);
    };
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
