// app/admin/create-story/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateStoryPage.css';
import api from '../../config/api';
import AdminLayout from '../../app/admin/layout';

const CreateStoryPage = () => {
  // Main form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    description: '',
    category: 'Housewife',
    city: 'Mumbai',
    featured: false,
    trending: false,
    characterId: '',
    characterName: '',
    characterAge: '',
    characterOccupation: '',
    characterPersonality: '',
    backgroundImage: '',
    characterAvatar: '',
    tags: '',
    imageAlbum: [],
    content_en: {
      story: '',
      cliffhanger: '',
      teaserChat: '',
      cta: 'Start Chat'
    },
    content_hi: {
      story: '',
      cliffhanger: '',
      teaserChat: '',
      cta: 'चैट शुरू करें'
    }
  });

  // Character selection modal state
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Form submission state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Cloudinary upload state
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingAlbum, setUploadingAlbum] = useState(false);
  const [backgroundPreview, setBackgroundPreview] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [imageAlbum, setImageAlbum] = useState([]);

  // Categories and cities
  const categories = [
    'Housewife', 'Bhabhi', 'Devar-Bhabhi', 'Nanad-Bhabhi',
    'Aunty', 'Mami', 'Maami', 'Chachi', 'Buwa', 'Tai',
    'Incest', 'Mother-Son', 'Brother-Sister', 'Father-Daughter',
    'Behan-Bhai', 'Maa-Beta', 'Papa-Beti', 'Sasur-Bahu',
    'Village', 'Gaon Ki Chudai', 'Khet-Maidan', 'Desi',
    'Neighbor', 'Padosan', 'Padosi', 'Colony Aunty',
    'Cheating Wife', 'Biwi Ki Chudai', 'Cuckold', 'Patni Paraye Mard Se',
    'Office Sex', 'Boss-Secretary', 'Teacher-Student', 'Madam aur Naukar',
    'Virgin', 'First Time', 'Suhagraat', 'Honeymoon',
    'Maid', 'Kaamwali Bai', 'Servant', 'Driver Sex',
    'Forced', 'Zabardasti', 'Blackmail', 'Majboori Mein Chudai',
    'Gangbang', 'Group Sex', 'Train Mein Chudai', 'Bus Mein',
    'Muslim', 'Hijab', 'Burqa', 'Pathan', 'Bhabhi aur Jiju',
    'College Girl', 'Hostel Sex', 'Boyfriend-Girlfriend', 'Dost Ki Behan',
    'MILF', 'Mature', 'Jethani-Devrani', 'Saas-Bahu',
    'Threesome', 'Do Mardo Se', 'Harem', 'Rich Family',
    'Public Sex', 'Car Mein', 'Hotel Room', 'Jungle Mein',
    'Romantic', 'Pyar Mohabbat', 'True Love Story',
    'Savita Bhabhi Style', 'Velamma', 'Miss Rita', 'Kirtu Type'
  ];

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Goa', 'Chandigarh', 'Other'
  ];

  // Cloudinary upload configuration
  const cloudName = 'dx6rjowfb';
  const uploadPreset = 'ml_default'; // You need to create this in Cloudinary

  // Fetch characters on modal open
  useEffect(() => {
    if (showCharacterModal) {
      fetchCharacters();
    }
  }, [showCharacterModal]);

  const fetchCharacters = async () => {
    try {
      setLoadingCharacters(true);
      const response = await axios.get(`${api.Url}/story/get-female-ai-friends`);
      
      if (response.data.success) {
        setCharacters(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching characters:', err);
      setError('Failed to load characters');
    } finally {
      setLoadingCharacters(false);
    }
  };

  // Handle character selection
  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
    setFormData(prev => ({
      ...prev,
      characterId: character.id,
      characterName: character.name,
      characterAge: character.age.toString(),
      characterOccupation: character.relationship || 'Character',
      characterPersonality: character.description || `${character.name}, ${character.age} years old`,
      characterAvatar: character.avatar_img || '/api/placeholder/400/711'
    }));
    setAvatarPreview(character.avatar_img || '/api/placeholder/400/711');
    setShowCharacterModal(false);
  };

  // Filter characters based on search
  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cloudinary Upload Functions
  const uploadToCloudinary = async (file, type = 'background') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
    
    // Add folder based on type
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingBackground(true);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file, 'background');
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        backgroundImage: imageUrl
      }));
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload background image');
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar size should be less than 2MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file, 'avatar');
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        characterAvatar: imageUrl
      }));
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload avatar image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeBackgroundImage = () => {
    setFormData(prev => ({ ...prev, backgroundImage: '' }));
    setBackgroundPreview('');
  };

  const removeAvatarImage = () => {
    setFormData(prev => ({ ...prev, characterAvatar: '' }));
    setAvatarPreview('');
    setImageAlbum([]);
  };

  // Image Album handlers
  const handleAlbumUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setUploadingAlbum(true);
      setError('');
      
      const uploadPromises = files.map(file => {
        // Validate file type
        if (!file.type.match('image.*')) {
          throw new Error('Please select image files only');
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }
        return uploadToCloudinary(file, 'album');
      });

      const imageUrls = await Promise.all(uploadPromises);
      const newAlbum = [...imageAlbum, ...imageUrls];
      setImageAlbum(newAlbum);
      setFormData(prev => ({ ...prev, imageAlbum: newAlbum }));
      
    } catch (err) {
      console.error('Album upload error:', err);
      setError(err.message || 'Failed to upload album images');
    } finally {
      setUploadingAlbum(false);
    }
  };

  const removeAlbumImage = (index) => {
    const newAlbum = imageAlbum.filter((_, i) => i !== index);
    setImageAlbum(newAlbum);
    setFormData(prev => ({ ...prev, imageAlbum: newAlbum }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle tags input
  const handleTagsChange = (e) => {
    setFormData(prev => ({ ...prev, tags: e.target.value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.backgroundImage) {
        throw new Error('Please upload a background image');
      }
      
      if (!formData.characterAvatar) {
        throw new Error('Please upload a character avatar');
      }

      // Prepare data for API
      const storyData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageAlbum: imageAlbum,
        characterAge: parseInt(formData.characterAge),
        content_en: {
          ...formData.content_en,
          story: formData.content_en.story.trim(),
          cliffhanger: formData.content_en.cliffhanger.trim(),
          teaserChat: formData.content_en.teaserChat.trim()
        },
        content_hi: {
          story: formData.content_hi.story.trim() || formData.content_en.story,
          cliffhanger: formData.content_hi.cliffhanger.trim() || formData.content_en.cliffhanger,
          teaserChat: formData.content_hi.teaserChat.trim() || formData.content_en.teaserChat,
          cta: formData.content_hi.cta || 'चैट शुरू करें'
        }
      };

      const response = await axios.post(`${api.Url}/story/create-story`, storyData);

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          excerpt: '',
          description: '',
          category: 'Housewife',
          city: 'Mumbai',
          featured: false,
          trending: false,
          characterId: '',
          characterName: '',
          characterAge: '',
          characterOccupation: '',
          characterPersonality: '',
          backgroundImage: '',
          characterAvatar: '',
          tags: '',
          imageAlbum: [],
          content_en: {
            story: '',
            cliffhanger: '',
            teaserChat: '',
            cta: 'Start Chat'
          },
          content_hi: {
            story: '',
            cliffhanger: '',
            teaserChat: '',
            cta: 'चैट शुरू करें'
          }
        });
        setSelectedCharacter(null);
        setBackgroundPreview('');
        setAvatarPreview('');
        setImageAlbum([]);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Error creating story:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  // Clear selected character
  const clearCharacter = () => {
    setSelectedCharacter(null);
    setFormData(prev => ({
      ...prev,
      characterId: '',
      characterName: '',
      characterAge: '',
      characterOccupation: '',
      characterPersonality: '',
      characterAvatar: ''
    }));
    setAvatarPreview('');
  };

  return (
    <div className="admin-story-container">
      <div className="admin-story-header">
        <h1>Create New Story</h1>
        <p>Add a new interactive story to the platform</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          <span>Story created successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">✗</span>
          <span>{error}</span>
        </div>
      )}

      <div className="admin-story-content">
        {/* Left Panel - Form */}
        <div className={`form-section ${previewMode ? 'collapsed' : 'expanded'}`}>
          <div className="section-header">
            <h2>Story Details</h2>
            <button 
              type="button" 
              className="preview-toggle-btn"
              onClick={togglePreview}
            >
              {previewMode ? 'Show Form' : 'Preview Story'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="story-form">
            {/* Basic Information */}
            <div className="form-section-card">
              <h3 className="form-section-title">
                <span className="section-icon">📝</span>
                Basic Information
              </h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">Story Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter story title"
                    required
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="admin-select"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="admin-select"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="excerpt">Short Excerpt *</label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Brief description (max 500 characters)"
                    rows="3"
                    maxLength="500"
                    required
                    className="admin-textarea"
                  />
                  <span className="char-count">{formData.excerpt.length}/500</span>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Full Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed description (max 2000 characters)"
                    rows="5"
                    maxLength="2000"
                    className="admin-textarea"
                  />
                  <span className="char-count">{formData.description.length}/2000</span>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="tags">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleTagsChange}
                    placeholder="Comma separated tags: romantic, mumbai, housewife"
                    className="admin-input"
                  />
                  <small>Separate tags with commas</small>
                </div>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="form-section-card">
              <h3 className="form-section-title">
                <span className="section-icon">🖼️</span>
                Media Upload
              </h3>
              <div className="form-grid">
                {/* Background Image Upload */}
                <div className="form-group full-width">
                  <label htmlFor="backgroundImage">Background Image *</label>
                  <div className="upload-container">
                    {formData.backgroundImage || backgroundPreview ? (
                      <div className="image-preview-container">
                        <div className="image-preview-wrapper">
                          <img 
                            src={backgroundPreview || formData.backgroundImage}
                            alt="Background preview"
                            className="image-preview"
                          />
                          <div className="image-preview-overlay">
                            <button 
                              type="button"
                              className="remove-image-btn"
                              onClick={removeBackgroundImage}
                              disabled={uploadingBackground}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="upload-info">
                          <p className="upload-url">{formData.backgroundImage}</p>
                          <p className="upload-status">Uploaded to Cloudinary ✓</p>
                        </div>
                      </div>
                    ) : (
                      <label className="upload-area" htmlFor="background-upload">
                        <div className="upload-icon">📁</div>
                        <div className="upload-text">
                          <p className="upload-title">Upload Background Image</p>
                          <p className="upload-subtitle">Click or drag image here</p>
                          <p className="upload-requirements">JPG, PNG, WebP • Max 5MB</p>
                        </div>
                        <input
                          type="file"
                          id="background-upload"
                          accept="image/*"
                          onChange={handleBackgroundUpload}
                          className="upload-input"
                          disabled={uploadingBackground}
                        />
                      </label>
                    )}
                    {uploadingBackground && (
                      <div className="upload-progress">
                        <div className="upload-spinner"></div>
                        <span>Uploading to Cloudinary...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Character Avatar Upload */}
                <div className="form-group full-width">
                  <label htmlFor="characterAvatar">Character Avatar *</label>
                  <div className="upload-container">
                    {formData.characterAvatar || avatarPreview ? (
                      <div className="image-preview-container">
                        <div className="avatar-preview-wrapper">
                          <img 
                            src={avatarPreview || formData.characterAvatar}
                            alt="Avatar preview"
                            className="avatar-preview"
                          />
                          <div className="image-preview-overlay">
                            <button 
                              type="button"
                              className="remove-image-btn"
                              onClick={removeAvatarImage}
                              disabled={uploadingAvatar}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="upload-info">
                          <p className="upload-url">{formData.characterAvatar}</p>
                          <p className="upload-status">Uploaded to Cloudinary ✓</p>
                        </div>
                      </div>
                    ) : (
                      <label className="upload-area" htmlFor="avatar-upload">
                        <div className="upload-icon">👤</div>
                        <div className="upload-text">
                          <p className="upload-title">Upload Character Avatar</p>
                          <p className="upload-subtitle">Click or drag image here</p>
                          <p className="upload-requirements">JPG, PNG, WebP • Max 2MB</p>
                        </div>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="upload-input"
                          disabled={uploadingAvatar}
                        />
                      </label>
                    )}
                    {uploadingAvatar && (
                      <div className="upload-progress">
                        <div className="upload-spinner"></div>
                        <span>Uploading to Cloudinary...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Album Upload */}
                <div className="form-group full-width">
                  <label htmlFor="imageAlbum">Image Album (Multiple Images)</label>
                  <small className="form-help-text">Upload multiple images that will be displayed within the story content</small>
                  <div className="upload-container">
                    {imageAlbum.length > 0 && (
                      <div className="album-preview-grid">
                        {imageAlbum.map((imageUrl, index) => (
                          <div key={index} className="album-image-item">
                            <img 
                              src={imageUrl}
                              alt={`Album image ${index + 1}`}
                              className="album-preview-image"
                            />
                            <button 
                              type="button"
                              className="remove-album-image-btn"
                              onClick={() => removeAlbumImage(index)}
                              disabled={uploadingAlbum}
                              title="Remove image"
                            >
                              ✕
                            </button>
                            <span className="album-image-number">{index + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="upload-area album-upload-area" htmlFor="album-upload">
                      <div className="upload-icon">📸</div>
                      <div className="upload-text">
                        <p className="upload-title">Add Images to Album</p>
                        <p className="upload-subtitle">Click to select multiple images</p>
                        <p className="upload-requirements">JPG, PNG, WebP • Max 5MB each • {imageAlbum.length} images added</p>
                      </div>
                      <input
                        type="file"
                        id="album-upload"
                        accept="image/*"
                        multiple
                        onChange={handleAlbumUpload}
                        className="upload-input"
                        disabled={uploadingAlbum}
                      />
                    </label>
                    {uploadingAlbum && (
                      <div className="upload-progress">
                        <div className="upload-spinner"></div>
                        <span>Uploading images to Cloudinary...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Character Selection */}
            <div className="form-section-card">
              <h3 className="form-section-title">
                <span className="section-icon">👤</span>
                Character Information
              </h3>
              
              <div className="character-selection">
                {selectedCharacter ? (
                  <div className="selected-character">
                    <div className="character-info">
                      <img 
                        src={selectedCharacter.avatar_img} 
                        alt={selectedCharacter.name}
                        className="character-avatar"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/711';
                        }}
                      />
                      <div className="character-details">
                        <h4>{selectedCharacter.name}</h4>
                        <p>{selectedCharacter.age} years • {selectedCharacter.relationship}</p>
                        <p className="character-desc">{selectedCharacter.description}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="clear-character-btn"
                      onClick={clearCharacter}
                    >
                      Change Character
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="select-character-btn"
                    onClick={() => setShowCharacterModal(true)}
                  >
                    <span className="character-icon">👤</span>
                    <div>
                      <span className="btn-text">Select a Character</span>
                      <small>Choose from existing AI friends or create new details</small>
                    </div>
                  </button>
                )}

                {/* Character Details Form */}
                <div className="character-details-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="characterName">Character Name *</label>
                      <input
                        type="text"
                        id="characterName"
                        name="characterName"
                        value={formData.characterName}
                        onChange={handleInputChange}
                        placeholder="Character name"
                        required
                        disabled={selectedCharacter}
                        className="admin-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="characterAge">Age *</label>
                      <input
                        type="number"
                        id="characterAge"
                        name="characterAge"
                        value={formData.characterAge}
                        onChange={handleInputChange}
                        placeholder="18"
                        min="18"
                        max="100"
                        required
                        disabled={selectedCharacter}
                        className="admin-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="characterOccupation">Occupation *</label>
                      <input
                        type="text"
                        id="characterOccupation"
                        name="characterOccupation"
                        value={formData.characterOccupation}
                        onChange={handleInputChange}
                        placeholder="Occupation"
                        required
                        disabled={selectedCharacter}
                        className="admin-input"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="characterPersonality">Personality</label>
                      <textarea
                        id="characterPersonality"
                        name="characterPersonality"
                        value={formData.characterPersonality}
                        onChange={handleInputChange}
                        placeholder="Describe character personality"
                        rows="3"
                        className="admin-textarea"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content - English */}
            <div className="form-section-card">
              <h3 className="form-section-title">
                <span className="section-icon">🇬🇧</span>
                Story Content (English)
              </h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="content_en.story">Story Text *</label>
                  <textarea
                    id="content_en.story"
                    name="content_en.story"
                    value={formData.content_en.story}
                    onChange={handleInputChange}
                    placeholder="Write the main story content in English"
                    rows="8"
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="content_en.cliffhanger">Cliffhanger *</label>
                  <textarea
                    id="content_en.cliffhanger"
                    name="content_en.cliffhanger"
                    value={formData.content_en.cliffhanger}
                    onChange={handleInputChange}
                    placeholder="Exciting cliffhanger that leads to chat"
                    rows="4"
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="content_en.teaserChat">Teaser Chat Message *</label>
                  <textarea
                    id="content_en.teaserChat"
                    name="content_en.teaserChat"
                    value={formData.content_en.teaserChat}
                    onChange={handleInputChange}
                    placeholder="First message from character in chat"
                    rows="3"
                    required
                    className="admin-textarea"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content_en.cta">Call to Action</label>
                  <input
                    type="text"
                    id="content_en.cta"
                    name="content_en.cta"
                    value={formData.content_en.cta}
                    onChange={handleInputChange}
                    placeholder="Start Chat"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* Content - Hindi */}
            <div className="form-section-card">
              <h3 className="form-section-title">
                <span className="section-icon">🇮🇳</span>
                Story Content (Hindi)
              </h3>
              <div className="language-note">
                <span className="note-icon">ℹ️</span>
                <span>Hindi content is optional. If left empty, English content will be used.</span>
              </div>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="content_hi.story">Story Text</label>
                  <textarea
                    id="content_hi.story"
                    name="content_hi.story"
                    value={formData.content_hi.story}
                    onChange={handleInputChange}
                    placeholder="Write the main story content in Hindi"
                    rows="8"
                    className="admin-textarea"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="content_hi.cliffhanger">Cliffhanger</label>
                  <textarea
                    id="content_hi.cliffhanger"
                    name="content_hi.cliffhanger"
                    value={formData.content_hi.cliffhanger}
                    onChange={handleInputChange}
                    placeholder="Exciting cliffhanger in Hindi"
                    rows="4"
                    className="admin-textarea"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="content_hi.teaserChat">Teaser Chat Message</label>
                  <textarea
                    id="content_hi.teaserChat"
                    name="content_hi.teaserChat"
                    value={formData.content_hi.teaserChat}
                    onChange={handleInputChange}
                    placeholder="First message from character in Hindi"
                    rows="3"
                    className="admin-textarea"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content_hi.cta">Call to Action</label>
                  <input
                    type="text"
                    id="content_hi.cta"
                    name="content_hi.cta"
                    value={formData.content_hi.cta}
                    onChange={handleInputChange}
                    placeholder="चैट शुरू करें"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="form-section-card">
              <h3 className="form-section-title">
                <span className="section-icon">⚙️</span>
                Story Settings
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="admin-checkbox"
                    />
                    <span className="checkbox-text">Featured Story</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="trending"
                      checked={formData.trending}
                      onChange={handleInputChange}
                      className="admin-checkbox"
                    />
                    <span className="checkbox-text">Trending Story</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || uploadingBackground || uploadingAvatar}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating...
                  </>
                ) : 'Create Story'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Preview */}
        <div className={`preview-section ${previewMode ? 'expanded' : 'collapsed'}`}>
          <div className="preview-header">
            <h2>Story Preview</h2>
            <button 
              type="button" 
              className="preview-toggle-btn"
              onClick={togglePreview}
            >
              {previewMode ? 'Show Form' : 'Edit Story'}
            </button>
          </div>

          <div className="preview-card">
            <div className="preview-hero">
              <div 
                className="preview-background"
                style={{ 
                  backgroundImage: `url(${backgroundPreview || formData.backgroundImage || '/api/placeholder/1200/675'})` 
                }}
              >
                <div className="city-badge">{formData.city}</div>
              </div>
              <div className="preview-content">
                <h3>{formData.title || 'Story Title'}</h3>
                <p className="preview-excerpt">{formData.excerpt || 'Story excerpt will appear here'}</p>
                
                <div className="character-preview">
                  <img 
                    src={avatarPreview || formData.characterAvatar || '/api/placeholder/400/711'}
                    alt="Character"
                    className="preview-avatar"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/711';
                    }}
                  />
                  <div className="character-info-preview">
                    <h4>{formData.characterName || 'Character Name'}</h4>
                    <p>{formData.characterAge || 'Age'} years • {formData.characterOccupation || 'Occupation'}</p>
                  </div>
                </div>

                <div className="preview-badges">
                  <span className="category-badge">{formData.category}</span>
                  {formData.featured && <span className="featured-badge">⭐ Featured</span>}
                  {formData.trending && <span className="trending-badge">🔥 Trending</span>}
                </div>
              </div>
            </div>

            <div className="preview-story-content">
              <h4>Story Preview</h4>
              <div className="story-text-preview">
                {formData.content_en.story ? (
                  formData.content_en.story.length > 200 ? 
                    `${formData.content_en.story.substring(0, 200)}...` : 
                    formData.content_en.story
                ) : 'Story content will appear here'}
              </div>

              <div className="cliffhanger-preview">
                <h5>What Happens Next?</h5>
                <p>{formData.content_en.cliffhanger || 'Cliffhanger will appear here'}</p>
              </div>

              <div className="chat-preview">
                <div className="chat-message">
                  <div className="message-avatar">
                    {formData.characterName?.charAt(0) || 'C'}
                  </div>
                  <div className="message-content">
                    <p>{formData.content_en.teaserChat || 'First chat message will appear here'}</p>
                  </div>
                </div>
              </div>

              <div className="cta-preview">
                <button className="cta-btn">
                  {formData.content_en.cta || 'Start Chat'} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Character Selection Modal */}
      {showCharacterModal && (
        <div className="modal-overlay">
          <div className="character-modal">
            <div className="modal-header">
              <h3>Select a Character</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCharacterModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-search">
              <input
                type="text"
                placeholder="Search characters by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="modal-content">
              {loadingCharacters ? (
                <div className="loading-characters">
                  <div className="spinner"></div>
                  <p>Loading characters...</p>
                </div>
              ) : filteredCharacters.length > 0 ? (
                <div className="characters-grid">
                  {filteredCharacters.map(character => (
                    <div 
                      key={character.id}
                      className={`character-card ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
                      onClick={() => handleSelectCharacter(character)}
                    >
                      <img 
                        src={character.avatar_img} 
                        alt={character.name}
                        className="character-card-avatar"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/711';
                        }}
                      />
                      <div className="character-card-info">
                        <h4>{character.name}</h4>
                        <p className="character-age">{character.age} years</p>
                        <p className="character-desc">{character.description}</p>
                        <p className="character-relationship">{character.relationship}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>No characters found matching your search.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCharacterModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => setShowCharacterModal(false)}
              >
                Use Selected Character
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateStoryPage;