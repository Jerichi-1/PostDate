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
   editing the components.
   ========================================================================== */

import api from "../api";

/* Tiny helper so mock data behaves like a real network call (async + a beat of
   latency). Delete it once every function is hooked up to the backend. */
const delay = (value, ms = 220) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

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
 * Creates the account. `photos` are File objects, so this posts multipart —
 * the backend needs multer (or similar) on this route.
 * @route  POST /api/signup
 * @param  {{ firstName, middleName, lastName, birthdate, gender, bio,
 *            photos: File[], tags: string[] }} signup
 * @returns {{ userId: string, token?: string }}
 */
export async function submitSignup(signup) {
  // const form = new FormData();
  // Object.entries(signup).forEach(([key, value]) => {
  //   if (key === "photos") value.forEach((file) => form.append("photos", file));
  //   else if (key === "tags") form.append("tags", JSON.stringify(value));
  //   else form.append(key, value);
  // });
  // const { data } = await api.post("/signup", form);
  // return data;

  console.log("[postdateApi] submitSignup received:", signup);
  return delay({ userId: "mock-user-1" });
}

/**
 * The chips shown on step 3. Hard-coded for now; move to the DB when the
 * team wants admins to edit the list.
 * @route  GET /api/tags
 * @returns {string[]}
 */
export async function getTasteOptions() {
  // const { data } = await api.get("/tags");
  // return data;
  return delay(MOCK_TASTE_OPTIONS);
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

/**
 * Everything the profile page needs in one request.
 * @route  GET /api/profile/:userId   (use /api/profile/me for the logged-in user)
 * @returns {{ name, bio, address, age, birthdate, ratings, dateJoined,
 *             lastDate, avatarUrl, tags, photos, reviews }}
 */
export async function getProfile(userId = "me") {
  // const { data } = await api.get(`/profile/${userId}`);
  // return data;
  return delay(MOCK_PROFILE);
}

/**
 * Saves the taste chips after the user hits ✔ on the Your Taste tab.
 * @route  PUT /api/profile/tags
 * @param  {string[]} tags  the full new list, not a diff
 */
export async function saveProfileTags(tags) {
  // const { data } = await api.put("/profile/tags", { tags });
  // return data;
  console.log("[postdateApi] saveProfileTags:", tags);
  return delay({ ok: true });
}

/**
 * Uploads new photos from the Your Photos tab.
 * @route  POST /api/profile/photos   (multipart, field name "photos")
 * @param  {File[]} files
 * @returns {{ id: string, url: string }[]}  the updated photo list
 */
export async function uploadProfilePhotos(files) {
  // const form = new FormData();
  // files.forEach((file) => form.append("photos", file));
  // const { data } = await api.post("/profile/photos", form);
  // return data;
  console.log("[postdateApi] uploadProfilePhotos:", files);
  return delay(MOCK_PROFILE.photos);
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
   Delete this whole block once every function above talks to the real server.
   Until then it is what makes the pages render with no backend running.
   ========================================================================== */

const MOCK_STATS = [
  { label: "matches made", value: 10000, display: "10,000+" },
  { label: "feel safer dating", value: 92, display: "92%" },
  { label: "dates per week per user", value: 3, display: "2 - 3" },
];

const MOCK_TASTE_OPTIONS = [
  "Coffee walks",
  "Live music",
  "Hiking",
  "Film",
  "Cooking together",
  "Board games",
  "Museums",
  "Karaoke",
  "Thrifting",
  "Long drives",
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

const MOCK_PROFILE = {
  name: "Name",
  avatarUrl: null, // null → the salmon circle placeholder is shown
  bio: "A couple of sentences about you go here, straight from the signup form.",
  address: "Baguio, PH",
  age: 22,
  birthdate: "01/01/04",
  ratings: "4.6 / 5",
  dateJoined: "Sep 2026",
  lastDate: "2 days ago",
  tags: [
    { label: "Coffee walks", selected: false },
    { label: "Live music", selected: true },
    { label: "Hiking", selected: false },
    { label: "Film photography", selected: true },
    { label: "Cooking together", selected: false },
    { label: "Board games", selected: false },
    { label: "Museums", selected: false },
    { label: "Late-night karaoke", selected: true },
    { label: "Thrifting", selected: false },
    { label: "Long drives", selected: false },
  ],
  photos: [
    { id: "p1", url: null, span: "tall" }, // span: "tall" | "wide" | "box"
    { id: "p2", url: null, span: "wide" },
    { id: "p3", url: null, span: "box" },
  ],
  reviews: [
    {
      id: "r1",
      author: "Name",
      avatarUrl: null,
      rating: "5/5",
      body: "Sample review. Showed up on time, picked a great spot, and the conversation never stalled.",
    },
    {
      id: "r2",
      author: "Name",
      avatarUrl: null,
      rating: "4/5",
      body: "Sample review. Friendly and easy to talk to — would happily go again.",
    },
    {
      id: "r3",
      author: "Name",
      avatarUrl: null,
      rating: "5/5",
      body: "Sample review. Kind, funny, and respected the plan we agreed on beforehand.",
    },
  ],
};

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

export { MOCK_PROFILE, MOCK_STATS };
