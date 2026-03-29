/**
 * mongodbExample.js — Standalone connection test script for MongoDB Atlas
 * 
 * Usage: node backend/mongodbExample.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');

// 1. Configuration & Custom Prefix Support
const DB_PREFIX = process.env.DB_PREFIX || '';
const uriKey = DB_PREFIX ? `${DB_PREFIX}_MONGO_URI` : 'MONGO_URI';
const MONGODB_URI = process.env[uriKey] || process.env.MONGO_URI;

// 2. Realistic Zedify Schema: Activity Feed/Posts
const PostSchema = new mongoose.Schema({
  username: String,
  content: String,
  likes: Number,
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('PostTest', PostSchema);

async function runTest() {
  console.log('\n🔍 Starting Zedify — MongoDB Atlas Connection Test...\n');

  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI (or your prefixed URI) is not set in .env');
    console.log('   Please check your backend/.env file.');
    process.exit(1);
  }

  try {
    // 3. Connect to MongoDB Atlas
    console.log(`📡 Connecting to: ${uriKey}...`);
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // 4. Data Preparation (Realistic sample data)
    console.log('📝 Cleaning up old test data and inserting 10 sample posts...');
    await Post.deleteMany({});
    
    const samplePosts = Array.from({ length: 10 }).map((_, i) => ({
      username: `dev_user_${i + 1}`,
      content: `Testing Zedify MongoDB Connection #${i + 1} 🚀`,
      likes: Math.floor(Math.random() * 50),
      createdAt: new Date(Date.now() - i * 1800000) // Spread over 5 hours
    }));

    const inserted = await Post.insertMany(samplePosts);
    console.log(`✨ Successfully inserted ${inserted.length} sample documents.`);

    // 5. Query: Read 5 most recent
    console.log('\n📅 [Query] Reading 5 most recent posts:');
    const recent = await Post.find().sort({ createdAt: -1 }).limit(5);
    recent.forEach(post => {
      console.log(`   - [${post.createdAt.toLocaleTimeString()}] ${post.username}: ${post.content}`);
    });

    // 6. Query: Read single by _id
    const targetId = inserted[0]._id;
    console.log(`\n🆔 [Query] Fetching single document by ID: ${targetId}`);
    const singleDoc = await Post.findById(targetId);
    console.log('   Result Content:', singleDoc.content);

    // 7. Success & Closure
    await mongoose.connection.close();
    console.log('\n🎉 Test completed successfully! Connection closed.\n');

  } catch (err) {
    console.error('\n❌ MongoDB Connection Error:');
    console.error(err.message);
    if (err.message.includes('bad auth')) {
      console.log('   TIP: Check your database user password in .env');
    } else if (err.message.includes('IP not whitelisted')) {
      console.log('   TIP: Verify your IP is added to "Network Access" in Atlas.');
    }
    process.exit(1);
  }
}

runTest();
