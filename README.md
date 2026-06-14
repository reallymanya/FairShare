# Shared Expenses App

A full-stack, multi-tenant expense sharing application built for a flatmate group to track, split, and settle shared costs.

## Features
- **Multi-Tenant Groups**: Create independent groups. Users can join/leave, and ledgers are perfectly isolated.
- **Advanced CSV Parsing**: Handles 12+ deliberate data anomalies (duplicates, foreign currencies, ghost members, broken percentages, and more).
- **Greedy Algorithm Simplification**: Reduces the total number of transactions needed to settle all debts.
- **Custom Views**:
  - **Aisha**: Sees the simplified "Who pays whom" summary.
  - **Rohan**: Sees exact, itemized breakdowns.
  - **Meera**: Has a custom "Review Queue" dashboard to explicitly approve or reject duplicated expenses.

## Tech Stack
- **Frontend**: React, React Router, Vite, pure CSS (Vanilla).
- **Backend**: Node.js, Express, Multer, CSV-Parser.
- **Database**: SQLite via Prisma ORM.

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push --force-reset
npm run start
```
*The backend will run on `http://localhost:3000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at `http://localhost:5173`.*

## AI Used
- **Primary AI Collaborator**: Antigravity (Google DeepMind agentic coding assistant).
- **Usage**: Full-stack application generation, CSS styling, complex algorithm drafting, and multi-tenant architectural refactoring.
