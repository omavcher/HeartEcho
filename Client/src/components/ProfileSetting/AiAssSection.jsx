'use client';

import React from 'react';
import Link from 'next/link';
import HomeCosAi from '../HomeCosAi.jsx';

function AiAssSection({ onBackSBTNSelect }) {
  return (
    <>
      <header className='profile-setting-header3'>
        <h2>AI Assistant</h2>
        <button onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <HomeCosAi />
    </>
  );
}

export default AiAssSection;