// gemini-ai-model.js - Google Gemini AI Integration with Multiple API Key Fallback
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

// Google Gemini API keys (supports multiple keys for fallback)
const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY, 
].filter(key => key && key.trim() !== ""); // Remove empty keys

class GeminiAI {
  constructor() {
    if (GEMINI_API_KEYS.length === 0) {
      throw new Error("⚠️ No Gemini API keys configured. Set at least one GEMINI_API_KEY_* in .env file.");
    }
    
    this.apiKeys = GEMINI_API_KEYS;
    this.currentKeyIndex = 0;
    this.failedKeys = new Set(); // Track failed keys
    this.available = false;
    this.genAI = null;
    
    this.initializeWithCurrentKey();
    
    // Model configuration
    this.modelConfig = {
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
    
    console.log(`✅ Gemini AI initialized with ${this.apiKeys.length} API key(s)`);
    console.log(`📊 Available keys: ${this.apiKeys.map((_, i) => `Key_${i+1}`).join(', ')}`);
  }

  /**
   * Initialize Gemini AI with current key
   */
  initializeWithCurrentKey() {
    const currentKey = this.apiKeys[this.currentKeyIndex];
    
    try {
      this.genAI = new GoogleGenerativeAI(currentKey);
      this.available = true;
      console.log(`✅ Using Gemini API Key_${this.currentKeyIndex + 1} (${currentKey.substring(0, 8)}...)`);
    } catch (error) {
      console.error(`❌ Failed to initialize with Key_${this.currentKeyIndex + 1}:`, error.message);
      this.markKeyAsFailed();
      this.rotateToNextKey();
    }
  }

  /**
   * Mark current key as failed and try next key
   */
  markKeyAsFailed() {
    this.failedKeys.add(this.currentKeyIndex);
    console.log(`⚠️ Marked Key_${this.currentKeyIndex + 1} as failed`);
  }

  /**
   * Rotate to next available API key
   */
  rotateToNextKey() {
    const originalIndex = this.currentKeyIndex;
    let attempts = 0;
    
    while (attempts < this.apiKeys.length) {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      attempts++;
      
      // Skip keys that are already marked as failed
      if (this.failedKeys.has(this.currentKeyIndex)) {
        continue;
      }
      
      try {
        const newKey = this.apiKeys[this.currentKeyIndex];
        this.genAI = new GoogleGenerativeAI(newKey);
        this.available = true;
        console.log(`🔄 Rotated to Key_${this.currentKeyIndex + 1} (${newKey.substring(0, 8)}...)`);
        return true;
      } catch (error) {
        console.error(`❌ Failed to rotate to Key_${this.currentKeyIndex + 1}:`, error.message);
        this.failedKeys.add(this.currentKeyIndex);
      }
    }
    
    // If all keys failed
    this.available = false;
    console.error("❌ All API keys have failed");
    return false;
  }

  /**
   * Get working key index
   */
  getWorkingKeyInfo() {
    return {
      currentKeyIndex: this.currentKeyIndex,
      totalKeys: this.apiKeys.length,
      failedKeys: Array.from(this.failedKeys),
      available: this.available,
      currentKeyPreview: this.available ? 
        `${this.apiKeys[this.currentKeyIndex].substring(0, 8)}...` : 'None'
    };
  }

  /**
   * Generate AI response with automatic key rotation on failure
   */
  async generateAIResponse(prompt, maxRetries = 3) {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      if (!this.available) {
        if (!this.rotateToNextKey()) {
          throw new Error("Gemini AI not available - all API keys failed");
        }
      }

      try {
        console.log(`🔄 Generating response with Gemini AI (Key_${this.currentKeyIndex + 1})...`);
        
        const model = this.genAI.getGenerativeModel({ 
          model: this.modelConfig.model,
          generationConfig: this.modelConfig.generationConfig,
          safetySettings: this.modelConfig.safetySettings
        });
        
        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const responseTime = Date.now() - startTime;
        
        if (!result || !result.response) {
          throw new Error("No response from Gemini AI");
        }
        
        const text = result.response.text();
        
        if (!text || text.trim().length < 5) {
          throw new Error("Empty response from Gemini AI");
        }
        
        console.log(`✅ Gemini response (${responseTime}ms, Key_${this.currentKeyIndex + 1}):`, text.substring(0, 50) + "...");
        return text.trim();
        
      } catch (error) {
        console.error(`❌ Gemini AI error with Key_${this.currentKeyIndex + 1}:`, error.message);
        
        // Mark current key as failed
        this.markKeyAsFailed();
        
        // Check if this is a quota/rate limit error (common reasons to rotate key)
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('quota') || 
            errorMessage.includes('rate') || 
            errorMessage.includes('limit') ||
            errorMessage.includes('exceeded') ||
            errorMessage.includes('429')) {
          console.log(`⚠️ Quota/Rate limit detected, rotating to next key...`);
        }
        
        retryCount++;
        
        if (retryCount < maxRetries) {
          if (this.rotateToNextKey()) {
            console.log(`🔄 Retrying with new key (attempt ${retryCount + 1}/${maxRetries})...`);
            continue;
          }
        }
        
        throw new Error(`Gemini AI failed after ${retryCount} attempts: ${error.message}`);
      }
    }
  }

  /**
   * Generate persona-specific response with automatic key rotation
   */
  async generatePersonaResponse(prompt, personaContext, maxRetries = 3) {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      if (!this.available) {
        if (!this.rotateToNextKey()) {
          throw new Error("Gemini AI not available - all API keys failed");
        }
      }

      try {
        console.log(`🤖 Generating persona response with Gemini (Key_${this.currentKeyIndex + 1})...`);
        
        // Combine persona context with prompt
        const fullPrompt = `${personaContext}\n\nUser says: "${prompt}"\n\nAI Response (in Hinglish/Roman script, casual, friendly tone):`;
        
        const model = this.genAI.getGenerativeModel({ 
          model: this.modelConfig.model,
          generationConfig: {
            ...this.modelConfig.generationConfig,
            temperature: 0.8, // Slightly higher temperature for persona
            maxOutputTokens: 150
          },
          safetySettings: this.modelConfig.safetySettings
        });
        
        const startTime = Date.now();
        const result = await model.generateContent(fullPrompt);
        const responseTime = Date.now() - startTime;
        
        if (!result || !result.response) {
          throw new Error("No response from Gemini AI");
        }
        
        const text = result.response.text();
        
        if (!text || text.trim().length < 5) {
          throw new Error("Empty persona response from Gemini AI");
        }
        
        const cleanedText = this.cleanPersonaResponse(text);
        console.log(`✅ Persona response (${responseTime}ms, Key_${this.currentKeyIndex + 1}):`, cleanedText.substring(0, 50) + "...");
        return cleanedText;
        
      } catch (error) {
        console.error(`❌ Gemini Persona error with Key_${this.currentKeyIndex + 1}:`, error.message);
        
        // Mark current key as failed
        this.markKeyAsFailed();
        
        // Check for quota/rate limit errors
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('quota') || 
            errorMessage.includes('rate') || 
            errorMessage.includes('limit') ||
            errorMessage.includes('exceeded') ||
            errorMessage.includes('429')) {
          console.log(`⚠️ Quota/Rate limit detected, rotating to next key...`);
        }
        
        retryCount++;
        
        if (retryCount < maxRetries) {
          if (this.rotateToNextKey()) {
            console.log(`🔄 Retrying persona with new key (attempt ${retryCount + 1}/${maxRetries})...`);
            continue;
          }
        }
        
        throw new Error(`Gemini Persona failed after ${retryCount} attempts: ${error.message}`);
      }
    }
  }

  /**
   * Clean persona response to match our format
   */
  cleanPersonaResponse(response) {
    if (!response) return "";
    
    // Remove any AI prefixes
    const cleaned = response
      .replace(/^(AI|Assistant|Bot|Model|Gemini):\s*/gi, '')
      .replace(/["']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  }

  /**
   * Test Gemini AI connection with all keys
   */
  async testConnection() {
    if (GEMINI_API_KEYS.length === 0) {
      return {
        status: "❌ NOT CONFIGURED",
        message: "No Gemini API keys configured",
        available: false,
        keys: []
      };
    }

    const results = [];
    let workingKeyFound = false;
    
    for (let i = 0; i < this.apiKeys.length; i++) {
      try {
        console.log(`🔌 Testing Gemini AI connection with Key_${i + 1}...`);
        
        const tempGenAI = new GoogleGenerativeAI(this.apiKeys[i]);
        const testPrompt = "Say 'Hello' in one word.";
        const model = tempGenAI.getGenerativeModel({ 
          model: this.modelConfig.model,
          generationConfig: { maxOutputTokens: 10 }
        });
        
        const startTime = Date.now();
        const result = await model.generateContent(testPrompt);
        const responseTime = Date.now() - startTime;
        
        const response = result.response.text();
        
        console.log(`✅ Key_${i + 1} test successful (${responseTime}ms):`, response);
        
        results.push({
          keyIndex: i + 1,
          status: "✅ WORKING",
          response: response,
          responseTime: responseTime + "ms",
          preview: this.apiKeys[i].substring(0, 8) + "..."
        });
        
        workingKeyFound = true;
        
        // Set this as current key if it's working
        if (!workingKeyFound) {
          this.currentKeyIndex = i;
          this.genAI = tempGenAI;
          this.available = true;
        }
        
      } catch (error) {
        console.error(`❌ Key_${i + 1} test failed:`, error.message);
        
        results.push({
          keyIndex: i + 1,
          status: "❌ FAILED",
          error: error.message,
          preview: this.apiKeys[i].substring(0, 8) + "..."
        });
      }
    }
    
    const status = workingKeyFound ? "✅ PARTIALLY WORKING" : "❌ ALL FAILED";
    
    return {
      status: status,
      available: workingKeyFound,
      totalKeys: this.apiKeys.length,
      workingKeys: results.filter(r => r.status === "✅ WORKING").length,
      failedKeys: results.filter(r => r.status === "❌ FAILED").length,
      keyDetails: results,
      currentKey: this.available ? this.currentKeyIndex + 1 : null
    };
  }

  /**
   * Reset failed keys (useful for periodic reset)
   */
  resetFailedKeys() {
    const previousCount = this.failedKeys.size;
    this.failedKeys.clear();
    console.log(`🔄 Reset ${previousCount} failed keys`);
    return previousCount;
  }

  /**
   * Manually switch to specific key
   */
  switchToKey(keyIndex) {
    if (keyIndex < 0 || keyIndex >= this.apiKeys.length) {
      throw new Error(`Invalid key index. Must be between 0 and ${this.apiKeys.length - 1}`);
    }
    
    try {
      const newKey = this.apiKeys[keyIndex];
      this.genAI = new GoogleGenerativeAI(newKey);
      this.currentKeyIndex = keyIndex;
      this.available = true;
      this.failedKeys.delete(keyIndex); // Remove from failed list if it was there
      
      console.log(`🔀 Manually switched to Key_${keyIndex + 1} (${newKey.substring(0, 8)}...)`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to switch to Key_${keyIndex + 1}:`, error.message);
      this.failedKeys.add(keyIndex);
      return false;
    }
  }
}

// Create singleton instance
const geminiAI = new GeminiAI();
module.exports = geminiAI;