'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../config/api';
import { FaCloudUploadAlt, FaTimes, FaUser, FaImage, FaMagic } from 'react-icons/fa';

// ------------------- CSS STYLES (Pure Black & Pink) -------------------
const styles = `
.cs-root-x30sn {
  color: #fff;
  background-color: #000;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  animation: fadeIn-x30sn 0.5s ease;
  padding: 20px;
}
@keyframes fadeIn-x30sn { from { opacity: 0; } to { opacity: 1; } }

/* HEADER */
.cs-header-x30sn {
  text-align: center; margin-bottom: 30px; padding: 30px;
  background: #050505; border-radius: 16px; border: 1px solid #222;
}
.cs-header-x30sn h1 { font-size: 32px; font-weight: 800; color: #fff; margin: 0 0 10px 0; }
.cs-header-x30sn p { color: #ff69b4; font-size: 14px; margin: 0; }

/* LAYOUT */
.cs-content-x30sn { display: flex; gap: 20px; align-items: flex-start; }
.cs-form-section-x30sn { flex: 2; transition: 0.3s; }
.cs-preview-section-x30sn { flex: 1; position: sticky; top: 20px; transition: 0.3s; }

/* FORM CARDS */
.cs-card-x30sn {
  background: #0a0a0a; border: 1px solid #222; border-radius: 16px; padding: 24px; margin-bottom: 20px;
}
.cs-card-title-x30sn {
  font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #222; padding-bottom: 15px;
}
.cs-card-title-x30sn svg { color: #ff69b4; }

/* GRID SYSTEM (2 Items Per Row) */
.cs-grid-x30sn {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
}
.cs-full-width-x30sn { grid-column: span 2; }

/* INPUTS */
.cs-group-x30sn { display: flex; flex-direction: column; gap: 8px; }
.cs-label-x30sn { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.cs-input-x30sn, .cs-select-x30sn, .cs-textarea-x30sn {
  background: #000; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 8px;
  font-size: 14px; outline: none; transition: 0.2s; width: 100%;
}
.cs-input-x30sn:focus, .cs-select-x30sn:focus, .cs-textarea-x30sn:focus { border-color: #ff69b4; }
.cs-textarea-x30sn { resize: vertical; min-height: 100px; font-family: inherit; }

/* UPLOAD AREAS */
.cs-upload-box-x30sn {
  border: 2px dashed #333; background: #080808; border-radius: 12px; padding: 30px;
  text-align: center; cursor: pointer; transition: 0.2s; position: relative;
}
.cs-upload-box-x30sn:hover { border-color: #ff69b4; background: rgba(255,105,180,0.05); }
.cs-upload-icon-x30sn { font-size: 30px; color: #ff69b4; margin-bottom: 10px; }
.cs-upload-text-x30sn { color: #666; font-size: 12px; }
.cs-hidden-input-x30sn { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

/* PREVIEWS */
.cs-preview-img-box-x30sn {
  position: relative; width: 100%; height: 200px; border-radius: 12px; overflow: hidden; border: 1px solid #333; margin-top: 10px;
}
.cs-preview-img-x30sn { width: 100%; height: 100%; object-fit: cover; }
.cs-remove-btn-x30sn {
  position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: #ff4444;
  border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
}

/* ALBUM GRID */
.cs-album-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; margin-top: 15px;
}
.cs-album-item-x30sn {
  position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid #333;
}
.cs-album-img-x30sn { width: 100%; height: 100%; object-fit: cover; }

/* CHECKBOXES */
.cs-checkbox-group-x30sn {
  display: flex; align-items: center; gap: 10px; background: #111; padding: 12px; border-radius: 8px; border: 1px solid #333; cursor: pointer;
}
.cs-checkbox-x30sn { accent-color: #ff69b4; width: 18px; height: 18px; }

/* BUTTONS */
.cs-actions-x30sn {
  display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #222;
}
.cs-btn-x30sn {
  padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; border: 1px solid #333;
  display: flex; align-items: center; gap: 8px; transition: 0.2s;
}
.cs-btn-x30sn.primary { background: #ff69b4; color: #000; border: none; }
.cs-btn-x30sn.primary:hover { background: #ff85c2; transform: translateY(-2px); }
.cs-btn-x30sn.secondary { background: #111; color: #fff; }
.cs-btn-x30sn.secondary:hover { border-color: #fff; }

/* CHARACTER MODAL */
.cs-modal-overlay-x30sn {
  position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; justify-content: center; align-items: center;
}
.cs-modal-box-x30sn {
  background: #0a0a0a; border: 1px solid #333; width: 90%; max-width: 1000px; max-height: 90vh; border-radius: 20px; display: flex; flex-direction: column;
}
.cs-modal-header-x30sn { padding: 20px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
.cs-modal-header-x30sn h3 { margin: 0; color: #fff; }
.cs-char-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 20px; overflow-y: auto;
}
.cs-char-card-x30sn {
  background: #111; border: 1px solid #333; border-radius: 12px; padding: 15px; cursor: pointer; text-align: center;
}
.cs-char-card-x30sn:hover { border-color: #ff69b4; }
.cs-char-card-x30sn img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 10px; border: 2px solid #333; }
.cs-char-card-x30sn h4 { margin: 0; color: #fff; font-size: 14px; }
.cs-char-card-x30sn p { margin: 5px 0 0 0; color: #666; font-size: 11px; }

/* CHARACTER SELECTION BOX */
.cs-char-select-box-x30sn {
  background: #111; border: 2px dashed #333; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: 0.2s;
}
.cs-char-select-box-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }
.cs-selected-char-x30sn {
  background: rgba(255,105,180,0.1); border: 1px solid #ff69b4; border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;
}

/* RESPONSIVE */
@media (max-width: 1000px) {
  .cs-content-x30sn { flex-direction: column; }
  .cs-preview-section-x30sn { display: none; } /* Hide preview on mobile to save space */
}
@media (max-width: 600px) {
  .cs-grid-x30sn { grid-template-columns: 1fr; }
  .cs-full-width-x30sn { grid-column: span 1; }
}
`;

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
    content_en: { story: '', cliffhanger: '', teaserChat: '', cta: 'Start Chat' },
    content_hi: { story: '', cliffhanger: '', teaserChat: '', cta: 'चैट शुरू करें' }
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

  // Constants
  const categories = [
    'Housewife', 'Bhabhi', 'Devar-Bhabhi', 'Nanad-Bhabhi', 'Aunty', 'Mami', 'Maami', 'Chachi', 'Buwa', 'Tai',
    'Incest', 'Mother-Son', 'Brother-Sister', 'Father-Daughter', 'Behan-Bhai', 'Maa-Beta', 'Papa-Beti', 'Sasur-Bahu',
    'Village', 'Gaon Ki Chudai', 'Khet-Maidan', 'Desi', 'Neighbor', 'Padosan', 'Padosi', 'Colony Aunty',
    'Cheating Wife', 'Biwi Ki Chudai', 'Cuckold', 'Patni Paraye Mard Se', 'Office Sex', 'Boss-Secretary', 'Teacher-Student',
    'Madam aur Naukar', 'Virgin', 'First Time', 'Suhagraat', 'Honeymoon', 'Maid', 'Kaamwali Bai', 'Servant', 'Driver Sex',
    'Forced', 'Zabardasti', 'Blackmail', 'Majboori Mein Chudai', 'Gangbang', 'Group Sex', 'Train Mein Chudai', 'Bus Mein',
    'Muslim', 'Hijab', 'Burqa', 'Pathan', 'Bhabhi aur Jiju', 'College Girl', 'Hostel Sex', 'Boyfriend-Girlfriend', 'Dost Ki Behan',
    'MILF', 'Mature', 'Jethani-Devrani', 'Saas-Bahu', 'Threesome', 'Do Mardo Se', 'Harem', 'Rich Family', 'Public Sex',
    'Car Mein', 'Hotel Room', 'Jungle Mein', 'Romantic', 'Pyar Mohabbat', 'True Love Story', 'Savita Bhabhi Style', 'Velamma',
    'Miss Rita', 'Kirtu Type'
  ];

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Goa', 'Chandigarh', 'Other'];

  const cloudName = 'dx6rjowfb';
  const uploadPreset = 'ml_default';

  // Effects & Fetchers
  useEffect(() => {
    if (showCharacterModal) fetchCharacters();
  }, [showCharacterModal]);

  const fetchCharacters = async () => {
    try {
      setLoadingCharacters(true);
      const response = await axios.get(`${api.Url}/story/get-female-ai-friends`);
      if (response.data.success) setCharacters(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load characters');
    } finally { setLoadingCharacters(false); }
  };

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

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Upload Logic
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error(error); throw error;
    }
  };

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) return setError('Invalid file type');
    if (file.size > 5 * 1024 * 1024) return setError('File too large (Max 5MB)');

    try {
      setUploadingBackground(true);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => setBackgroundPreview(reader.result);
      reader.readAsDataURL(file);
      const imageUrl = await uploadToCloudinary(file, 'background');
      setFormData(prev => ({ ...prev, backgroundImage: imageUrl }));
    } catch (err) { setError('Upload failed'); } 
    finally { setUploadingBackground(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
      const imageUrl = await uploadToCloudinary(file, 'avatar');
      setFormData(prev => ({ ...prev, characterAvatar: imageUrl }));
    } catch (err) { setError('Upload failed'); } 
    finally { setUploadingAvatar(false); }
  };

  const handleAlbumUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      setUploadingAlbum(true);
      const uploadPromises = files.map(file => uploadToCloudinary(file, 'album'));
      const imageUrls = await Promise.all(uploadPromises);
      const newAlbum = [...imageAlbum, ...imageUrls];
      setImageAlbum(newAlbum);
      setFormData(prev => ({ ...prev, imageAlbum: newAlbum }));
    } catch (err) { setError('Album upload failed'); } 
    finally { setUploadingAlbum(false); }
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess(false);
    try {
      if (!formData.backgroundImage) throw new Error('Background image required');
      if (!formData.characterAvatar) throw new Error('Character avatar required');

      const storyData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        imageAlbum: imageAlbum,
        characterAge: parseInt(formData.characterAge),
        content_en: { ...formData.content_en, story: formData.content_en.story.trim() },
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
        // Reset Logic
        setFormData({
          title: '', excerpt: '', description: '', category: 'Housewife', city: 'Mumbai', featured: false, trending: false,
          characterId: '', characterName: '', characterAge: '', characterOccupation: '', characterPersonality: '',
          backgroundImage: '', characterAvatar: '', tags: '', imageAlbum: [],
          content_en: { story: '', cliffhanger: '', teaserChat: '', cta: 'Start Chat' },
          content_hi: { story: '', cliffhanger: '', teaserChat: '', cta: 'चैट शुरू करें' }
        });
        setSelectedCharacter(null); setBackgroundPreview(''); setAvatarPreview(''); setImageAlbum([]);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Creation failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="cs-root-x30sn">
      <style>{styles}</style>
      
      {/* Header */}
      <div className="cs-header-x30sn">
        <h1>Create New Story</h1>
        <p>Craft immersive interactive experiences</p>
      </div>

      {success && <div style={{background:'rgba(0,255,0,0.1)', color:'#00ff00', padding:15, borderRadius:8, marginBottom:20, border:'1px solid green'}}>Story Created Successfully!</div>}
      {error && <div style={{background:'rgba(255,0,0,0.1)', color:'#ff4444', padding:15, borderRadius:8, marginBottom:20, border:'1px solid red'}}>{error}</div>}

      <div className="cs-content-x30sn">
        
        {/* Left Form Section */}
        <div className="cs-form-section-x30sn">
          <form onSubmit={handleSubmit}>
            
            {/* Basic Info */}
            <div className="cs-card-x30sn">
                <div className="cs-card-title-x30sn"><FaMagic/> Basic Information</div>
                <div className="cs-grid-x30sn">
                    <div className="cs-group-x30sn cs-full-width-x30sn">
                        <label className="cs-label-x30sn">Title</label>
                        <input className="cs-input-x30sn" name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div className="cs-group-x30sn">
                        <label className="cs-label-x30sn">Category</label>
                        <select className="cs-select-x30sn" name="category" value={formData.category} onChange={handleInputChange}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="cs-group-x30sn">
                        <label className="cs-label-x30sn">City</label>
                        <select className="cs-select-x30sn" name="city" value={formData.city} onChange={handleInputChange}>
                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="cs-group-x30sn cs-full-width-x30sn">
                        <label className="cs-label-x30sn">Excerpt</label>
                        <textarea className="cs-textarea-x30sn" rows={2} name="excerpt" value={formData.excerpt} onChange={handleInputChange} required />
                    </div>
                    <div className="cs-group-x30sn cs-full-width-x30sn">
                        <label className="cs-label-x30sn">Full Description</label>
                        <textarea className="cs-textarea-x30sn" name="description" value={formData.description} onChange={handleInputChange} />
                    </div>
                    <div className="cs-group-x30sn cs-full-width-x30sn">
                        <label className="cs-label-x30sn">Tags</label>
                        <input className="cs-input-x30sn" name="tags" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Comma separated tags" />
                    </div>
                </div>
            </div>

            {/* Media */}
            <div className="cs-card-x30sn">
                <div className="cs-card-title-x30sn"><FaImage/> Visuals</div>
                <div className="cs-grid-x30sn">
                    <div className="cs-group-x30sn cs-full-width-x30sn">
                        <label className="cs-label-x30sn">Background Image</label>
                        <div className="cs-upload-box-x30sn">
                            {backgroundPreview ? (
                                <div className="cs-preview-img-box-x30sn">
                                    <img src={backgroundPreview} className="cs-preview-img-x30sn" alt="bg"/>
                                    <button type="button" className="cs-remove-btn-x30sn" onClick={() => {setBackgroundPreview(''); setFormData(p=>({...p, backgroundImage:''}))}}>×</button>
                                </div>
                            ) : (
                                <>
                                    <FaCloudUploadAlt className="cs-upload-icon-x30sn"/>
                                    <div className="cs-upload-text-x30sn">{uploadingBackground ? 'Uploading...' : 'Click to Upload Background'}</div>
                                    <input type="file" className="cs-hidden-input-x30sn" onChange={handleBackgroundUpload} accept="image/*" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="cs-group-x30sn cs-full-width-x30sn">
                        <label className="cs-label-x30sn">Story Album</label>
                        <div className="cs-upload-box-x30sn" style={{padding:20}}>
                            <div className="cs-upload-text-x30sn">{uploadingAlbum ? 'Uploading...' : 'Click to Add Images'}</div>
                            <input type="file" className="cs-hidden-input-x30sn" onChange={handleAlbumUpload} accept="image/*" multiple />
                        </div>
                        {imageAlbum.length > 0 && (
                            <div className="cs-album-grid-x30sn">
                                {imageAlbum.map((url, i) => (
                                    <div key={i} className="cs-album-item-x30sn">
                                        <img src={url} className="cs-album-img-x30sn" alt=""/>
                                        <button type="button" className="cs-remove-btn-x30sn" style={{width:20, height:20, fontSize:12}} onClick={() => {
                                            const newAlb = imageAlbum.filter((_, idx) => idx !== i);
                                            setImageAlbum(newAlb); setFormData(p=>({...p, imageAlbum:newAlb}));
                                        }}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Character */}
            <div className="cs-card-x30sn">
                <div className="cs-card-title-x30sn"><FaUser/> Character</div>
                
                {selectedCharacter ? (
                    <div className="cs-selected-char-x30sn">
                        <img src={avatarPreview} style={{width:60, height:60, borderRadius:'50%', objectFit:'cover'}} alt=""/>
                        <div style={{flex:1}}>
                            <h4 style={{margin:0, color:'#fff'}}>{formData.characterName}</h4>
                            <p style={{margin:'5px 0', color:'#ff69b4', fontSize:12}}>{formData.characterOccupation}, {formData.characterAge}</p>
                        </div>
                        <button type="button" className="cs-btn-x30sn secondary" onClick={() => {setSelectedCharacter(null); setFormData(p=>({...p, characterName:'', characterAge:'', characterOccupation:''}))}}>Change</button>
                    </div>
                ) : (
                    <div className="cs-char-select-box-x30sn" onClick={() => setShowCharacterModal(true)}>
                        <FaUser size={24} style={{marginBottom:10}}/>
                        <div>Select from AI Friends Database</div>
                    </div>
                )}

                <div className="cs-grid-x30sn" style={{marginTop:20}}>
                    <div className="cs-group-x30sn"><label className="cs-label-x30sn">Name</label><input className="cs-input-x30sn" name="characterName" value={formData.characterName} onChange={handleInputChange} /></div>
                    <div className="cs-group-x30sn"><label className="cs-label-x30sn">Age</label><input className="cs-input-x30sn" type="number" name="characterAge" value={formData.characterAge} onChange={handleInputChange} /></div>
                    <div className="cs-group-x30sn"><label className="cs-label-x30sn">Occupation</label><input className="cs-input-x30sn" name="characterOccupation" value={formData.characterOccupation} onChange={handleInputChange} /></div>
                    <div className="cs-group-x30sn"><label className="cs-label-x30sn">Avatar</label><input type="file" onChange={handleAvatarUpload} className="cs-input-x30sn" style={{padding:9}}/></div>
                    <div className="cs-group-x30sn cs-full-width-x30sn"><label className="cs-label-x30sn">Personality</label><textarea className="cs-textarea-x30sn" rows={2} name="characterPersonality" value={formData.characterPersonality} onChange={handleInputChange} /></div>
                </div>
            </div>

            {/* Content English */}
            <div className="cs-card-x30sn">
                <div className="cs-card-title-x30sn">🇬🇧 Content (English)</div>
                <div className="cs-group-x30sn">
                    <label className="cs-label-x30sn">Story Body</label>
                    <textarea className="cs-textarea-x30sn" rows={10} name="content_en.story" value={formData.content_en.story} onChange={handleInputChange} required />
                </div>
                <div className="cs-grid-x30sn" style={{marginTop:15}}>
                    <div className="cs-group-x30sn cs-full-width-x30sn">
                        <label className="cs-label-x30sn">Cliffhanger</label>
                        <textarea className="cs-textarea-x30sn" rows={3} name="content_en.cliffhanger" value={formData.content_en.cliffhanger} onChange={handleInputChange} required />
                    </div>
                    <div className="cs-group-x30sn">
                        <label className="cs-label-x30sn">Teaser Message</label>
                        <input className="cs-input-x30sn" name="content_en.teaserChat" value={formData.content_en.teaserChat} onChange={handleInputChange} />
                    </div>
                    <div className="cs-group-x30sn">
                        <label className="cs-label-x30sn">Call To Action</label>
                        <input className="cs-input-x30sn" name="content_en.cta" value={formData.content_en.cta} onChange={handleInputChange} />
                    </div>
                </div>
            </div>

            {/* Content Hindi */}
            <div className="cs-card-x30sn">
                <div className="cs-card-title-x30sn">🇮🇳 Content (Hindi) - Optional</div>
                <div className="cs-group-x30sn">
                    <label className="cs-label-x30sn">Story Body</label>
                    <textarea className="cs-textarea-x30sn" rows={10} name="content_hi.story" value={formData.content_hi.story} onChange={handleInputChange} />
                </div>
                <div className="cs-grid-x30sn" style={{marginTop:15}}>
                    <div className="cs-group-x30sn cs-full-width-x30sn">
                        <label className="cs-label-x30sn">Cliffhanger</label>
                        <textarea className="cs-textarea-x30sn" rows={3} name="content_hi.cliffhanger" value={formData.content_hi.cliffhanger} onChange={handleInputChange} />
                    </div>
                    <div className="cs-group-x30sn">
                        <label className="cs-label-x30sn">Teaser Message</label>
                        <input className="cs-input-x30sn" name="content_hi.teaserChat" value={formData.content_hi.teaserChat} onChange={handleInputChange} />
                    </div>
                    <div className="cs-group-x30sn">
                        <label className="cs-label-x30sn">Call To Action</label>
                        <input className="cs-input-x30sn" name="content_hi.cta" value={formData.content_hi.cta} onChange={handleInputChange} />
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="cs-card-x30sn">
                <div className="cs-grid-x30sn">
                    <label className="cs-checkbox-group-x30sn">
                        <input type="checkbox" className="cs-checkbox-x30sn" name="featured" checked={formData.featured} onChange={handleInputChange} />
                        <span style={{fontSize:14, fontWeight:600}}>Featured Story</span>
                    </label>
                    <label className="cs-checkbox-group-x30sn">
                        <input type="checkbox" className="cs-checkbox-x30sn" name="trending" checked={formData.trending} onChange={handleInputChange} />
                        <span style={{fontSize:14, fontWeight:600}}>Trending Story</span>
                    </label>
                </div>
            </div>

            <div className="cs-actions-x30sn">
                <button type="button" className="cs-btn-x30sn secondary">Cancel</button>
                <button type="submit" className="cs-btn-x30sn primary" disabled={loading}>{loading ? 'Creating...' : 'Publish Story'}</button>
            </div>

          </form>
        </div>

        {/* Right Preview Section */}
        <div className="cs-preview-section-x30sn">
            <div className="cs-card-x30sn" style={{position:'sticky', top:20}}>
                <div className="cs-card-title-x30sn">Preview</div>
                {/* Simple mobile-like preview */}
                <div style={{background:'#111', borderRadius:20, overflow:'hidden', border:'4px solid #333', aspectRatio:'9/16'}}>
                    <div style={{height:'40%', background:`url(${backgroundPreview || '/placeholder.jpg'}) center/cover`}}></div>
                    <div style={{padding:15}}>
                        <h4 style={{color:'#fff', margin:'0 0 5px 0'}}>{formData.title || 'Title'}</h4>
                        <div style={{fontSize:11, color:'#ff69b4', marginBottom:10}}>{formData.category} • {formData.city}</div>
                        <p style={{fontSize:12, color:'#ccc', lineHeight:1.4}}>{formData.excerpt || 'Excerpt...'}</p>
                        
                        <div style={{display:'flex', gap:10, alignItems:'center', background:'#222', padding:10, borderRadius:8, marginTop:10}}>
                            <img src={avatarPreview || '/placeholder.png'} style={{width:40, height:40, borderRadius:'50%', objectFit:'cover'}} alt=""/>
                            <div>
                                <div style={{color:'#fff', fontSize:13, fontWeight:'bold'}}>{formData.characterName || 'Name'}</div>
                                <div style={{color:'#888', fontSize:10}}>{formData.characterAge}y</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* CHARACTER MODAL */}
      {showCharacterModal && (
        <div className="cs-modal-overlay-x30sn">
            <div className="cs-modal-box-x30sn">
                <div className="cs-modal-header-x30sn">
                    <h3>Select Character</h3>
                    <button className="cs-btn-x30sn secondary" onClick={() => setShowCharacterModal(false)}>Close</button>
                </div>
                <div className="cs-char-grid-x30sn">
                    {loadingCharacters ? <div style={{color:'#fff', padding:20}}>Loading...</div> : 
                     characters.map(char => (
                        <div key={char.id} className="cs-char-card-x30sn" onClick={() => handleSelectCharacter(char)}>
                            <img src={char.avatar_img} alt=""/>
                            <h4>{char.name}</h4>
                            <p>{char.relationship}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default CreateStoryPage;