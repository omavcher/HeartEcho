import React from 'react'
import '../styles/StepsHome.css'
import { Link } from 'react-router-dom'

function StepsHome() {
  return (
    <>
<div className='steps-home-container-dsree'>
        <span className='steps-home-step'>STEP 1</span>
        <h1 className='steps-home-title'>Choose AI ChatBot Character or Create Your Own AI Bot</h1>

        <p>Pick from our pre-trained AI companions or design your own with unique traits, personality, and preferences to match your ideal virtual partner.</p>

            <img src='/icons/heart1.png' alt='echoheart' className='steps-home-image-ec' />

         </div>

        <div className='steps-home-container-dsree'>
        <span className='steps-home-step'>STEP 2</span>
        <h1 className='steps-home-title'>Start Chatting & Personalizing Responses</h1>

      <p>Engage in real-time conversations, customize responses, and let your AI remember past chats for a more natural, interactive experience.</p>

            <img src='/icons/heart2.png' alt='echoheart' className='steps-home-image-ec' />

         </div>



        <div className='steps-home-container-dsree'>
        <span className='steps-home-step'>STEP 3</span>
        <h1 className='steps-home-title'>Unlock More Features & Integrate AI Anywhere</h1>

        <p>
        Engage in real-time conversations, customize responses, and let your AI remember past chats for a more natural, interactive experience. 
        </p>
        
            <img src='/icons/heart3.png' alt='echoheart' className='steps-home-image-ec' />

        </div>
        
        </>
  )
}

export default StepsHome