# MERN Postdate

## Project structure

```
mern-app/
├── backend/          Express API + Mongoose models
│   ├── config/db.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/          React app (Vite)
    ├── src/
    │   ├── App.jsx
    │   ├── api.js
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — either:
  - Local MongoDB running on `mongodb://127.0.0.1:27017`, or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (get a connection string)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set `MONGO_URI` to your MongoDB connection string (local or Atlas).

Run the server:

```bash
npm run dev      # with nodemon, auto-restarts on changes
# or
npm start
```

The API will run at `http://localhost:5000`. Test it: `GET http://localhost:5000/` should return "MERN API is running...".

### API endpoints

No routes are wired up yet — only the Mongoose models exist so far (`User`, `Post`, `Comment`, `Profile`, `Match`, `Like`, `Follow`, `Swipe`, `Message`, `Notification`, `Rating`, `Report`). Build out a controller and route file for each resource following the pattern below, then register it in `server.js`.

## 2. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173` and talk to the backend at `http://localhost:5000`.

## 3. Build for production

```bash
cd frontend
npm run build
```

This outputs static files to `frontend/dist`, which you can serve with any static host, or have Express serve them directly (add `express.static` in `server.js` pointing at `../frontend/dist`).

## Notes

- CORS is already configured on the backend to allow requests from `http://localhost:5173` (change `CLIENT_URL` in `.env` if your frontend runs elsewhere).
- This starter uses ES modules (`"type": "module"`) on both ends.
- For each model, follow the same pattern: model → controller → route → wire into `server.js`.
