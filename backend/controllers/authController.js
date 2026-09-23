const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");

/**
 * authController
 * Signup, log-in, and the (temporarily fake) email-verification step. Matches
 * the routes and response shapes already documented in the frontend's
 * services/postdateApi.js — that file is the source of truth for what each
 * endpoint is expected to return; keep the two in step if either changes.
 *
 * 🔌 NOT WIRED UP FOR REAL YET:
 *   - Verification codes: nothing is actually emailed. Every account uses the
 *     same fixed TEMP_VERIFY_CODE below until an email service is picked —
 *     search this file for "TEMP" to find what to replace.
 *   - Photos: signup doesn't accept them yet. There's no file-storage service
 *     picked (same situation as email), so the frontend leaves them out of
 *     the request for now — see submitSignup in postdateApi.js.
 *   - Password recovery ("forgot password?"): still fully mocked on the
 *     frontend, since it also needs a real email service. Nothing here
 *     handles it yet.
 */

const SALT_ROUNDS = 10; // 🎛️ bcrypt cost factor
const TOKEN_TTL = "7d"; // 🎛️ how long a log-in session lasts

// 🧪 TEMP verification code — every account is "verified" by typing this
// exact string, since nothing emails a real one yet. Keep in sync with
// codeLength={4} on <VerificationModal> in frontend/src/pages/Signup.jsx.
const TEMP_VERIFY_CODE = process.env.TEMP_VERIFY_CODE || "0000";

function signToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

/**
 * "MM/DD/YY" or "MM/DD/YYYY" -> a real Date, or null if it doesn't parse.
 * The sign-up form (WhoAreYouForm.jsx) is a free-text field, not a date
 * picker, so this is the only thing standing between "01/01/04" and garbage
 * ending up in the database.
 */
function parseBirthdate(input) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(String(input ?? "").trim());
  if (!match) return null;

  const [, mm, dd, yy] = match;
  let year = Number(yy);
  if (yy.length === 2) {
    // 🎛️ "04" -> 2004, but "98" -> 1998, not 2098: pick whichever century
    // doesn't land in the future. Good enough for realistic birthdates; swap
    // the form for a real date picker if this ever guesses wrong.
    const currentYear = new Date().getUTCFullYear();
    year = 2000 + Number(yy);
    if (year > currentYear) year -= 100;
  }

  const date = new Date(Date.UTC(year, Number(mm) - 1, Number(dd)));
  const valid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === Number(mm) - 1 &&
    date.getUTCDate() === Number(dd);
  return valid ? date : null;
}

/**
 * POST /api/signup
 * Creates the User (auth fields) and its Profile (dateOfBirth/gender/bio/
 * interests) together. If the Profile fails to save, the User is removed
 * again rather than leaving a half-created account behind.
 */
async function register(req, res) {
  try {
    const { firstName, middleName, lastName, email, password, birthdate, gender, bio, tags } =
      req.body ?? {};

    if (!firstName || !lastName || !email || !password || !birthdate || !gender) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }
    const dateOfBirth = parseBirthdate(birthdate);
    if (!dateOfBirth) {
      return res.status(400).json({ message: "Birthdate must be MM/DD/YY" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      firstName,
      middleName,
      lastName,
    });

    try {
      await Profile.create({
        userId: user._id,
        dateOfBirth,
        gender,
        bio,
        interests: Array.isArray(tags) ? tags : [],
      });
    } catch (profileErr) {
      await User.deleteOne({ _id: user._id }); // keep User and Profile in step
      throw profileErr;
    }

    return res.status(201).json({ userId: user._id });
  } catch (err) {
    if (err?.code === 11000) {
      // two requests raced past the findOne check above
      return res.status(409).json({ message: "An account with that email already exists" });
    }
    console.error("[auth] register failed:", err);
    return res.status(500).json({ message: "Could not create account" });
  }
}

/**
 * POST /api/auth/login
 * 401 for a wrong email OR password (same reply for both, so this can't be
 * used to find out which emails have accounts). 403 for a correct email and
 * password on an account that hasn't verified yet — LoginForm.jsx shows a
 * different message for that one specifically.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Wrong email or password" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Verify your email before logging in" });
    }

    const token = signToken(user);
    return res.json({ userId: user._id, role: user.role, token });
  } catch (err) {
    console.error("[auth] login failed:", err);
    return res.status(500).json({ message: "Could not log in" });
  }
}

/**
 * POST /api/verify/send
 * 🧪 TEMP: doesn't actually send anything — see TEMP_VERIFY_CODE above. Once
 * a real email service exists, generate a per-user code here, store it
 * (e.g. on the User doc, with an expiry) and email it.
 */
async function sendVerificationCode(req, res) {
  return res.json({ expiresIn: 300 });
}

/**
 * POST /api/verify/confirm
 * Wrong code -> `{ verified: false }` rather than an error, since guessing
 * wrong isn't really "the server broke" (the modal handles either).
 */
async function verifyCode(req, res) {
  try {
    const { email, code } = req.body ?? {};
    if (!email) {
      return res.status(400).json({ message: "Missing email" });
    }
    if (code !== TEMP_VERIFY_CODE) {
      return res.json({ verified: false });
    }

    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { isVerified: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "No account for that email" });
    }

    return res.json({ verified: true, userId: user._id, role: user.role });
  } catch (err) {
    console.error("[auth] verifyCode failed:", err);
    return res.status(500).json({ message: "Could not check that code" });
  }
}

module.exports = { register, login, sendVerificationCode, verifyCode, parseBirthdate };
