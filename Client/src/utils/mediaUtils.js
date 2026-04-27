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
    if (file.type.startsWith('video/')) {
      return await applyWatermarkToVideo(file);
    }
    return file;
  } catch (error) {
    console.error("Watermark application failed:", error);
    return file; 
  }
};

/**
 * Watermarks a video using Canvas and MediaRecorder.
 * Note: This process takes as long as the video duration.
 */
const applyWatermarkToVideo = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true; // Stay silent during processing
    video.playsInline = true;
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(30); // 30 FPS
      
      // Try to capture audio if possible
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(video);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        if (destination.stream.getAudioTracks().length > 0) {
          stream.addTrack(destination.stream.getAudioTracks()[0]);
        }
      } catch (e) {
        console.warn("Audio capture failed, video will be silent:", e);
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
      });
      
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webm", { type: 'video/webm' }));
        URL.revokeObjectURL(video.src);
      };

      video.onended = () => {
        recorder.stop();
      };

      recorder.start();
      video.play();

      const draw = () => {
        if (video.paused || video.ended) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Watermark
        const fontSize = Math.max(16, Math.floor(canvas.width * 0.04));
        ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
        ctx.fillStyle = 'rgba(255, 105, 180, 0.7)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        
        const padding = Math.max(10, Math.floor(canvas.width * 0.02));
        ctx.fillText('heartecho.in', canvas.width - padding, canvas.height - padding);
        
        requestAnimationFrame(draw);
      };
      
      draw();
    };

    video.onerror = () => reject(new Error("Video load failed"));
  });
};

/**
 * Watermarks an image using Canvas.
 */
const applyWatermarkToImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Watermark settings
        // Responsive font size based on image width
        const fontSize = Math.max(16, Math.floor(img.width * 0.04));
        ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
        
        // Styles from user: pink color, 70% opacity
        // Pink color #ff69b4 with 0.7 opacity
        ctx.fillStyle = 'rgba(255, 105, 180, 0.7)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        // Add a subtle shadow for better readability on bright backgrounds
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const padding = Math.max(10, Math.floor(img.width * 0.02));
        ctx.fillText('heartecho.in', canvas.width - padding, canvas.height - padding);

        // Export as Blob then File
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, file.type, 0.9); // 0.9 quality
      };
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
};
