/* ============================================================================
   postdateApi.js — THE ONE FILE THE BACKEND TEAM TOUCHES
   ----------------------------------------------------------------------------
   Every screen gets its data by calling a function from this file. Nothing
   else in the frontend knows that a server exists.

   HOW TO PLUG IN THE BACKEND
   --------------------------
   Each function below has two halves:

       export async function getProfile(userId) {
         // ✅ REAL CALL — uncomment when the route is live:
         // const { data } = await api.get(`/profile/${userId}`);
         // return data;

         // 🧪 MOCK — delete this line once the real call is uncommented:
         return delay(MOCK_PROFILE);
       }

   So the backend team only has to:
     1. Build the route listed in the @route comment above each function.
     2. Uncomment the real call.
     3. Delete the mock return.

   The shape the UI expects is documented in the @returns comment and shown
   by the MOCK_ constant at the bottom. Match that shape and the page renders
   with zero component changes. If the backend shape ends up different, map it
   right here (e.g. `return { ...data, fullName: data.name }`) rather than
   editing components.

   WHERE THINGS CURRENTLY STAND: submitSignup, loginUser, sendVerificationCode,
   verifyCode, getProfile, getTasteOptions, saveProfileTags, saveLookingFor,
   uploadProfilePhotos, deleteProfilePhoto and setProfileAvatar are REAL — they
   call the backend against Mongo. Everything else below the EMAIL
   VERIFICATION section (recovery, discover, admin) is still mock data/behaviour.
   ========================================================================== */

import api, { API_ORIGIN } from "../api";

/* Tiny helper so mock data behaves like a real network call (async + a beat of
   latency). Only the still-mocked functions below use it. */
const delay = (value, ms = 220) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/* VerificationModal calls sendVerificationCode()/verifyCode() with no
   arguments (see components/VerificationModal.jsx), so this remembers which
   account submitSignup() just created and is currently mid-verification —
   see the EMAIL VERIFICATION section below for where it's read. */
let pendingVerificationEmail = "";

/**
 * Turns a path the backend stored (e.g. "/uploads/3f9a...c2.jpg") into a
 * loadable <img src>. Every profile photo and avatar path is relative like
 * this — nothing pre-builds the full URL, so this is the one place that
 * decides how they're reached. Returns null straight through, since "no
 * avatar yet" (null) should stay falsy rather than become a broken image src.
 */
