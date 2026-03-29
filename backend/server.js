const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const http = require('http');
const app  = require('./app');
const { initSocket } = require('./socket/socketServer');

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Zedify server running on port ${PORT}`);
  console.log(`📡 Socket.io active`);
});
