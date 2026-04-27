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
const applyWatermarkToVideo = async (file) => {
  const logo = await loadLogo().catch(() => null);

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true; 
    video.playsInline = true;
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(30); 
      
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(video);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        if (destination.stream.getAudioTracks().length > 0) {
          stream.addTrack(destination.stream.getAudioTracks()[0]);
        }
      } catch (e) {
        console.warn("Audio capture failed:", e);
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Dynamic animation (fading/pulsing like premium watermarks)
        const time = video.currentTime;
        const opacity = 0.6 + 0.2 * Math.sin(time * 1.5); // Pulse between 0.4 and 0.8
        ctx.globalAlpha = opacity;

        // 1. Draw Logo (Top Left)
        if (logo) {
          const logoWidth = Math.max(40, Math.floor(canvas.width * 0.15));
          const logoHeight = (logo.height / logo.width) * logoWidth;
          const padding = Math.max(10, Math.floor(canvas.width * 0.03));
          
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 8;
          ctx.drawImage(logo, padding, padding, logoWidth, logoHeight);
          ctx.shadowBlur = 0;
        }

        // 2. Draw Text (Bottom Right)
        const fontSize = Math.max(16, Math.floor(canvas.width * 0.04));
        ctx.font = `italic 700 ${fontSize}px "Inter", sans-serif`;
        
        // Visibility: Dark color with white glow
        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)'; 
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 12;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        const paddingText = Math.max(10, Math.floor(canvas.width * 0.03));
        
        // Subtle animation on text position (optional, keeping it simple but "proper")
        const yOffset = Math.sin(time * 2) * 2; 
        ctx.fillText('heartecho.in', canvas.width - paddingText, canvas.height - paddingText + yOffset);
        
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
        
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
          const logoWidth = Math.max(40, Math.floor(canvas.width * 0.15));
          const logoHeight = (logo.height / logo.width) * logoWidth;
          const padding = Math.max(10, Math.floor(canvas.width * 0.03));
          
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
