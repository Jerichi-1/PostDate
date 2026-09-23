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
    |── components/
    |── pages/
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

Edit `.env` and set `MONGO_URI` to your MongoDB connection string (local or
Atlas), and `JWT_SECRET` to any long random string (the file has a one-liner
to generate one). Leave `TEMP_VERIFY_CODE` as `0000` unless you want a
different fake code — see the note on verification below.

Run the server:

```bash
npm run dev      # with nodemon, auto-restarts on changes
# or
npm start
```

The API will run at `http://localhost:5000`. Test it: `GET http://localhost:5000/` should return "MERN API is running...".

### API endpoints

Auth (`controllers/authController.js` + `routes/authRoutes.js`) is built and
working — sign-up, log-in, and email verification. Nothing else has a
controller/route pair yet — only the Mongoose models exist for the rest
(`Post`, `Comment`, `Match`, `Like`, `Follow`, `Swipe`, `Message`,
`Notification`, `Rating`, `Report`). Build those out the same way auth was
built (model → controller → route → registered in `server.js`) as each
screen needs them.

**What auth does, as a worked example of the pattern:**

- `POST /api/signup` — creates a `User` (hashed password via bcrypt) and its
  `Profile` together; rolls the `User` back if the `Profile` fails so a
  sign-up can't half-succeed. Returns 409 for a duplicate email.
- `POST /api/auth/login` — checks the password, issues a JWT (`JWT_SECRET`,
  7-day expiry). 401 for a wrong email or password (deliberately the same
  reply for both), 403 for a correct login on an account that hasn't
  verified yet.
- `POST /api/verify/send` / `POST /api/verify/confirm` — the account created
  by sign-up starts unverified, and log-in refuses it until this pair flips
  `isVerified` to `true`. **The code itself is fake right now** — nothing is
  emailed, every account is verified by the same `TEMP_VERIFY_CODE` (default
  `"0000"`, `.env`). Swap this out once an email service is picked: generate
  a real per-user code in `sendVerificationCode`, email it, and check it for
  real in `verifyCode` — the response shapes on both already match what the
  frontend expects, only the inside needs to change.

Password recovery ("forgot password?" on the frontend's `/login` page) needs
the same email service and isn't built here yet — the frontend mocks it (see
`frontend/README.md`).

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
- For each model, follow the same pattern: model → controller → route → wire into `server.js`. `authController.js`/`authRoutes.js` are the first pair built this way — a concrete example to copy.
