'use client'; // Required for client-side interactivity
import { useRouter } from 'next/navigation'; // Changed from react-router-dom
import Image from 'next/image'; // Using Next.js optimized Image component
import '../styles/HomeCosAi.css';

function HomeCosAi() {
    const router = useRouter(); // Replaces useNavigate

    const handleCreateClick = () => {
        router.push('/create'); // Next.js navigation method
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
            <Image 
                src='/models_images_female/home_poster.png' 
                alt='home_poster' 
                width={5000} // Add appropriate width
                height={500} // Add appropriate height
            />
        </div>
    );
}

export default HomeCosAi;