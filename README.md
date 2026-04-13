# Talks

A full-stack real-time chat application built with the MERN ecosystem.

Talks supports direct messaging, group chats, online presence, read receipts, message delivery events, profile customization, and optional file attachments.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Run the App](#run-the-app)
- [API Endpoints](#api-endpoints)
- [Socket Events](#socket-events)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap Ideas](#roadmap-ideas)
- [License](#license)

## Overview

Talks is split into two apps:

- `talks-server`: Node.js + Express API with MongoDB and Socket.IO.
- `talks_client`: React + Vite frontend with Redux state and Socket.IO client.

The backend provides authentication, chat and message management, while Socket.IO powers real-time updates.

## Tech Stack

### Frontend

- React 19
- Vite 6
- React Router 7
- Redux Toolkit + React Redux
- Material UI + Emotion
- Tailwind CSS 4
- Socket.IO Client
- Framer Motion

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.IO
- bcryptjs
- CORS + dotenv

## Project Structure

```text
Talks/
|- talks_client/
|  |- src/
|  |  |- Components/
|  |  |- redux/
|  |- public/
|  |- package.json
|- talks-server/
|  |- config/
|  |- controllers/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- index.js
|  |- package.json
|- render.yaml
|- README.md
|- mead.md
```

## Core Features

- User registration and login with JWT.
- 1:1 private chat creation and retrieval.
- Group chat creation and membership actions.
- Group icon update by group admin.
- Live online user tracking.
- Real-time message delivery and receive events.
- Read receipt propagation in active chat rooms.
- User profile fetch and update.
- Optional message attachment payload support.
- Duplicate group-member cleanup utility endpoint.

## Local Development Setup

### Prerequisites

- Node.js 18 or newer (LTS recommended)
- npm 9 or newer
- MongoDB Atlas (or local MongoDB instance)

### 1) Clone and install dependencies

```bash
git clone <your-repo-url>
cd Talks

cd talks-server
npm install

cd ../talks_client
npm install
```

### 2) Configure environment variables

Create these files:

- `talks-server/.env`
- `talks_client/.env`

Use the templates below.

## Environment Variables

### Backend: `talks-server/.env`

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Notes:

- `FRONTEND_URL` can be a comma-separated list when multiple origins are needed.
- Backend CORS also allows Vercel preview URLs (`https://*.vercel.app`).

### Frontend: `talks_client/.env`

```env
VITE_API_URL=http://localhost:3000
```

## Run the App

Open two terminals.

### Terminal 1: backend

```bash
cd talks-server
npm run dev
```

Backend runs on `http://localhost:3000` by default.

### Terminal 2: frontend

```bash
cd talks_client
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## API Endpoints

Base URL (local): `http://localhost:3000`

### User routes (`/user`)

- `POST /login`
- `POST /register`
- `GET /fetchUsers` (protected)
- `GET /profile` (protected)
- `PUT /profile` (protected)

### Chat routes (`/chat`)

- `POST /` (protected) - access or create 1:1 chat
- `GET /` (protected) - fetch user chats
- `POST /createGroup` (protected)
- `GET /fetchGroups` (protected)
- `PUT /groupExit` (protected)
- `PUT /addSelfToGroup` (protected)
- `POST /cleanupDuplicates` (protected)
- `PUT /groupPic` (protected)

### Message routes (`/message`)

- `GET /:chatId` (protected)
- `POST /` (protected)
- `PUT /read/:chatId` (protected)

## Socket Events

### Client emits

- `setup`
- `join chat`
- `new message`
- `messages read`

### Server emits

- `connected`
- `online users`
- `message recieved`
- `message delivered`
- `messages read`

## Deployment

This repo already includes `render.yaml` for Render deployment:

- Node backend (`talks-server`) as a web service
- React frontend (`talks_client`) as a static site
- Rewrite rule for SPA routing (`/* -> /index.html`)

For production:

- Set backend `FRONTEND_URL` to your deployed frontend domain(s).
- Set frontend `VITE_API_URL` to your deployed backend API URL.
- Ensure your MongoDB network access and credentials are configured.

## Security Notes

- Never commit real secrets in `.env` files.
- Rotate any credentials that were previously exposed.
- Use a strong random `JWT_SECRET` in production.
- Prefer HTTPS-only deployments for both API and client.
- Consider payload-size and file-type checks for attachments.

## Troubleshooting

### CORS errors in browser

- Verify `FRONTEND_URL` in backend environment settings.
- Ensure `VITE_API_URL` points to the same backend origin.

### JWT/auth failures

- Confirm token is sent in `Authorization: Bearer <token>` format.
- Verify backend has a valid `JWT_SECRET`.

### Socket not connecting

- Check backend is running and reachable.
- Confirm client uses correct `VITE_API_URL`.
- Validate browser console and server logs for CORS/socket errors.

### Database connection fails

- Validate `MONGO_URI` and DB user permissions.
- If using Atlas, allow your IP/network access.

## Roadmap Ideas

- Message deletion/edit history
- Typing indicators
- Push notifications
- Pagination/infinite scrolling for large chats
- Better attachment storage strategy (cloud object storage)
- End-to-end encryption exploration

## License

This project is licensed under the terms in the `LICENSE` file.
