const mongoose = require("mongoose");
require("dotenv").config();
const PrebuiltAIFriend = require("./models/PrebuiltAIFriend");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB!");
  
  const friends = await PrebuiltAIFriend.find().limit(5);
  for (const f of friends) {
    console.log(`Friend: ${f.name}`);
    console.log(`- Avatar: ${f.avatar_img}`);
    console.log(`- Video: ${f.avatar_motion_video}`);
    console.log(`- Image Gallery:`, f.img_gallery);
    console.log(`- Video Gallery:`, f.video_gallery);
    console.log("------------------------");
  }
  
  await mongoose.disconnect();
}

run();
