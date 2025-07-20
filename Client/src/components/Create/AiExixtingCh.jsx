import { useState } from "react";
import PopNoti from "../PopNoti";

function AiExixtingCh({ aigender, onClose, onSelect }) {
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  let imagePaths = []; // Declare the array before the if conditions

  if (aigender === "female") {
    imagePaths = [
      "/models_images_female/exixting/1.jpg",
      "/models_images_female/exixting/2.jpg",
      "/models_images_female/exixting/3.jpg",
      "/models_images_female/exixting/4.jpg",
      "/models_images_female/exixting/5.jpg",
      "/models_images_female/exixting/6.jpg",
      "/models_images_female/exixting/7.jpg",
      "/models_images_female/exixting/8.jpg",
      "/models_images_female/exixting/9.jpg",
      "/models_images_female/exixting/10.jpg",
      "/models_images_female/exixting/11.jpg",
      "/models_images_female/exixting/12.jpg",
      "/models_images_female/exixting/13.jpg",
      "/models_images_female/exixting/14.jpg",
      "/models_images_female/exixting/15.jpg",
      "/models_images_female/exixting/16.jpg",
    ];
  } else if (aigender === "male") {
    imagePaths = [
      "/models_images_male/exixting/1.jpg",
      "/models_images_male/exixting/2.jpg",
      "/models_images_male/exixting/3.jpg",
      "/models_images_male/exixting/4.jpg",
      "/models_images_male/exixting/5.jpg",
      "/models_images_male/exixting/6.jpg",
      "/models_images_male/exixting/7.jpg",
      "/models_images_male/exixting/8.jpg",
      "/models_images_male/exixting/9.jpg",
      "/models_images_male/exixting/10.jpg",
      "/models_images_male/exixting/11.jpg",
      "/models_images_male/exixting/12.jpg",
      "/models_images_male/exixting/13.jpg",
      "/models_images_male/exixting/14.jpg",
      "/models_images_male/exixting/15.jpg",
      "/models_images_male/exixting/16.jpg",
    ];
  }

  const handleImageClick = (src) => {
    if (onSelect) {
      onSelect(src);
      setNotification({ show: true, message: "Character Selected Successfully!", type: "success" });
    }
    if (onClose) {
      setTimeout(onClose, 1500); // Delay closing to let the notification appear
    }
  };

  return (
    <div className="character-box">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <header>
        <h1>Choose Character</h1>
        <button onClick={onClose} className="create-aixclose-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.0003 13.0001L22.0004 11.0002L5.82845 11.0002L9.77817 7.05044L8.36396 5.63623L2 12.0002L8.36396 18.3642L9.77817 16.9499L5.8284 13.0002L22.0003 13.0001Z"></path>
          </svg>
          Back
        </button>
      </header>

      <div className="show-theimage-grids">
        {imagePaths.map((src, index) => (
          <img key={index} src={src} alt={`Character ${index + 1}`} onClick={() => handleImageClick(src)} />
        ))}
      </div>
    </div>
  );
}

export default AiExixtingCh;
