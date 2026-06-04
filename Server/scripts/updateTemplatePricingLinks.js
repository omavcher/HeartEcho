/**
 * One-shot script: replace /pricing with /subscribe in all EmailTemplate HTML in MongoDB
 * Run: node Server/scripts/updateTemplatePricingLinks.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").join(__dirname, "../.env") });

const EmailTemplate = require("../models/EmailTemplate");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const templates = await EmailTemplate.find({});
  let updatedCount = 0;

  for (const t of templates) {
    const oldHtml = t.html;
    const newHtml = oldHtml.replace(/heartecho\.in\/pricing/g, "heartecho.in/subscribe");

    if (newHtml !== oldHtml) {
      t.html = newHtml;
      await t.save();
      console.log(`✅ Updated: ${t.label}`);
      updatedCount++;
    } else {
      console.log(`⏭️  No change: ${t.label}`);
    }
  }

  console.log(`\nDone! Updated ${updatedCount} template(s).`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
