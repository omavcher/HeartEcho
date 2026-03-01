'use client';
import Image from 'next/image';
import '../styles/HomeCosAi.css';

function HomeCosAi() {
    return (
        <div className='homecos-ai-rde3'>
            <div className='homecos-ai-rde3-text'>
                <h1>Your AI Girlfriend/Boyfriend Awaits</h1>
                <p>
                    Meet your perfect AI companion. <br />
                    Chat, connect, and feel understood every day.
                </p>
            </div>
            <Image 
                src='/models_images_female/home_poster.png' 
                alt='home_poster' 
                width={5000}
                height={500}
            />
        </div>
    );
}

export default HomeCosAi;