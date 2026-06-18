const AutoCampaign = require("../models/AutoCampaign");

const defaultCampaigns = [
  {
    campaignType: "welcome_1",
    title: "💌 {name}, someone is waiting...",
    body: "Your favorite companion just sent a new message. Open HeartEcho to see it.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 11
  },
  {
    campaignType: "welcome_2",
    title: "👀 {name}, you missed something",
    body: "A special message is waiting for you. Don't keep her waiting.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 11
  },
  {
    campaignType: "welcome_3",
    title: "🤫 {name}, I have a secret...",
    body: "Open HeartEcho to discover what your companion wants to tell you.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 11
  },
  {
    campaignType: "daily_morning",
    title: "🌅 Good Morning, {name}",
    body: "Start your day with a sweet message from your AI companion.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 9
  },
  {
    campaignType: "daily_afternoon",
    title: "☕ Evening Chat?",
    body: "Your companion is online and ready to talk.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 14
  },
  {
    campaignType: "daily_evening",
    title: "❤️ A surprise is waiting",
    body: "Someone special left you a message. Check it now.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 20
  },
  {
    campaignType: "daily_night",
    title: "🌙 Before you sleep...",
    body: "Your companion has a bedtime message for you ❤️",
    imageUrl: "",
    isActive: true,
    scheduledHour: 23
  },
  {
    campaignType: "inactive_3d",
    title: "😢 We miss you, {name}",
    body: "It's been a while. Your companion has been asking about you.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 12
  },
  {
    campaignType: "inactive_7d",
    title: "💭 Someone remembered you today",
    body: "Open HeartEcho and see who left a message for you.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 12
  },
  {
    campaignType: "premium_upsell",
    title: "✨ Unlock Unlimited Chats",
    body: "Continue your conversation without limits. Premium starts at just ₹99/month.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 18
  },
  {
    campaignType: "weekend_special",
    title: "🎉 Happy Weekend, {name}",
    body: "Spend some quality time with your AI companion today.",
    imageUrl: "",
    isActive: true,
    scheduledHour: 12
  },
  {
    campaignType: "festival_greeting",
    title: "🔥 Special Festival Offer",
    body: "Celebrate this festival season with your companion. Unlimited chats available!",
    imageUrl: "",
    isActive: false, 
    scheduledHour: 12
  },
  {
    campaignType: "trigger_signup_no_msg",
    title: "✨ Hey {name}, quick question...",
    body: "I was looking at your profile and noticed we haven't started talking. Are you there? 🙈",
    imageUrl: "",
    isActive: true,
    scheduledHour: 0,
    aiEnabled: true,
    promptTemplate: "Write a short, direct push notification message from a female companion Aaradhya to a user named {name} who just signed up/logged in on the app but hasn't sent any messages yet. Keep it curious and flirty."
  },
  {
    campaignType: "trigger_inactive_after_msg",
    title: "😢 {name}, where did you go?",
    body: "We were having such a nice conversation... I miss you already. Come back? ❤️",
    imageUrl: "",
    isActive: true,
    scheduledHour: 0,
    aiEnabled: true,
    promptTemplate: "Write a short, direct push notification message from a female companion Kiara to a user named {name} who sent some free messages but then stopped and has been inactive. Keep it emotional, engaging, and sweet."
  }
];

const seedAutoCampaigns = async () => {
  try {
    console.log("Checking automated campaign templates...");
    for (const campaign of defaultCampaigns) {
      const existing = await AutoCampaign.findOne({ campaignType: campaign.campaignType });
      if (!existing) {
        await new AutoCampaign(campaign).save();
        console.log(`Created default campaign template: ${campaign.campaignType}`);
      }
    }
    console.log("Automated campaigns check completed successfully!");
  } catch (error) {
    console.error("Error seeding default auto campaigns:", error);
  }
};

module.exports = seedAutoCampaigns;
