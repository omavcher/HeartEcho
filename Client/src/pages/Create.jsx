'use client';

import React, { useState } from 'react';
import '../styles/Create.css';
import AiCharacter from '../components/Create/AiCharacter';
import AiAgeCharacter from '../components/Create/AiAgeCharacter';
import AiPersona from '../components/Create/AiPersona';
import AiSelectCh from '../components/Create/AiSelectCh';
import AiExixtingCh from '../components/Create/AiExixtingCh';
import PopNoti from '../components/PopNoti';
import GeneratedAi from '../components/Create/GeneratedAi';
import Image from 'next/image';

function Create() {
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
    const [aiPersonaData, setAiPersonaData] = useState({
        selectedName: "",
        selectedPersona: "",
        setting: "",
        message: "",
        description: ""
    });

    const [selectedOption, setSelectedOption] = useState(null);
    const [stepCreate, setStepCreate] = useState(1);
    const [fade, setFade] = useState(true);
    const totalSteps = 4;
    const [selectedAge, setSelectedAge] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);
    const [selectedRelationship, setSelectedRelationship] = useState(null);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [generatedData, setGeneratedData] = useState(null);

    const handleImageSelect = (imageSrc) => {
        setSelectedImage(imageSrc);
        console.log('Selected Image:', imageSrc);
    };    

    const [characterTraits, setCharacterTraits] = useState({
        personality: 50,
        energy: 50,
        uniqueness: 50
    });

    const generateRandomTraits = () => {
        let traits = {
            Shy: 0,
            Flirty: 0,
            Calm: 0,
            Funny: 0,
            Common: 0,
            Mysterious: 0
        };
    
        let remaining = 100;
        let keys = Object.keys(traits);
    
        let minTraitValue = 5;
        let totalMin = minTraitValue * keys.length;
        remaining -= totalMin; 
    
        for (let i = 0; i < keys.length - 1; i++) {
            let maxAlloc = remaining / (keys.length - i);
            let value = Math.floor(Math.random() * maxAlloc) + minTraitValue;
            traits[keys[i]] = value;
            remaining -= value;
        }
    
        traits[keys[keys.length - 1]] = remaining + minTraitValue;
    
        return traits;
    };

    const handleTraitChange = (trait, value) => {
        setCharacterTraits(prev => ({ ...prev, [trait]: value }));
    };

    const handleNextStep = () => {
        let isValid = true;
    
        if (stepCreate === 1) {
            if (!selectedGender || !selectedRelationship || selectedInterests.length === 0) {
                isValid = false;
                setNotification({ show: true, message: "Please select gender, relationship status, and at least one interest.", type: "warning" });
            }
        } else if (stepCreate === 2) {
            if (!selectedAge) {
                isValid = false;
                setNotification({ show: true, message: "Please select an age group.", type: "warning" });
            }
        } else if (stepCreate === 3) {
            if (!aiPersonaData.selectedName || !aiPersonaData.selectedPersona || !aiPersonaData.setting || !aiPersonaData.message || !aiPersonaData.description) {
                isValid = false;
                setNotification({ show: true, message: "Please fill all the persona details.", type: "warning" });
            }
        } else if (stepCreate === 4) {
            if (!selectedOption) {
                isValid = false;
                setNotification({ show: true, message: "Please select a character type.", type: "warning" });
            }
        }
    
        if (isValid) {
            setFade(false);
            setTimeout(() => {
                setStepCreate(prev => prev + 1);
                setFade(true);
            }, 400);
        }
    };

    const handlePrevStep = () => {
        if (stepCreate > 1) {
            setFade(false);
            setTimeout(() => {
                setStepCreate(prev => Math.max(1, prev - 1));
                setFade(true);
            }, 400);
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = () => {
        const traitValues = generateRandomTraits();
        setGeneratedData({
            Gender: selectedGender,
            Relationship: selectedRelationship,
            Interests: selectedInterests,
            AgeGroup: selectedAge,
            Image: selectedImage,
            PersonalityTraits: traitValues,
            PersonaData: aiPersonaData,
        });
    };

    const images = [
        '/poster_male_female/1.jpg', 
        '/poster_male_female/2.jpg',
        '/poster_male_female/3.jpg',  
        '/poster_male_female/4.jpg'  
    ];

    return (
        <div className="create-container-box">
            <PopNoti
                message={notification.message}
                type={notification.type}
                isVisible={notification.show}
                onClose={() => setNotification({ ...notification, show: false })}
            />
            <div className='create-conatiner-imagesection-load4'>
                <Image 
                    src={images[stepCreate - 1]} 
                    alt={`AI Avatar ${stepCreate}`}
                    className={fade ? 'fade-in' : 'fade-out'}
                    width={500}
                    height={500}
                    priority
                />
            </div>

            <div className='create-container-creta-section-detail'>
                <div className='create-box-area3ddf'>
                    <header>
                        <button onClick={handlePrevStep} disabled={stepCreate === 1}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.8284 12.0005L14.6569 14.8289L13.2426 16.2431L9 12.0005L13.2426 7.75781L14.6569 9.17203L11.8284 12.0005Z"></path>
                            </svg>
                        </button>
                    
                        <div className='create-progress-bar'>
                            <div className='progress' style={{ width: `${(stepCreate / totalSteps) * 100}%` }}></div>
                        </div>

                        <button onClick={handleNextStep} disabled={stepCreate === totalSteps}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.1717 12.0005L9.34326 9.17203L10.7575 7.75781L15.0001 12.0005L10.7575 16.2431L9.34326 14.8289L12.1717 12.0005Z"></path>
                            </svg>
                        </button>
                    </header>

                    {!generatedData ? (
                        <>
                            {stepCreate === 1 && (
                                <AiCharacter 
                                    selectedGender={selectedGender}
                                    setSelectedGender={setSelectedGender}
                                    selectedRelationship={selectedRelationship}
                                    setSelectedRelationship={setSelectedRelationship}
                                    selectedInterests={selectedInterests}
                                    setSelectedInterests={setSelectedInterests}
                                    handleNextStep={handleNextStep}
                                />
                            )}

                            {stepCreate === 2 && (
                                <AiAgeCharacter 
                                    handleNextStep={handleNextStep} 
                                    setSelectedAge={setSelectedAge} 
                                    selectedAge={selectedAge}
                                    aigender={selectedGender} 
                                />
                            )}

                            {stepCreate === 3 && (
                                <div className="create-box-chdw3e4f">
                                    <AiPersona 
                                        aigender={selectedGender}
                                        selectedAge={selectedAge}
                                        setSelectedAge={setSelectedAge}
                                        aiPersonaData={aiPersonaData}
                                        setAiPersonaData={setAiPersonaData}
                                        handleNextStep={handleNextStep} 
                                    />
                                </div>
                            )}

                            {stepCreate === 4 && (
                                <div className="create-box-chdw3e4f">
                                    <div className="ai-charecter09-top-ect">
                                        <h2>Choose Character</h2>
                                        <div className="ai-charecter-rowsdc">
                                            <span onClick={() => setSelectedOption("existing")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.841 15.659L18.017 15.836L18.1945 15.659C19.0732 14.7803 20.4978 14.7803 21.3765 15.659C22.2552 16.5377 22.2552 17.9623 21.3765 18.841L18.0178 22.1997L14.659 18.841C13.7803 17.9623 13.7803 16.5377 14.659 15.659C15.5377 14.7803 16.9623 14.7803 17.841 15.659ZM12 14V16C8.68629 16 6 18.6863 6 22H4C4 17.6651 7.44784 14.1355 11.7508 14.0038L12 14ZM12 1C15.315 1 18 3.685 18 7C18 10.2397 15.4357 12.8776 12.225 12.9959L12 13C8.685 13 6 10.315 6 7C6 3.76034 8.56434 1.12237 11.775 1.00414L12 1ZM12 3C9.78957 3 8 4.78957 8 7C8 9.21043 9.78957 11 12 11C14.2104 11 16 9.21043 16 7C16 4.78957 14.2104 3 12 3Z"></path>
                                                </svg>
                                                Existing Character
                                            </span>
                                            <span onClick={() => setSelectedOption("new")}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M13.0001 10.9999L22.0002 10.9997L22.0002 12.9997L13.0001 12.9999L13.0001 21.9998L11.0001 21.9998L11.0001 12.9999L2.00004 13.0001L2 11.0001L11.0001 10.9999L11 2.00025L13 2.00024L13.0001 10.9999Z"></path>
                                                </svg>
                                                New Character
                                            </span>
                                        </div>
                            
                                        {selectedOption && (
                                            <div className="create-box-display-overlayy">
                                                {selectedOption === "existing" ? (
                                                    <AiExixtingCh 
                                                        aigender={selectedGender} 
                                                        onClose={() => setSelectedOption(null)} 
                                                        onSelect={handleImageSelect}  
                                                    />
                                                ) : (
                                                    <AiSelectCh 
                                                        aigender={selectedGender} 
                                                        onClose={() => setSelectedOption(null)}   
                                                        onSelect={handleImageSelect}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        
                                        {selectedImage && (
                                            <Image 
                                                className='ai-charecter09-topi-image' 
                                                src={selectedImage} 
                                                alt="Selected" 
                                                width={200}
                                                height={200}
                                            />
                                        )}

                                        {selectedImage && (
                                            <button onClick={handleGenerate} className="create-conti-btn324">
                                                Generate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <GeneratedAi generatedData={generatedData} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Create;