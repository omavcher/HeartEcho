// groq-multi-model.js - Updated with backup API keys
const Groq = require("groq-sdk");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();

// Primary API keys
const PRIMARY_KEYS = {
  groq: process.env.GROQ_API_KEY,
  gemini: process.env.GEMINI_API_KEY
};

// Backup API keys
const BACKUP_KEYS = {
  groq: process.env.GROQ_API_KEY_2 || process.env.GROQ_API_KEY,
  gemini: process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY
};

// List of all available free models in priority order
const FREE_MODELS = [
  "llama-3.1-8b-instant",                    // Fast and efficient
  "llama-3.3-70b-versatile",                // More capable
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "meta-llama/llama-guard-4-12b",
  "qwen/qwen3-32b",
  "moonshotai/kimi-k2-instruct",
  "moonshotai/kimi-k2-instruct-0905",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-safeguard-20b",
  "groq/compound",
  "groq/compound-mini",
  "allam-2-7b",
  "meta-llama/llama-prompt-guard-2-22m",
  "meta-llama/llama-prompt-guard-2-86m"
];

class GroqMultiModel {
  constructor() {
    this.modelIndex = 0;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.currentKeySet = 'primary'; // 'primary' or 'backup'
    this.attemptLog = []; // Track attempts for debugging
  }

  async chatCompletion(messages, options = {}) {
    const {
      temperature = 0.7,
      max_tokens = 1024,
      top_p = 1,
      stream = false
    } = options;

    // Reset tracking for new request
    this.attemptLog = [];
    this.modelIndex = 0;
    this.retryCount = 0;

    // Step 1: Try Google Gemini with primary key
    console.log(`🔄 Step 1: Trying Google Gemini (Primary API Key)...`);
    let geminiResult = await this.tryGemini(messages, options, 'primary');
    
    if (geminiResult.success) {
      console.log(`✅ Success with Google Gemini (Primary Key)`);
      return geminiResult;
    }

    console.log(`❌ Google Gemini (Primary) failed, trying Groq models...`);

    // Step 2: Try all Groq models with primary key
    this.currentKeySet = 'primary';
    console.log(`🔄 Step 2: Trying Groq models (Primary API Key)...`);
    let groqResult = await this.tryGroqModels(messages, options);
    
    if (groqResult.success) {
      return groqResult;
    }

    // Step 3: Try Google Gemini with backup key
    console.log(`🔄 Step 3: Trying Google Gemini (Backup API Key)...`);
    geminiResult = await this.tryGemini(messages, options, 'backup');
    
    if (geminiResult.success) {
      console.log(`✅ Success with Google Gemini (Backup Key)`);
      return geminiResult;
    }

    console.log(`❌ Google Gemini (Backup) failed, trying Groq with backup key...`);

    // Step 4: Try all Groq models with backup key
    this.currentKeySet = 'backup';
    console.log(`🔄 Step 4: Trying Groq models (Backup API Key)...`);
    groqResult = await this.tryGroqModels(messages, options);
    
    if (groqResult.success) {
      return groqResult;
    }

    // Step 5: If all failed, return error
    console.log(`❌ All AI models and API keys failed.`);
    return {
      success: false,
      source: 'none',
      error: "All AI models failed. Please try again later.",
      attempts: this.attemptLog
    };
  }

