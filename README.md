# Zedify 🎓

[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack, production-ready real-time student skill exchange social platform — combining LinkedIn profiles, Instagram feeds, WhatsApp chat, and Zoom live video. 

**Zedify is proudly an Open Source project.** We welcome contributions from developers, designers, and students all around the world to help build the ultimate skill-sharing ecosystem!

---

## 🚀 Tech Stack

| Layer      | Technology                                 |
|------------|---------------------------------------------|
| Frontend   | React 18, Tailwind CSS, Axios, React Router |
| Realtime   | Socket.io Client, WebRTC                   |
| Backend    | Node.js, Express.js                        |
| Database   | MongoDB Atlas + Mongoose                   |
| Auth       | JWT + bcryptjs                             |
| Media      | Cloudinary                                 |
| Signaling  | Socket.io                                  |

---

## 📁 Folder Structure

```
Zedify/
├── backend/
│   ├── config/         # DB + Cloudinary config
│   ├── controllers/    # Business logic
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── socket/         # Socket.io + WebRTC signaling
│   ├── .env            # Environment variables
│   └── server.js       # Entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/ # Reusable UI components
        ├── context/    # AuthContext + SocketContext
        ├── pages/      # All page components
        ├── services/   # Axios API wrapper
        └── App.jsx
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

---

### Step 1 – Clone / Open the project

```bash
cd e:/Github/Zedify
```

---

### Step 2 – Configure Backend Environment

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/zedify?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_strong_secret_key
FRONTEND_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloudname
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Getting MongoDB Atlas URI:**
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Click "Connect" → "Drivers" → Copy the connection string
4. Replace `<password>` with your DB user's password

**Getting Cloudinary credentials:**
1. Go to https://cloudinary.com (free account)
2. Dashboard → Copy Cloud Name, API Key, API Secret

---

### Step 3 – Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Step 4 – Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

### Step 5 – Run the Application

**Terminal 1 – Backend:**

```bash
cd backend
npm run dev
```

Server starts on: `http://localhost:5000`

**Terminal 2 – Frontend:**

```bash
cd frontend
npm start
```

Frontend starts on: `http://localhost:3000`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint             | Description    |
|--------|----------------------|----------------|
| POST   | /api/auth/register   | Register user  |
| POST   | /api/auth/login      | Login user     |
| GET    | /api/auth/me         | Current user   |

### Users
| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| GET    | /api/users/:id              | Get profile           |
| PUT    | /api/users/update           | Update profile        |
| POST   | /api/users/follow           | Follow/unfollow user  |
| GET    | /api/users/search?q=query   | Search users          |
| GET    | /api/users/suggestions      | Suggested users       |
| GET    | /api/users/notifications    | Get notifications     |

### Posts
| Method | Endpoint          | Description     |
|--------|-------------------|-----------------|
| POST   | /api/posts/create | Create post     |
| GET    | /api/posts/feed   | Get feed        |
| POST   | /api/posts/like   | Like/unlike     |
| POST   | /api/posts/comment| Comment         |
| DELETE | /api/posts/:id    | Delete post     |

### Chat
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/chat/:userId     | Get conversation     |
| POST   | /api/chat/send        | Send message         |
| GET    | /api/chat/conversations| List conversations |

### Video
| Method | Endpoint                    | Description       |
|--------|-----------------------------|-------------------|
| POST   | /api/video/create-session   | Create session    |
| GET    | /api/video/session/:id      | Get session       |
| POST   | /api/video/join/:id         | Join session      |
| PUT    | /api/video/end/:id          | End session       |
| GET    | /api/video/sessions         | Active sessions   |

### Exchange
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | /api/exchange/send    | Send request         |
| PUT    | /api/exchange/respond | Accept/reject        |
| GET    | /api/exchange/my      | My exchanges         |
| PUT    | /api/exchange/complete/:id | Mark complete   |

---

## 🔌 Socket.io Events

### Client → Server
| Event           | Payload                              | Description        |
|-----------------|--------------------------------------|--------------------|
| userOnline      | userId                               | User comes online  |
| sendMessage     | {senderId, receiverId, message}      | Send chat message  |
| typing          | {senderId, receiverId}               | Typing indicator   |
| stopTyping      | {senderId, receiverId}               | Stop typing        |
| joinVideoRoom   | {roomId, userId, userName}           | Join video room    |
| videoOffer      | {offer, roomId, targetSocketId, ...} | WebRTC offer       |
| videoAnswer     | {answer, targetSocketId, ...}        | WebRTC answer      |
| iceCandidate    | {candidate, targetSocketId, ...}     | ICE candidate      |
| leaveVideoRoom  | {roomId, userId, userName}           | Leave video room   |

### Server → Client
| Event           | Description                  |
|-----------------|------------------------------|
| onlineUsers     | Updated online users list    |
| receiveMessage  | Incoming chat message        |
| userTyping      | Someone is typing            |
| userStopTyping  | Stop typing                  |
| newNotification | Real-time notification       |
| userJoinedRoom  | New participant in video room|
| userLeftRoom    | Participant left video room  |
| videoOffer      | Relayed WebRTC offer         |
| videoAnswer     | Relayed WebRTC answer        |
| iceCandidate    | Relayed ICE candidate        |

---

## 🧪 Testing Features

### Test Real-Time Chat
1. Open two browser tabs/windows
2. Register two different accounts
3. Each account follows the other
4. Go to `/chat` and select the other user
5. Send messages — they appear instantly in both tabs

### Test Video Streaming
1. Open two different browsers (Chrome + Firefox)
2. Login with different accounts on each
3. On Browser 1: Go to `/video` → Click "Host Session" → Enter skill name → Start
4. On Browser 2: Go to `/video` → You'll see the session → Click "Join"
5. Both should see each other's live video/audio feed

### Test Skill Exchange
1. Go to any student's profile
2. Click "🔄 Exchange" button
3. Fill in skill offered, skill requested, message
4. Submit — the other user gets a real-time notification
5. Log in as that user and accept/reject from `/exchange`

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (10 salt rounds)
- JWT tokens expire after **30 days**
- Protected routes via `authMiddleware`
- CORS configured for frontend origin only
- Input validation on all routes

---

## 🌐 Production Deployment

### Backend (Railway / Render)
1. Push code to GitHub
2. Connect Railway/Render to your repo
3. Set environment variables from `backend/.env`
4. Deploy — the server auto-starts

### Frontend (Vercel / Netlify)
1. Set build command: `npm run build`
2. Set publish directory: `build`
3. Set environment variables:
   - `REACT_APP_API_URL=https://your-backend.railway.app/api`
   - `REACT_APP_SOCKET_URL=https://your-backend.railway.app`
4. Deploy

---

## 🤝 Contributing (Open Source)

Zedify is an **Open Source** project. We encourage everyone to fork the repository, submit pull requests, open issues, and help us improve the platform! 

## 📝 License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software.

## 📧 Support

Built with ❤️ — Zedify helps students connect, share knowledge, and grow together.
