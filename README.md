# Tic-Tac-Toe OAuth Game

A full-stack Tic-Tac-Toe web application with OAuth 2.0 authentication, real-time scoring, and a global leaderboard.

🕹️ เล่นออนไลน์ได้ที่:  
** https://tictactoe-frontend-lzo97f2ma-zegamezs-projects.vercel.app/  **

---

## ✅ Features

- 🎯 Player vs AI (3 ระดับ: Easy, Medium, Hard)
- 🔐 OAuth 2.0 Authentication (Google & GitHub)
- 📊 ระบบเก็บคะแนน & สถิติแบบ Real-time
- 🔥 โบนัสชนะต่อเนื่อง (Win Streak)
- 🏆 Leaderboard จัดอันดับผู้เล่น
- 💾 เก็บข้อมูลถาวรด้วย Supabase
- 📱 รองรับมือถือ (Responsive UI)

---

## 🛠 Tech Stack

### ✅ Frontend
- React 18 + TypeScript  
- Tailwind CSS  
- Vite  
- Supabase Auth

### ✅ Backend
- Hono.js + TypeScript  
- Supabase (PostgreSQL)  
- OAuth 2.0

---

## 🚀 Quick Start (Local Development)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/tictactoe-fullstack.git
cd tictactoe-fullstack
2️⃣ Install Dependencies
npm install
cd tictactoe-fe && npm install
cd ../tictactoe-be && npm install

3️⃣ ตั้งค่า Environment Variables

สร้างไฟล์ .env ในแต่ละโฟลเดอร์

✅ tictactoe-fe/.env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001

✅ tictactoe-be/.env

PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALLOWED_ORIGINS=http://localhost:5173

Run Development Servers
npm run dev
```