  async tryGemini(messages, options, keyType = 'primary') {
    const apiKey = keyType === 'primary' ? PRIMARY_KEYS.gemini : BACKUP_KEYS.gemini;
    
    if (!apiKey) {
      this.attemptLog.push(`Gemini ${keyType} key not available`);
      return {
        success: false,
        source: 'gemini',
        error: `Gemini ${keyType} API key not configured`
      };
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const { temperature = 0.7 } = options;
      
      // Convert OpenAI format messages to Gemini format
      const geminiPrompt = messages.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n');
      
      const geminiResult = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: geminiPrompt }] }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: 1024,
        }
      });

      const geminiResponse = await geminiResult.response;
      const text = geminiResponse.text();
      
      this.attemptLog.push(`Gemini (${keyType} key): Success`);
      
      return {
        success: true,
        source: 'gemini',
        keyType: keyType,
        model: 'gemini-2.0-flash',
        content: text,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        fullResponse: geminiResponse
      };
      
    } catch (error) {
      this.attemptLog.push(`Gemini (${keyType} key): Failed - ${error.message}`);
      return {
        success: false,
        source: 'gemini',
        keyType: keyType,
        error: error.message
      };
    }
  }

  async tryGroqModels(messages, options) {
    const {
      temperature = 0.7,
      max_tokens = 1024,
      top_p = 1,
      stream = false
    } = options;

    const apiKey = this.currentKeySet === 'primary' ? PRIMARY_KEYS.groq : BACKUP_KEYS.groq;
    
    if (!apiKey) {
      this.attemptLog.push(`Groq ${this.currentKeySet} key not available`);
      return {
        success: false,
        source: 'groq',
        error: `Groq ${this.currentKeySet} API key not configured`
      };
    }

    const groqClient = new Groq({ apiKey });

    while (this.modelIndex < FREE_MODELS.length) {
      const currentModel = FREE_MODELS[this.modelIndex];
      
      try {
        console.log(`🔄 Trying Groq model: ${currentModel} (${this.currentKeySet} key, ${this.modelIndex + 1}/${FREE_MODELS.length})`);
        
        const result = await groqClient.chat.completions.create({
          model: currentModel,
          messages: messages,
          temperature: temperature,
          max_tokens: max_tokens,
          top_p: top_p,
          stream: stream
        });

        console.log(`✅ Success with Groq model: ${currentModel} (${this.currentKeySet} key)`);
        
        this.attemptLog.push(`Groq (${this.currentKeySet} key, ${currentModel}): Success`);
        
        return {
          success: true,
          source: 'groq',
          keyType: this.currentKeySet,
          model: currentModel,
          content: result.choices[0].message.content,
          usage: result.usage,
          fullResponse: result
        };

      } catch (error) {
        this.attemptLog.push(`Groq (${this.currentKeySet} key, ${currentModel}): Failed - ${error.message}`);
        console.log(`❌ Groq model ${currentModel} (${this.currentKeySet} key) failed: ${error.message}`);
        
        // Check if it's a rate limit error
        if (error.status === 429) {
          const retryAfter = error.headers?.['retry-after'] || 2;
          console.log(`⏳ Rate limit hit. Waiting ${retryAfter} seconds...`);
          await this.delay(retryAfter * 1000);
          continue; // Retry same model after delay
        }

        // Check if it's a token limit error or model-specific error
        if (error.message.includes('token') || 
            error.message.includes('model') || 
            error.message.includes('overload') ||
            error.message.includes('capacity')) {
          
          this.modelIndex++; // Move to next model
          this.retryCount = 0;
          console.log(`🔄 Switching to next Groq model...`);
          continue;
        }

        // For other errors, retry with same model
        this.retryCount++;
        if (this.retryCount >= this.maxRetries) {
          console.log(`⏩ Max retries reached for current model, switching...`);
          this.modelIndex++;
          this.retryCount = 0;
        } else {
          console.log(`🔄 Retrying Groq model ${currentModel} (${this.retryCount}/${this.maxRetries})`);
          await this.delay(1000); // Wait 1 second before retry
        }
      }
    }

    // Reset for next attempt
    this.modelIndex = 0;
    this.retryCount = 0;
    
    return {
      success: false,
      source: 'groq',
      keyType: this.currentKeySet,
      error: `All Groq models failed with ${this.currentKeySet} key`,
      attempts: this.attemptLog.filter(a => a.includes(this.currentKeySet))
    };
  }

  async generateAIResponse(prompt) {
    const messages = [
      {
        role: "system",
        content: "You are a helpful AI assistant. Respond in a friendly, conversational manner."
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const result = await this.chatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 1024
    });

    if (result.success) {
      // Add source info to response for debugging
      const sourceInfo = result.source === 'gemini' 
        ? `(Gemini - ${result.keyType} key)`
        : `(Groq ${result.model} - ${result.keyType} key)`;
      
      console.log(`✅ Response generated successfully ${sourceInfo}`);
      return result.content;
    } else {
      console.error(`❌ All AI attempts failed. Attempt log:`, this.attemptLog);
      throw new Error(result.error || "Failed to generate AI response");
    }
  }

  resetModels() {
    this.modelIndex = 0;
    this.retryCount = 0;
    console.log('🔄 Model selector reset to first model');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAvailableModels() {
    return {
      chat: FREE_MODELS,
      primary_keys: {
        groq: PRIMARY_KEYS.groq ? 'Configured' : 'Not configured',
        gemini: PRIMARY_KEYS.gemini ? 'Configured' : 'Not configured'
      },
      backup_keys: {
        groq: BACKUP_KEYS.groq ? 'Configured' : 'Not configured',
        gemini: BACKUP_KEYS.gemini ? 'Configured' : 'Not configured'
      }
    };
  }

  getCurrentModel() {
    return this.modelIndex < FREE_MODELS.length ? FREE_MODELS[this.modelIndex] : 'gemini-fallback';
  }

  getAttemptLog() {
    return this.attemptLog;
  }
}

// Create a singleton instance
const groqAI = new GroqMultiModel();
module.exports = groqAI;