export function toPhotoUrl(path) {
  return path ? `${API_ORIGIN}${path}` : null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   HOME / LANDING PAGE
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Headline numbers shown beside the bar chart on the landing page.
 * @route  GET /api/stats
 * @returns {{ label: string, value: number }[]}  value drives the bar height
 */
export async function getLandingStats() {
  // const { data } = await api.get("/stats");
  // return data;
  return delay(MOCK_STATS);
}

/* ─────────────────────────────────────────────────────────────────────────────
   SIGNUP  (the 3-step stamp form)
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Creates the account. The server hashes the password and creates the
 * account unverified — pages/Signup.jsx opens VerificationModal right after
 * this resolves, and log-in refuses anyone who hasn't gotten through it (see
 * loginUser below).
 * @route  POST /api/signup
 * @param  {{ firstName, middleName, lastName, email, password, birthdate,
 *            gender, bio, photos: File[], tags: string[] }} signup
 * @returns {{ userId: string }}
 * Sent as multipart/form-data whenever there's at least one photo (the
 * normal case — PhotosForm requires one by default), so the files can ride
 * along with the rest of the form in the same request; otherwise it's sent
 * as plain JSON, same as before photos existed. Either way `tags` travels as
 * a JSON-encoded string on the multipart path, since every multipart field
 * is text — the backend's parseListField (utils/tasteOptions.js) reads
 * either form.
 */
export async function submitSignup(signup) {
  const { photos = [], tags = [], ...fields } = signup;
  pendingVerificationEmail = signup.email.trim().toLowerCase();

  if (photos.length === 0) {
    const { data } = await api.post("/signup", { ...fields, tags });
    return data;
  }

  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  form.append("tags", JSON.stringify(tags));
  photos.forEach((file) => form.append("photos", file));

  const { data } = await api.post("/signup", form);
  return data;
}

/**
 * The chip lists shown on sign-up step 3 and the profile "Your taste" tab —
 * personality chips and "looking for" chips are separate lists, each with
 * its own pick limit. Both sides are validated against these same lists
 * server-side (backend/utils/tasteOptions.js), so a chip can never appear
 * here and be rejected on save, or vice versa.
 * @route  GET /api/tags
 * @returns {{ personality: string[], lookingFor: string[],
 *             limits: { minPersonality: number, maxPersonality: number, maxLookingFor: number } }}
 */
export async function getTasteOptions() {
  const { data } = await api.get("/tags");
  return data;
}

/* ─────────────────────────────────────────────────────────────────────────────
   EMAIL VERIFICATION  (components/VerificationModal.jsx — shown right after
   signup finishes, and it's mandatory: see the note above <VerificationModal>
   in pages/Signup.jsx for what that means)
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Emails a one-time code to the account that just signed up. The modal calls
 * this itself the moment it opens, and again if the person hits "Send a new
 * code" after the timer runs out.
 * @route  POST /api/verify/send
 * @returns {{ expiresIn: number }}  seconds the code stays valid — what the
 *          modal's countdown starts from
 * 🧪 TEMP: nothing is actually emailed yet — the backend always accepts
 * "0000" (see TEMP_VERIFY_CODE in authController.js) until an email service
 * is picked. This call is still real; only the code itself is fake.
 */
export async function sendVerificationCode() {
  const { data } = await api.post("/verify/send", { email: pendingVerificationEmail });
  return data;
}

/**
 * Checks the code the person typed into the modal.
 * @route  POST /api/verify/confirm
 * @param  {string} code
 * @returns {{ verified: boolean, userId?: string, role?: string }}
 * 🧪 TEMP: the only code that works right now is "0000" — matches the
 * `codeLength={4}` on <VerificationModal> in pages/Signup.jsx. Bump both
 * together (and delete this note) once real codes exist.
 */
export async function verifyCode(code) {
  const { data } = await api.post("/verify/confirm", { code, email: pendingVerificationEmail });
  return data;
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOG-IN  (pages/Login.jsx)
   ───────────────────────────────────────────────────────────────────────── */

/**
 * @route  POST /api/auth/login
 * @param  {{ email: string, password: string }} credentials
 * @returns {{ userId: string, role: "user" | "moderator" | "admin", token: string }}
 *          `role` decides where the page sends the person next:
 *          user → /discover, moderator → /moderator, admin → /admin.
 * The account has to be verified first — an otherwise-correct email/password
 * gets a 403, which LoginForm shows as "Verify your email before logging in"
 * rather than the generic wrong-password message.
 */
export async function loginUser({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PASSWORD RECOVERY  (pages/Login.jsx — "Forgot password?")

   🧪 STILL MOCK: this needs a real email service too, same reason
   verification's CODE is still fake, but the account state it would touch
   (a real password) is not connected to anything above — resetting a real
   account's password here won't actually change it. Wire these up once an
   email service is picked, following the same pattern as loginUser above.

     LOG-IN view ──"Forgot password?"──▶ RECOVERY view ──▶ PASSWORD view ──▶ LOG-IN
     loginUser       requestRecoveryCode   verifyRecoveryCode   resetPassword
   ───────────────────────────────────────────────────────────────────────── */

/**
 * @route  POST /api/auth/recovery/request
 * @param  {string} email
 * @returns {{ expiresInSeconds: number }}  the "00:00" countdown starts from this
 * 🔌 Answer 200 even when the email isn't registered — the page must not
 *    reveal who has an account.
 */
export async function requestRecoveryCode(email) {
  // const { data } = await api.post("/auth/recovery/request", { email });
  // return data;
  return delay({ expiresInSeconds: MOCK_RECOVERY_SECONDS });
}

/**
 * @route  POST /api/auth/recovery/verify
 * @param  {{ email: string, code: string }} body
 * @returns {{ resetToken: string }}  short-lived, permits only resetPassword
 */
export async function verifyRecoveryCode({ email, code }) {
  // const { data } = await api.post("/auth/recovery/verify", { email, code });
  // return data;
  if (code === "000000") throw mockHttpError(400); // type 000000 to see the error state
  return delay({ resetToken: "mock-reset-token" });
}

/**
 * @route  POST /api/auth/recovery/reset
 * @param  {{ resetToken: string, newPassword: string }} body
 * @returns {{ ok: true }}
 */
export async function resetPassword({ resetToken, newPassword }) {
  // await api.post("/auth/recovery/reset", { resetToken, newPassword });
  // return { ok: true };
  return delay({ ok: true });
}

/* ─────────────────────────────────────────────────────────────────────────────
   DISCOVER / HOME FEED  (the card grid you browse after logging in)
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The grid of browsable profiles. Search and filters are sent as query
 * params so the backend does the filtering — don't filter MOCK_PROFILES
 * client-side once this is real, or paging breaks.
 * @route  GET /api/discover?query=&gender=&maxDistance=&minAge=&maxAge=
 * @param  {{ query?: string, gender?: string, maxDistance?: number,
 *            minAge?: number, maxAge?: number }} params
 * @returns {{ id, name, age, distanceMi, gender, photoUrl, bio }[]}
 */
export async function getDiscoverProfiles(params = {}) {
  // const { data } = await api.get("/discover", { params });
  // return data;
  return delay(MOCK_DISCOVER_PROFILES);
}

/**
 * Fired when the person taps the heart in the profile modal.
 * @route  POST /api/discover/like
 * @param  {string} profileId
 * @returns {{ matched: boolean }}  true if the other person already liked back
 */
export async function likeProfile(profileId) {
  // const { data } = await api.post("/discover/like", { profileId });
  // return data;
  console.log("[postdateApi] likeProfile:", profileId);
  return delay({ matched: false });
}

/**
 * Fired when the person taps the × in the profile modal.
 * @route  POST /api/discover/pass
 * @param  {string} profileId
 */
export async function passProfile(profileId) {
  // await api.post("/discover/pass", { profileId });
  console.log("[postdateApi] passProfile:", profileId);
  return delay({ ok: true });
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROFILE PAGE
   ───────────────────────────────────────────────────────────────────────── */

/** Whole years between an ISO date-of-birth and today, UTC-based to match the backend. */
function calculateAgeFromISO(dateOfBirth) {
  if (!dateOfBirth) return undefined;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return undefined;
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const hadBirthdayThisYear =
    today.getUTCMonth() > dob.getUTCMonth() ||
    (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() >= dob.getUTCDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

/** ISO date -> "MM/DD/YY", matching the mock's format. */
function formatBirthdate(dateOfBirth) {
  if (!dateOfBirth) return undefined;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return undefined;
  const mm = String(dob.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dob.getUTCDate()).padStart(2, "0");
  const yy = String(dob.getUTCFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** ISO date -> "Sep 2026", matching the mock's format. */
function formatJoinDate(dateString) {
  if (!dateString) return undefined;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || undefined;
}

function formatAddress(location) {
  return [location?.city, location?.country].filter(Boolean).join(", ") || undefined;
}

/**
 * GET /api/profile/me returns `{ user, profile }` (backend/controllers/
 * controller.js's getMe) — this reshapes that into what the profile page's
 * components expect, so nothing downstream has to know about the backend's
 * document layout. `ratings`, `lastDate` and `reviews` have no backing route
 * yet (Rating/Match exist as models, nothing serves them), so they come back
 * empty/undefined and render as "—" or an empty state rather than guessed data.
 */
function mapProfileResponse({ user, profile } = {}) {
  return {
    name: fullName(user),
    bio: profile?.bio,
    address: formatAddress(profile?.location),
    age: calculateAgeFromISO(profile?.dateOfBirth),
    birthdate: formatBirthdate(profile?.dateOfBirth),
    ratings: undefined,
    dateJoined: formatJoinDate(user?.createdAt),
    lastDate: undefined,
    avatarPath: profile?.avatar ?? null,
    tags: profile?.interests ?? [],
    lookingFor: profile?.lookingFor?.intents ?? [],
    photoPaths: profile?.photos ?? [],
    reviews: [],
  };
}

/**
 * Everything the profile page needs in one request.
 * @route  GET /api/profile/:userId   (only "me" actually resolves today —
 *         the backend route is the literal /api/profile/me, not a :userId
 *         param yet; see backend/routes/routes.js)
 * @returns {{ name, bio, address, age, birthdate, ratings, dateJoined,
 *             lastDate, avatarPath, tags, lookingFor, photoPaths, reviews }}
 *          avatarPath/photoPaths are raw backend paths ("/uploads/x.jpg");
 *          pass them through toPhotoUrl() to get something an <img> can load.
 */
export async function getProfile(userId = "me") {
  const { data } = await api.get(`/profile/${userId}`);
  return mapProfileResponse(data);
}

/**
 * Saves the "Your taste" personality chips after the user hits ✔. Replaces
 * the full list, not a diff.
 * @route  PUT /api/profile/tags
 * @param  {string[]} tags
 * @returns {string[]}  the saved list, echoed back
 */
export async function saveProfileTags(tags) {
  const { data } = await api.put("/profile/tags", { tags });
  return data.tags;
}

/**
 * Saves the "Looking for" chips — kept as a separate save from personality
 * tags, so editing one never touches the other.
 * @route  PUT /api/profile/looking-for
 * @param  {string[]} lookingFor
 * @returns {string[]}  the saved list, echoed back
 */
export async function saveLookingFor(lookingFor) {
  const { data } = await api.put("/profile/looking-for", { lookingFor });
  return data.lookingFor;
}

/**
 * Uploads new photos from the "Your photos" tab. If the account had no
 * photos before this call, the first one uploaded also becomes the avatar
 * (see backend/controllers/profileController.js) — `avatarPath` in the
 * response reflects that.
 * @route  POST /api/profile/photos   (multipart, field name "photos")
 * @param  {File[]} files
 * @returns {{ photoPaths: string[], avatarPath: string|null }}
 */
export async function uploadProfilePhotos(files) {
  const form = new FormData();
  files.forEach((file) => form.append("photos", file));
  const { data } = await api.post("/profile/photos", form);
  return { photoPaths: data.photos, avatarPath: data.avatar };
}

/**
 * Deletes one photo. `photoId` is the filename portion of its path (e.g.
 * "3f9a1c...b2.jpg" out of "/uploads/3f9a1c...b2.jpg"). The backend refuses
 * to delete the current avatar or the last photo left, and answers 400 with
 * a message either way — surface that message rather than a generic one.
 * @route  DELETE /api/profile/photos/:filename
 * @param  {string} photoId
 * @returns {string[]}  the remaining photo paths
 */
export async function deleteProfilePhoto(photoId) {
  const { data } = await api.delete(`/profile/photos/${photoId}`);
  return data.photos;
}

/**
 * Makes an existing photo the profile picture. `photoPath` must be one of
 * the account's own photo paths — the backend rejects anything else.
 * @route  PUT /api/profile/avatar
 * @param  {string} photoPath
 * @returns {string}  the new avatar path, echoed back
 */
export async function setProfileAvatar(photoPath) {
  const { data } = await api.put("/profile/avatar", { photo: photoPath });
  return data.avatar;
}

/* ─────────────────────────────────────────────────────────────────────────────
   ADMIN / MODERATOR DASHBOARD
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The live "ACTIVE: n" counter in the dashboard header.
 * Swap for a websocket later if the team wants it to tick in real time.
 * @route  GET /api/admin/active-count
 * @returns {{ activeCount: number }}
 */
export async function getActiveCount() {
  // const { data } = await api.get("/admin/active-count");
  // return data;
  return delay({ activeCount: 128 });
}

/**
 * Content for whichever dashboard section is selected in the sidebar.
 * `section` is the lowercase slug, e.g. "statistics" or "server-logs".
 * @route  GET /api/admin/:section
 * @returns {{ columns: string[], rows: object[] }}  render-agnostic table data
 */
export async function getAdminSection(section) {
  // const { data } = await api.get(`/admin/${section}`);
  // return data;
  return delay(MOCK_ADMIN_SECTIONS[section] ?? { columns: [], rows: [] });
}

/* ============================================================================
   MOCK DATA
   ----------------------------------------------------------------------------
   Delete each piece as the function above it goes real. Until then it's what
   makes those pages render with no backend running.
   ========================================================================== */

/* A fake server error shaped like the ones axios throws, so a form can tell
   "the server said no" (has .response) from "the server isn't there" (no
   .response). Only the still-mocked recovery flow uses it now. */
const mockHttpError = (status) =>
  Object.assign(new Error(`Mock HTTP ${status}`), { response: { status } });

/* How long a mock recovery code "lasts". Short on purpose so the countdown
   can be watched reaching 00:00 in a demo without a real wait. */
const MOCK_RECOVERY_SECONDS = 60;

const MOCK_STATS = [
  { label: "matches made", value: 10000, display: "10,000+" },
  { label: "feel safer dating", value: 92, display: "92%" },
  { label: "dates per week per user", value: 3, display: "2 - 3" },
];

/* Deliberately mixed genders and ages — POSTDATE!'s own proposal names single
   women, single men, polyamorous people, and gay men and women as the target
   users, so the sample grid shouldn't default to one kind of pairing. */
const MOCK_DISCOVER_PROFILES = [
  { id: "u1", name: "Alex", age: 27, distanceMi: 3, gender: "Non-binary", photoUrl: null, bio: "Runs a pottery studio on weekends. Always up for trying the new ramen place." },
  { id: "u2", name: "Priya", age: 24, distanceMi: 5, gender: "Woman", photoUrl: null, bio: "Grad student, plays bass, will talk your ear off about film photography." },
  { id: "u3", name: "Jordan", age: 31, distanceMi: 8, gender: "Man", photoUrl: null, bio: "Trail running most Saturdays. Looking for someone to argue about books with." },
  { id: "u4", name: "Sam", age: 29, distanceMi: 2, gender: "Man", photoUrl: null, bio: "Chef by trade. Will cook for the third date, not the first." },
  { id: "u5", name: "Maya", age: 26, distanceMi: 11, gender: "Woman", photoUrl: null, bio: "Into board games and bad horror movies, in that order." },
  { id: "u6", name: "Devon", age: 33, distanceMi: 6, gender: "Non-binary", photoUrl: null, bio: "Open to poly connections. Big on communication, bigger on dogs." },
  { id: "u7", name: "Lena", age: 28, distanceMi: 4, gender: "Woman", photoUrl: null, bio: "Museum tours turn into three-hour conversations. Fair warning." },
  { id: "u8", name: "Theo", age: 30, distanceMi: 9, gender: "Man", photoUrl: null, bio: "Climbing gym regular. Terrible at karaoke, does it anyway." },
  { id: "u9", name: "Nina", age: 25, distanceMi: 7, gender: "Woman", photoUrl: null, bio: "Coffee snob. Will judge your pour-over, gently." },
  { id: "u10", name: "Marcus", age: 34, distanceMi: 12, gender: "Man", photoUrl: null, bio: "Long drives, longer playlists. Dog dad to a very opinionated beagle." },
  { id: "u11", name: "Yuki", age: 27, distanceMi: 1, gender: "Woman", photoUrl: null, bio: "Thrift store archaeologist. Ask about the lamp." },
  { id: "u12", name: "Casey", age: 29, distanceMi: 10, gender: "Non-binary", photoUrl: null, bio: "Karaoke nights and quiet Sundays. Both are non-negotiable." },
  { id: "u13", name: "Isabel", age: 32, distanceMi: 5, gender: "Woman", photoUrl: null, bio: "Reviews restaurants for fun, not for followers." },
  { id: "u14", name: "Owen", age: 26, distanceMi: 3, gender: "Man", photoUrl: null, bio: "Board game café regular. Bring your worst strategy." },
  { id: "u15", name: "Ravi", age: 31, distanceMi: 14, gender: "Man", photoUrl: null, bio: "Hiking most weekends, terrible with directions." },
  { id: "u16", name: "Zoe", age: 24, distanceMi: 6, gender: "Woman", photoUrl: null, bio: "Film photography and flea markets. Will show you the good stalls." },
  { id: "u17", name: "Ash", age: 28, distanceMi: 9, gender: "Non-binary", photoUrl: null, bio: "Cooking elaborate dinners for one, happy to make it two." },
  { id: "u18", name: "Delilah", age: 30, distanceMi: 4, gender: "Woman", photoUrl: null, bio: "Live music most weeks. Front row or not at all." },
];

const MOCK_ADMIN_SECTIONS = {
  statistics: {
    columns: ["Metric", "Today", "This week"],
    rows: [
      { Metric: "New signups", Today: 42, "This week": 311 },
      { Metric: "Matches made", Today: 188, "This week": 1249 },
      { Metric: "Dates confirmed", Today: 26, "This week": 174 },
    ],
  },
  reports: {
    columns: ["ID", "Reported user", "Reason", "Status"],
    rows: [
      { ID: "#1041", "Reported user": "user_882", Reason: "Fake photos", Status: "Open" },
      { ID: "#1040", "Reported user": "user_311", Reason: "Harassment", Status: "In review" },
      { ID: "#1039", "Reported user": "user_106", Reason: "Spam links", Status: "Closed" },
    ],
  },
  users: {
    columns: ["User", "Joined", "Ratings", "Status"],
    rows: [
      { User: "user_882", Joined: "12 Sep", Ratings: "3.1", Status: "Suspended" },
      { User: "user_311", Joined: "02 Sep", Ratings: "4.4", Status: "Active" },
      { User: "user_106", Joined: "28 Aug", Ratings: "4.9", Status: "Active" },
    ],
  },
};

export { MOCK_STATS };
