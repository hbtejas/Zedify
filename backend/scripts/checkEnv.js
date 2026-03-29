/**
 * Run this before starting the server to verify your .env is properly configured.
 * Usage: node scripts/checkEnv.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const required = {
  MONGO_URI: 'MongoDB Atlas connection string',
  JWT_SECRET: 'JWT secret key (any long random string)',
  CLOUDINARY_CLOUD_NAME: 'Your Cloudinary cloud name',
  CLOUDINARY_API_KEY: 'Your Cloudinary API key',
  CLOUDINARY_API_SECRET: 'Your Cloudinary API secret',
};

const placeholders = ['<username>', '<password>', 'xxxxx', 'your_', 'change_this'];

let allGood = true;

console.log('\n🔍 Zedify — Production Readiness Check\n');

for (const [key, description] of Object.entries(required)) {
  const val = process.env[key] || '';
  const isPlaceholder = !val || placeholders.some((p) => val.includes(p));

  if (isPlaceholder) {
    console.log(`❌  ${key}\n    → ${description}\n    → Current value: "${val}"\n`);
    allGood = false;
  } else {
    console.log(`✅  ${key}`);
  }
}

console.log('');

if (allGood) {
  console.log('🎉 All environment variables are set! You can now run: npm run dev\n');
} else {
  console.log('⚠️  Please edit backend/.env and fill in the missing values above.');
  console.log('   Then re-run: node scripts/checkEnv.js\n');
  process.exit(1);
}
