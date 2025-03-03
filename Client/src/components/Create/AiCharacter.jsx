import React, { useState } from "react";
import PopNoti from "../PopNoti";

function AiCharacter({ 
  selectedGender, setSelectedGender, 
  selectedRelationship, setSelectedRelationship, 
  selectedInterests, setSelectedInterests, 
  handleNextStep 
}) {
   const options = {
    gender: [
        { id: 'male', label: 'Male', img: '/emojis/man.png' },
        { id: 'female', label: 'Female', img: '/emojis/woman.png' }
    ],
    interests: [
        { id: 'travel', label: 'Travel', img: '/emojis/travel.png' },
        { id: 'cinema', label: 'Cinema', img: '/emojis/cinema.png' },
        { id: 'music', label: 'Music', img: '/emojis/music.png' },
        { id: 'fitness', label: 'Fitness', img: '/emojis/fitness.png' },
        { id: 'tech', label: 'Tech', img: '/emojis/technology.png' },
        { id: 'gaming', label: 'Gaming', img: '/emojis/gaming.png' },
        { id: 'cooking', label: 'Cooking & Food', img: '/emojis/cooking.png' },
        { id: 'sports', label: 'Sports', img: '/emojis/sports.png' },
        { id: 'books', label: 'Books', img: '/emojis/books.png' },
        { id: 'nature', label: 'Nature', img: '/emojis/nature.png' }
    ]
  };

  // Dynamically set relationship options based on gender
  const relationshipOptions = selectedGender === 'male' 
    ? [{ id: 'boyfriend', label: 'Boyfriend', img: '/emojis/heart_with_arrow.png' }]
    : [{ id: 'girlfriend', label: 'Girlfriend', img: '/emojis/heart_with_arrow.png' }];
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const validateAndProceed = () => {
    if (!selectedGender) {
      setNotification({ show: true, message: "Please select a gender.", type: "warning" });
      return;
    }
    if (!selectedRelationship) {
      setNotification({ show: true, message: "Please select a relationship type.", type: "warning" });
      return;
    }
    if (selectedInterests.length === 0) {
      setNotification({ show: true, message: "Please select at least one interest.", type: "warning" });
      return;
    }
    handleNextStep();
  };
  return (
    <div className="create-box-chdw3e4f">
       <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="create-1-pics-conatiner">
        {/* Gender Selection */}
        <div className="create-get-sectionsw1">
          <span>
            <h2>Choose AI Gender :</h2>
            <p>Choose only one option</p>
          </span>
          <div className="emojis-con1">
            {options.gender.map(({ id, label, img }) => (
              <div
                key={id}
                className={`crete-1-box3s ${selectedGender === id ? "selected-creat" : ""}`}
                onClick={() => setSelectedGender(id)}
              >
                <img src={img} alt={label} />
                <h3>{label}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship Selection (Boyfriend/Girlfriend based on gender) */}
        <div className="create-get-sectionsw1">
          <span>
            <h2>Choose Relationship :</h2>
            <p>Choose only one option</p>
          </span>
          <div className="emojis-cox2">
            <div className="emojis-con-rows">
              {relationshipOptions.map(({ id, label, img }) => (
                <div
                  key={id}
                  className={`crete-2-box3s ${selectedRelationship === id ? "selected-creat" : ""}`}
                  onClick={() => setSelectedRelationship(id)}
                >
                  <img src={img} alt={label} />
                  <h3>{label}</h3>
                </div>
              ))}
              <div
                className={`crete-2-box3s ${selectedRelationship === "Friend" ? "selected-creat" : ""}`}
                onClick={() => setSelectedRelationship("Friend")}
              >
                <img src="/emojis/friends.png" alt="Friend" />
                <h3>Friend</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Interests Selection */}
        <div className="create-get-sectionsw1">
          <span>
            <h2>Interests :</h2>
            <p>You can choose several options</p>
          </span>
          <div className="emojis-con3">
            {options.interests.map(({ id, label, img }) => (
              <div
                key={id}
                className={`crete-3-box3s ${selectedInterests.includes(id) ? "selected-creat" : ""}`}
                onClick={() =>
                  setSelectedInterests((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                  )
                }
              >
                <img src={img} alt={label} />
                <h3>{label}</h3>
              </div>
            ))}
          </div>
        </div>

        <button onClick={validateAndProceed} className="create-conti-btn324">
          Continue
        </button>
      </div>
    </div>
  );
}

export default AiCharacter;
