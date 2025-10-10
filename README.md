# 🎮 Tic-Tac-Toe OAuth Game

A full-stack Tic-Tac-Toe web application with OAuth 2.0 authentication, real-time scoring, and a global leaderboard.

🕹️ **เล่นออนไลน์ได้ที่:** [https://tictactoe-frontend-lzo97f2ma-zegamezs-projects.vercel.app/](https://tictactoe-frontend-lzo97f2ma-zegamezs-projects.vercel.app/)

---

## ✨ Features

- 🎯 **Player vs AI** - 3 ระดับความยาก: Easy, Medium, Hard
- 🔐 **OAuth 2.0 Authentication** - เข้าสู่ระบบด้วย Google & GitHub
- 📊 **Real-time Score System** - ระบบเก็บคะแนนและสถิติแบบเรียลไทม์
- 🔥 **Win Streak Bonus** - โบนัสพิเศษสำหรับการชนะต่อเนื่อง
- 🏆 **Global Leaderboard** - จัดอันดับผู้เล่นทั่วโลก
- 💾 **Persistent Storage** - เก็บข้อมูลถาวรด้วย Supabase
- 📱 **Responsive Design** - รองรับการใช้งานบนมือถือ

---

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Vite
- Supabase Auth

### Backend
- Hono.js + TypeScript
- Supabase (PostgreSQL)
- OAuth 2.0

---

## 🚀 Quick Start

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/tictactoe-fullstack.git
cd tictactoe-fullstack
```

### 2️⃣ Install Dependencies

```bash
npm install
cd tictactoe-fe && npm install
cd ../tictactoe-be && npm install
```

### 3️⃣ ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในแต่ละโฟลเดอร์:

#### Frontend (`tictactoe-fe/.env`)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

#### Backend (`tictactoe-be/.env`)

```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALLOWED_ORIGINS=http://localhost:5173
```

### 4️⃣ Run Development Servers

#### Start Server

```bash
npm run dev
```




---

## 🎮 How to Play

1. เข้าสู่ระบบด้วย Google หรือ GitHub
2. เลือกระดับความยากของ AI
3. คลิกช่องเพื่อวางเครื่องหมาย X หรือ O
4. เรียง 3 ช่องในแนวตั้ง แนวนอน หรือแนวทแยงเพื่อชนะ
5. สะสมคะแนนและแข่งขันในกระดานผู้นำ!

---

