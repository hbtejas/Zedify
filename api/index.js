/**
 * api/index.js — Vercel Serverless Function entry point.
 *
 * Routes all /api/* requests to the Express app.
 * Socket.io is NOT available on Vercel serverless — the app
 * degrades gracefully (REST API works fully, real-time features
 * require a dedicated server deployment like Railway/Render).
 */
const app = require('../backend/app');

module.exports = app;
