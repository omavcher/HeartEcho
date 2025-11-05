/**
 * Script to fix LetterBox collection indexes
 * Removes old unique index on 'owner' field and ensures only compound index exists
 * 
 * Run this once: node Server/scripts/fixLetterBoxIndex.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function fixLetterBoxIndexes() {
  try {
    // Connect to database
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('letterboxes');
    
    console.log('Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Check for old unique index on 'owner' field
    const ownerIndex = indexes.find(index => 
      index.name === 'owner_1' || 
      (index.key && Object.keys(index.key).length === 1 && index.key.owner === 1)
    );
    
    if (ownerIndex) {
      console.log('\nFound old unique index on owner field. Dropping it...');
      await collection.dropIndex(ownerIndex.name);
      console.log(`✓ Dropped index: ${ownerIndex.name}`);
    } else {
      console.log('\n✓ No old unique index on owner field found.');
    }
    
    // Check for compound index
    const compoundIndex = indexes.find(index => 
      index.key && 
      index.key.owner === 1 && 
      index.key.aiFriendName === 1
    );
    
    if (!compoundIndex) {
      console.log('\nCreating compound unique index on { owner: 1, aiFriendName: 1 }...');
      await collection.createIndex(
        { owner: 1, aiFriendName: 1 },
        { unique: true, name: 'owner_1_aiFriendName_1' }
      );
      console.log('✓ Created compound unique index');
    } else {
      console.log('\n✓ Compound index already exists');
    }
    
    // Verify final state
    console.log('\nFinal indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)} (unique: ${index.unique || false})`);
    });
    
    console.log('\n✅ Index fix completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
}

fixLetterBoxIndexes();

