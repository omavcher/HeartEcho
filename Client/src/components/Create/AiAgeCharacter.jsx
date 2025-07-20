import  { useState } from 'react';
import PopNoti from '../PopNoti';

function AiAgeCharacter({ handleNextStep, selectedAge, setSelectedAge, aigender }) {
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const validateAndProceed = () => {
    if (!selectedAge) {
      setNotification({ show: true, message: 'Please select an age before continuing.', type: 'warning' });
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
      <h1>Choose the age for your<br /> AI Partner:</h1>
      <div className="create-2-pics-conatiner">
        <div className="create-2-pics-conatiner-row-f">
          <div
            className={`create-1-pics-box ${selectedAge === 'Teen' ? 'selected-creat' : ''}`}
            onClick={() => setSelectedAge('Teen')}
          >
            <img src={`/models_images_${aigender}/teen.jpg`} alt="Teen" />
            <h3>Teen 18+</h3>
          </div>
          <div
            className={`create-1-pics-box ${selectedAge === 'Young' ? 'selected-creat' : ''}`}
            onClick={() => setSelectedAge('Young')}
          >
            <img src={`/models_images_${aigender}/young.jpg`} alt="Young Model" />
            <h3>Young (25-30)</h3>
          </div>
        </div>
        <div className="create-2-pics-conatiner-row-f">
          <div
            className={`create-1-pics-box ${selectedAge === 'Mature' ? 'selected-creat' : ''}`}
            onClick={() => setSelectedAge('Mature')}
          >
            <img src={`/models_images_${aigender}/mature.jpg`} alt="Mature" />
            <h3>Mature (30-40)</h3>
          </div>
          <div
            className={`create-1-pics-box ${selectedAge === 'Old' ? 'selected-creat' : ''}`}
            onClick={() => setSelectedAge('Old')}
          >
            <img src={`/models_images_${aigender}/old.jpg`} alt="Old" />
            <h3>Old (50+)</h3>
          </div>
        </div>
      </div>
      <button onClick={validateAndProceed} className="create-conti-btn324">
        Continue
      </button>
    </div>
  );
}

export default AiAgeCharacter;