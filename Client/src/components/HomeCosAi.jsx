import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/Home.css';

function HomeCosAi() {
    const navigate = useNavigate(); 

    const handleCreateClick = () => {
        navigate('/create');  // Navigate to the Create page
    };

    return (
        <div className='homecos-ai-rde3'>
            <div className='homecos-ai-rde3-text'>
                <h1>Create Custom AI Girlfriend/Boyfriend</h1>
                <p>
                    Craft your dream AI with a few clicks. <br />
                    Customize them your way and bring them to life.
                </p> 
                <button onClick={handleCreateClick}>Create</button>  
            </div>
            <img 
                src='/models_images_female/home_poster.png' 
                alt='home_poster' 
                className='homecos-ai-rde3-img'
            />
        </div>
    );
}

export default HomeCosAi;
