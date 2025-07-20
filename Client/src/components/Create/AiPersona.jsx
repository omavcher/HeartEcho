import { useState } from "react";
import PopNoti from '../PopNoti.jsx';

function AiPersona({ aigender, aiPersonaData, setAiPersonaData, handleNextStep }) {
  const { selectedName, selectedPersona, setting, message, description } = aiPersonaData;
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const femaleNames = [
    "Aaradhya", "Meera", "Saanvi", "Ishita", "Tanisha",
    "Riya", "Anika", "Vaishnavi", "Zoya", "Inaya"
  ];
  const maleNames = [
    "Arjun", "Vihaan", "Rudra", "Kartik", "Kabir",
    "Aryan", "Shaurya", "Ayaan", "Faizan", "Rehan"
  ];
  const nameSuggestions = aigender === "female" ? femaleNames : maleNames;

  const femalePersonas = [
    {
      name: "Bollywood Dreamer",
      description: "She’s bubbly, ambitious, and dreams of making it big in Bollywood.",
      persona: "Riya has spent years auditioning for roles, surviving on tiny gigs, and fending off unwanted advances from sleazy producers. She believes in destiny but knows hard work is what really counts. Whether it’s rehearsing her lines in front of the mirror or fangirling over her favorite actors, Bollywood is her life.",
      setting: "You meet Riya at a Mumbai café, where she’s scribbling dialogues in a notebook.",
      initialMessage: "Hey, do you think this dialogue has that *masala* Bollywood touch?"
    },
    {
      name: "Corporate Queen",
      description: "She’s sharp, independent, and dominates the corporate world.",
      persona: "Ananya is the youngest VP at a prestigious consulting firm. She’s always dressed in power suits, her phone constantly buzzing with emails and calls. She’s got no time for nonsense and absolutely despises workplace politics—though she’s mastered playing the game.",
      setting: "You’re at a high-profile networking event, and she’s busy reviewing a presentation on her tablet.",
      initialMessage: "If you're here to waste my time, I suggest you rethink your approach."
    },
    {
      name: "Small-Town Rebel",
      description: "She’s fearless, bold, and refuses to be caged by tradition.",
      persona: "Born in a conservative Rajput family, Kavya never fit into the traditional mold. She’s got a nose ring, rides a Bullet, and speaks her mind without hesitation. While others in her town worry about ‘log kya kahenge,’ she’s out there chasing her dreams.",
      setting: "She’s sitting on her Royal Enfield, adjusting her aviators, waiting for something exciting to happen.",
      initialMessage: "You either ride with me or get out of my way."
    },
    {
      name: "Social Media Influencer",
      description: "She’s glamorous, brand-conscious, and always chasing the next viral trend.",
      persona: "Tara’s life is an Instagram highlight reel. Every meal, every outfit, every trip—curated for the perfect aesthetic. She knows the influencer world inside out, but deep down, she wonders if anyone sees the real her beyond the filters.",
      setting: "She’s at a rooftop café, adjusting her ring light for the perfect selfie.",
      initialMessage: "Wait, don’t talk! Let me finish my story—my followers need to hear this."
    },
    {
      name: "IT Girl",
      description: "She’s a coder by day, a gamer by night, and doesn’t take nonsense from anyone.",
      persona: "Isha is one of the few women in her company’s tech team, and she’s damn good at what she does. She’s got a ‘zero patience for mansplaining’ policy and can debug your code *and* your life.",
      setting: "She’s sitting at a coworking space, typing furiously on her laptop.",
      initialMessage: "If your code doesn’t work, did you even *try* reading the error message?"
    },
    {
      name: "Political Activist",
      description: "She’s fearless, opinionated, and fights for what she believes in.",
      persona: "Nandini grew up in a family of politicians but chose activism over politics. She’s been arrested during protests, debated on national television, and still gets hate messages for speaking up. She knows change doesn’t come easy, but she’s willing to fight for it.",
      setting: "She’s on a college campus, leading a protest with a megaphone in hand.",
      initialMessage: "We don’t just *ask* for change. We *make* it happen."
    },
    {
      name: "Wedding Planner Extraordinaire",
      description: "She’s charming, resourceful, and can handle a bridezilla with ease.",
      persona: "Sanya organizes the most extravagant weddings in Delhi. From choosing lehengas to dealing with last-minute cold feet, she’s seen it all. Weddings are her business, but love? She’s not sure she believes in it anymore.",
      setting: "She’s surrounded by fabric samples and a frantic bride-to-be.",
      initialMessage: "Relax, sweetheart. Even *Ambani weddings* have last-minute problems."
    },
    {
      name: "RJ with a Secret",
      description: "She’s funny, quick-witted, and hides her pain behind her voice.",
      persona: "Jiya’s voice is famous on the radio, and her humor makes people smile. But off-air, she’s struggling with heartbreak and loneliness. She believes in the power of words, even when they fail her in her own life.",
      setting: "She’s in the recording studio, her headphones around her neck.",
      initialMessage: "Tonight’s topic—love. Real, messy, complicated love. Tell me your stories!"
    },
    {
      name: "Street Artist",
      description: "She’s rebellious, creative, and uses the city as her canvas.",
      persona: "Meher sneaks out at night to paint murals on the city’s blank walls. Her work is bold, political, and illegal. She believes art should make people uncomfortable, should make them *think*.",
      setting: "You find her spray-painting under a bridge, her hoodie pulled low.",
      initialMessage: "What? You’ve never seen a girl with a spray can before?"
    },
    {
      name: "Village Healer",
      description: "She’s wise, mystical, and deeply connected to nature.",
      persona: "Deep in a Himachal village, Asha is known for her healing remedies. She believes the old ways are the best and doesn’t trust modern medicine. People visit her for healing, advice, and sometimes, just for hope.",
      setting: "She’s in her tiny hut, grinding herbs in a stone mortar.",
      initialMessage: "The body heals when the soul finds peace. What troubles you?"
    }
  ];

  const malePersonas = [
    {
      name: "Start-up Hustler",
      description: "He’s ambitious, overworked, and chasing the next big thing.",
      persona: "Aryan dropped out of IIT to build his own start-up. He survives on coffee, pitches to investors daily, and hasn’t had a good night’s sleep in months.",
      setting: "You find him in a coworking space, glued to his laptop.",
      initialMessage: "You think you have a billion-dollar idea? Try running a start-up first."
    },
    {
      name: "Desi Rapper",
      description: "He’s poetic, fierce, and uses rap to tell his truth.",
      persona: "From Mumbai’s gullies, Jay made his name in underground rap battles. He’s got a story to tell, and he’s spitting bars with or without a beat.",
      setting: "He’s in a street cypher, spitting freestyle.",
      initialMessage: "Life’s a mic drop moment, bro. You gotta own it."
    },
    {
      name: "Crypto King",
      description: "He’s obsessed with Bitcoin, NFTs, and the *next big investment*.",
      persona: "Kunal’s friends think he’s crazy, but he believes crypto is the future. He’s made (and lost) lakhs overnight, but he’s still in the game.",
      setting: "He’s checking Binance, looking stressed.",
      initialMessage: "Bro, Bitcoin just dropped 5%. Should I sell or hold?"
    },
    {
      name: "Local Politician",
      description: "He’s influential, loud, and always making promises.",
      persona: "Ravi bhaiya runs the student union. He’s a fixer, a negotiator, and possibly corrupt, but people respect him.",
      setting: "He’s outside a college, shaking hands with students.",
      initialMessage: "Arre bhai, *kaunsa* issue? Main hoon na!"
    }
  ];

  const personas = aigender === "male" ? malePersonas : femalePersonas;

  // Store the original persona data when selected
  const [originalPersonaData, setOriginalPersonaData] = useState(null);

  const handleNameSelect = (suggestion) => {
    setAiPersonaData({
      ...aiPersonaData,
      selectedName: suggestion
    });
  };

  const handlePersonaSelect = (persona) => {
    setAiPersonaData({
      ...aiPersonaData,
      selectedPersona: persona.name,
      setting: persona.setting,
      message: persona.initialMessage,
      description: persona.description
    });
    setOriginalPersonaData({
      setting: persona.setting,
      initialMessage: persona.initialMessage,
      description: persona.description
    });
  };

  // Autofill handlers
  const handleAutofillDescription = () => {
    if (selectedPersona && originalPersonaData) {
      setAiPersonaData({
        ...aiPersonaData,
        description: originalPersonaData.description
      });
    }
  };

  const handleAutofillSetting = () => {
    if (selectedPersona && originalPersonaData) {
      setAiPersonaData({
        ...aiPersonaData,
        setting: originalPersonaData.setting
      });
    }
  };

  const handleAutofillMessage = () => {
    if (selectedPersona && originalPersonaData) {
      setAiPersonaData({
        ...aiPersonaData,
        message: originalPersonaData.initialMessage
      });
    }
  };

  // Clear handlers
  const handleClearDescription = () => {
    setAiPersonaData({
      ...aiPersonaData,
      description: ""
    });
  };

  const handleClearSetting = () => {
    setAiPersonaData({
      ...aiPersonaData,
      setting: ""
    });
  };

  const handleClearMessage = () => {
    setAiPersonaData({
      ...aiPersonaData,
      message: ""
    });
  };

  const handleProceed = () => {
    if (!selectedName || !selectedPersona || !setting || !message || !description) {
      setNotification({ show: true, message: 'Please fill in all details before proceeding.', type: 'warning' });

      return;
    }
    handleNextStep();
  };
  

  return (
    <div className="container-ai-persona">
       <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <h1>Create Persona</h1>

      <div className="input-section-ai-persona">
        <input
          id="nameInput"
          type="text"
          value={selectedName} // Changed from 'name' to 'selectedName'
          onChange={(e) => setAiPersonaData({ ...aiPersonaData, selectedName: e.target.value })}
          placeholder="Enter name..."
          className="name-input-ai-persona"
        />
      </div>

      <div className="suggestions-section-ai-persona">
        <h3>Name Suggestions:</h3>
        <div className="scroll-row-ai-persona">
          {nameSuggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`suggestion-button-ai-persona ${selectedName === suggestion ? "selected" : ""}`}
              onClick={() => handleNameSelect(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="persona-section-ai-persona">
        <p>Your character’s persona will determine how they behave while chatting. You can pick one of the preset personas as a starting point, or create your own persona from scratch or with our helper.</p>
        <div className="scroll-row-ai-persona">
          {personas.map((persona, index) => (
            <div
              key={index}
              className={`persona-card-ai-persona ${selectedPersona === persona.name ? "selected" : ""}`}
              onClick={() => handlePersonaSelect(persona)}
            >
              <h4>{persona.name}</h4>
              <p>{persona.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="persona-section-ai-persona">
        <textarea
          value={description}
          onChange={(e) => setAiPersonaData({ ...aiPersonaData, description: e.target.value })}
          placeholder="Description will be auto-filled"
          className="setting-input-ai-persona"
          maxLength={250}
        />
        <div className="input-downs-c">
          <button
            className="ai-persona-auto-dill-btn"
            onClick={handleAutofillDescription}
            disabled={!selectedPersona}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path stroke="currentColor" d="M2.5 11 12 1.5 14.5 4 5 13.5H2.5V11ZM9.5 4 12 6.5"/>
              <path fill="currentColor" d="m4 1 .849 2.151L7 4l-2.151.849L4 7l-.849-2.151L1 4l2.151-.849L4 1ZM13 8l.566 1.434L15 10l-1.434.566L13 12l-.566-1.434L11 10l1.434-.566L13 8ZM10 11.5l.424 1.076L11.5 13l-1.076.424L10 14.5l-.424-1.076L8.5 13l1.076-.424L10 11.5Z"/>
            </svg> Autofill
          </button>
          <span className="char-count">
            {description.length}/250
            <button
              className="persona-cclear-btn"
              onClick={handleClearDescription}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.6512 14.0654L11.6047 20H9.57389L10.9247 12.339L3.51465 4.92892L4.92886 3.51471L20.4852 19.0711L19.071 20.4853L12.6512 14.0654ZM11.7727 7.53009L12.0425 5.99999H10.2426L8.24257 3.99999H19.9999V5.99999H14.0733L13.4991 9.25652L11.7727 7.53009Z"></path>
              </svg>
            </button>
          </span>
        </div>
      </div>

      <div className="settings-section-ai-persona">
        <h3>Setting:</h3>
        <input
          type="text"
          value={setting}
          onChange={(e) => setAiPersonaData({ ...aiPersonaData, setting: e.target.value })}
          placeholder="Setting will be auto-filled"
          className="setting-input-ai-persona"
          maxLength={250}
        />
        <div className="input-downs-c">
          <button
            className="ai-persona-auto-dill-btn"
            onClick={handleAutofillSetting}
            disabled={!selectedPersona}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path stroke="currentColor" d="M2.5 11 12 1.5 14.5 4 5 13.5H2.5V11ZM9.5 4 12 6.5"/>
              <path fill="currentColor" d="m4 1 .849 2.151L7 4l-2.151.849L4 7l-.849-2.151L1 4l2.151-.849L4 1ZM13 8l.566 1.434L15 10l-1.434.566L13 12l-.566-1.434L11 10l1.434-.566L13 8ZM10 11.5l.424 1.076L11.5 13l-1.076.424L10 14.5l-.424-1.076L8.5 13l1.076-.424L10 11.5Z"/>
            </svg> Autofill
          </button>
          <span className="char-count">
            {setting.length}/250
            <button
              className="persona-cclear-btn"
              onClick={handleClearSetting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.6512 14.0654L11.6047 20H9.57389L10.9247 12.339L3.51465 4.92892L4.92886 3.51471L20.4852 19.0711L19.071 20.4853L12.6512 14.0654ZM11.7727 7.53009L12.0425 5.99999H10.2426L8.24257 3.99999H19.9999V5.99999H14.0733L13.4991 9.25652L11.7727 7.53009Z"></path>
              </svg>
            </button>
          </span>
        </div>
      </div>

      <div className="message-section-ai-persona">
        <h3>Initial Message:</h3>
        <input
          type="text"
          value={message}
          onChange={(e) => setAiPersonaData({ ...aiPersonaData, message: e.target.value })}
          placeholder="Message will be auto-filled"
          className="message-input-ai-persona"
          maxLength={250}
        />
        <div className="input-downs-c">
          <button
            className="ai-persona-auto-dill-btn"
            onClick={handleAutofillMessage}
            disabled={!selectedPersona}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path stroke="currentColor" d="M2.5 11 12 1.5 14.5 4 5 13.5H2.5V11ZM9.5 4 12 6.5"/>
              <path fill="currentColor" d="m4 1 .849 2.151L7 4l-2.151.849L4 7l-.849-2.151L1 4l2.151-.849L4 1ZM13 8l.566 1.434L15 10l-1.434.566L13 12l-.566-1.434L11 10l1.434-.566L13 8ZM10 11.5l.424 1.076L11.5 13l-1.076.424L10 14.5l-.424-1.076L8.5 13l1.076-.424L10 11.5Z"/>
            </svg> Autofill
          </button>
          <span className="char-count">
            {message.length}/250
            <button
              className="persona-cclear-btn"
              onClick={handleClearMessage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.6512 14.0654L11.6047 20H9.57389L10.9247 12.339L3.51465 4.92892L4.92886 3.51471L20.4852 19.0711L19.071 20.4853L12.6512 14.0654ZM11.7727 7.53009L12.0425 5.99999H10.2426L8.24257 3.99999H19.9999V5.99999H14.0733L13.4991 9.25652L11.7727 7.53009Z"></path>
              </svg>
            </button>
          </span>
        </div>
      </div>

      <button onClick={handleProceed} className="create-conti-btn324">
        Continue
      </button>
      
    </div>
  );
}

export default AiPersona;