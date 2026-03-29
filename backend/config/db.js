const mongoose = require('mongoose');

let dbConnected = false;

/**
 * Cached mongoose connection — prevents multiple connections
 * across Vercel serverless warm restarts.
 */
let cached = global.mongooseConn;
if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    dbConnected = true;
    return cached.conn;
  }

  const DB_PREFIX = process.env.DB_PREFIX || '';
  const uriKey = DB_PREFIX ? `${DB_PREFIX}_MONGO_URI` : 'MONGO_URI';
  const MONGO_URI = process.env[uriKey] || process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.warn(`⚠️  ${uriKey} not set — Running in DEMO MODE (in-memory storage).`);
    console.warn('   Set MONGO_URI or your prefixed URI in your environment variables for data persistence.');
    return null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        bufferCommands: false,
      })
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        dbConnected = true;
        return conn;
      })
      .catch((err) => {
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        console.warn('⚠️  Running in DEMO MODE (in-memory storage).');
        cached.promise = null; // allow retry
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
  }

  return cached.conn;
};

const isDBConnected = () => dbConnected;

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;
