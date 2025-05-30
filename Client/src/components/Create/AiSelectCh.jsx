import React, { useState } from "react";
import PopNoti from "../PopNoti";

function AiSelectCh({ onClose ,onSelect ,aigender}) {
  const [notification, setNotification] = useState({ show: false, message: "", type: "" }); 
  const [ethnicity, setEthnicity] = useState(null);
  const [eyeColor, setEyeColor] = useState(null);
  const [hairStyle, setHairStyle] = useState(null);
  const [bodyType, setBodyType] = useState(null);


  const EthnicityimagePaths = [];
  const EyesimagePaths = [];
  const HairStyles = [];
  const BodyTypes = [];
  
  if (aigender === "female") {
    EthnicityimagePaths.push(
      { name: "East India", src: "/models_images_female/Ethnic/east_india.jpg" },
      { name: "North-East India", src: "/models_images_female/Ethnic/north_east_india.jpg" },
      { name: "South India", src: "/models_images_female/Ethnic/south_india.jpg" },
      { name: "West India", src: "/models_images_female/Ethnic/west_india.jpg" },
      { name: "North India", src: "/models_images_female/Ethnic/north_india.jpg" }
    );
  
    EyesimagePaths.push(
      { name: "Black", src: "/models_images_female/Eyes/black.jpg" },
      { name: "Brown", src: "/models_images_female/Eyes/brown.jpg" },
      { name: "Gray", src: "/models_images_female/Eyes/gray.jpg" },
      { name: "Blue", src: "/models_images_female/Eyes/blue.jpg" }
    );
  
    HairStyles.push(
      { name: "Straight", src: "/models_images_female/Hair/long.jpg" },
      { name: "Curly", src: "/models_images_female/Hair/curly.jpg" },
      { name: "Ponytail", src: "/models_images_female/Hair/ponytail.jpg" },
      { name: "Braids", src: "/models_images_female/Hair/braids.jpg" }
    );
  
    BodyTypes.push(
      { name: "Skinny", src: "/models_images_female/Body/skinny.jpg" },
      { name: "Slim", src: "/models_images_female/Body/slim.jpg" },
      { name: "Athletic", src: "/models_images_female/Body/athletic.jpg" },
      { name: "Thick", src: "/models_images_female/Body/thick.jpg" }
    );
  } else if (aigender === "male") {
    EthnicityimagePaths.push(
      { name: "East India", src: "/models_images_male/Ethnic/east_india.jpg" },
      { name: "North-East India", src: "/models_images_male/Ethnic/north_east_india.jpg" },
      { name: "South India", src: "/models_images_male/Ethnic/south_india.jpg" },
      { name: "West India", src: "/models_images_male/Ethnic/west_india.jpg" },
      { name: "North India", src: "/models_images_male/Ethnic/north_india.jpg" }
    );
  
    EyesimagePaths.push(
      { name: "Black", src: "/models_images_male/Eyes/black.jpg" },
      { name: "Brown", src: "/models_images_male/Eyes/brown.jpg" },
      { name: "Gray", src: "/models_images_male/Eyes/gray.jpg" },
      { name: "Blue", src: "/models_images_male/Eyes/blue.jpg" }
    );
  
    HairStyles.push(
      { name: "Straight", src: "/models_images_male/Hair/long.jpg" },
      { name: "Curly", src: "/models_images_male/Hair/curly.jpg" },
      { name: "Dreadlocks", src: "/models_images_male/Hair/dreadlocks.jpg" },
      { name: "Buzz Cut", src: "/models_images_male/Hair/buzz.jpg" }
    );
  
    BodyTypes.push(
      { name: "Skinny", src: "/models_images_male/Body/skinny.jpg" },
      { name: "Slim", src: "/models_images_male/Body/slim.jpg" },
      { name: "Athletic", src: "/models_images_male/Body/athletic.jpg" },
      { name: "Thick", src: "/models_images_male/Body/thick.jpg" }
    );
  }
  



  const handleSelect = (type, value) => {
    if (type === "ethnicity") setEthnicity(value);
    else if (type === "eyeColor") setEyeColor(value);
    else if (type === "hairStyle") setHairStyle(value);
    else if (type === "bodyType") {
      setBodyType(value);
  
      const formattedEthnicity = ethnicity.replace(/\s+/g, "_").toLowerCase();

  
      // Generate a random image number from 1 to 12
      const randomImageNumber = Math.floor(Math.random() * 4) + 1;
  
      // Construct final image path using gender and formatted ethnicity
      const genderFolder = aigender === "female" ? "models_images_female" : "models_images_male";
      const finalImage = `/${genderFolder}/Final/${formattedEthnicity}/${randomImageNumber}.jpg`;
  

      if (finalImage) {
        onSelect(finalImage);
        setNotification({ show: true, message: "Character Selected Successfully!", type: "success" });
  
        // Delay closing for 1.5 seconds to let the notification appear
          onClose();
      }
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
        <h1>Create Character</h1>
        <button onClick={onClose} className="create-aixclose-btn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.0003 13.0001L22.0004 11.0002L5.82845 11.0002L9.77817 7.05044L8.36396 5.63623L2 12.0002L8.36396 18.3642L9.77817 16.9499L5.8284 13.0002L22.0003 13.0001Z"></path>
          </svg> 
          Back
        </button>
      </header>

      {/* Select Ethnicity */}
      {!ethnicity && (
        <>
          <h1>Select Ethnicity</h1>
          <div className="show-theimage-grids">
            {EthnicityimagePaths.map(({ name, src }, index) => (
              <div key={index} className="theimage-grids-sdwd">
                <img src={src} alt={name} onClick={() => handleSelect("ethnicity", name)} className="clickable" />
                <h4 style={{ marginTop: "0.4rem" }}>{name}</h4>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Select Eye Color */}
      {ethnicity && !eyeColor && (
        <>
          <h1>Select Eye Color</h1>
          <div className="show-theimage-grids">
            {EyesimagePaths.map(({ name, src }, index) => (
              <div key={index} className="theimage-grids-sdwd">
                <img src={src} alt={name} onClick={() => handleSelect("eyeColor", name)} className="clickable" />
                <h4 style={{ marginTop: "0.4rem" }}>{name}</h4>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Select Hair Style */}
      {eyeColor && !hairStyle && (
        <>
          <h1>Select Hair Style</h1>
          <div className="show-theimage-grids">
            {HairStyles.map(({ name, src }, index) => (
              <div key={index} className="theimage-grids-sdwd">
                <img src={src} alt={name} onClick={() => handleSelect("hairStyle", name)} className="clickable" />
                <h4 style={{ marginTop: "0.4rem" }}>{name}</h4>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Select Body Type */}
      {hairStyle && !bodyType && (
        <>
          <h1>Select Body Type</h1>
          <div className="show-theimage-grids">
            {BodyTypes.map(({ name, src }, index) => (
              <div key={index} className="theimage-grids-sdwd">
                <img src={src} alt={name} onClick={() => handleSelect("bodyType", name)} className="clickable" />
                <h4 style={{ marginTop: "0.4rem" }}>{name}</h4>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AiSelectCh;

