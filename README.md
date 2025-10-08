
# Tic-Tac-Toe OAuth Game

A full-stack Tic-Tac-Toe game with OAuth 2.0 authentication, real-time scoring, and leaderboard.

## Features

- 🎮 Player vs AI (3 difficulty levels: Easy, Medium, Hard)
- 🔐 OAuth 2.0 Authentication (Google & GitHub)
- 📊 Real-time scoring system with win streaks
- 🏆 Global leaderboard
- 💾 Data persistence with Supabase
- 📱 Responsive design

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Vite
- Supabase Auth

### Backend
- Hono.js + TypeScript
- Supabase (PostgreSQL)
- OAuth 2.0

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/yourusername/tictactoe-fullstack.git
cd tictactoe-fullstack

2. Install dependencies

npm install
cd tictactoe-fe && npm install
cd tictactoe-be && npm install

3. Set up environment variables

create .env in tictactoe fe and tictactoe be 
and edit actual value 

4. Run development servers

npm run dev