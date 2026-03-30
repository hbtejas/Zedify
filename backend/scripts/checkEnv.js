/**
 * Run this before starting the server to verify your .env is properly configured.
 * Usage: node scripts/checkEnv.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const required = {
  MONGO_URI: 'MongoDB Atlas connection string',
  JWT_SECRET: 'JWT secret key (any long random string)',
};

const placeholders = ['<username>', '<password>', 'xxxxx', 'your_', 'change_this'];

let allGood = true;

console.log('\n🔍 Zedify — Production Readiness Check\n');

const DB_PREFIX = process.env.DB_PREFIX || '';
const uriKey = DB_PREFIX ? `${DB_PREFIX}_MONGO_URI` : 'MONGO_URI';
const MONGO_URI_VAL = process.env[uriKey] || process.env.MONGO_URI || '';

for (const [key, description] of Object.entries(required)) {
  let val = process.env[key] || '';
  if (key === 'MONGO_URI') {
    val = MONGO_URI_VAL;
  }
  const isPlaceholder = !val || placeholders.some((p) => val.includes(p));

  const displayKey = (key === 'MONGO_URI' && DB_PREFIX) ? `${uriKey} (or MONGO_URI)` : key;

  if (isPlaceholder) {
    console.log(`❌  ${displayKey}\n    → ${description}\n    → Current value: "${val}"\n`);
    allGood = false;
  } else {
    console.log(`✅  ${displayKey}`);
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
