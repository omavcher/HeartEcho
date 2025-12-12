// app/hot-stories/actions.js
'use server';

import api from '../../config/api';

export async function fetchStoriesData() {
  try {
    const response = await fetch(`${api.Url}/story`, {
      next: { 
        revalidate: 60, // Revalidate every 60 seconds
        tags: ['stories'] 
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch stories');
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}