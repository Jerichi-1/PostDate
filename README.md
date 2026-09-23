# POSTDATE! — frontend

React + Vite frontend for the MERN dating platform. Most screens render with
**no backend running** — each pulls from mock data until its real routes are
wired up. The exception is sign-up, log-in and email verification, which are
real now: start `backend/` too (see its own README) or those three will fail
against a server that isn't there.

## Run it

```bash
npm install     # do this first, the node_modules in the old zip was Windows-only
npm run dev     # http://localhost:5173
```

## Routes

| Path         | Page                                                              |
| ------------ | ------------------------------------------------------------------ |
| `/`          | Landing page                                                      |
| `/signup`    | Three-step stamp form                                             |
| `/login`     | Log-in, with password recovery (log-in → enter code → new password) |
| `/discover`  | Logged-in home feed — search, filter, card grid, like/pass modal  |
| `/profile`   | Profile page (taste / reviews / photos / settings)                |
| `/admin`     | Staff dashboard, nine sections                                    |
| `/moderator` | Same dashboard, six sections                                      |

## Where to change things

Two symbols are used throughout the code:

- **🎛️** — a value you can safely tune (sizes, spacing, colours, copy, menus).
  Search the project for `🎛️` to find every dial at once.
- **🔌** — a spot where the backend connects.

### Colours and fonts

`src/theme.css` holds every colour and font as a CSS variable. Change a hex
there and it updates on every page. Nothing else hard-codes a colour.

```css
--pd-maroon: #b33951;   --pd-pink:   #e8b4b8;   --pd-tan:  #ede0d4;
--pd-salmon: #f4876a;   --pd-ink:    #2b2320;   --pd-cream: #faf3ee;
```

### Layout and sizing

Each component keeps its own CSS in a `<style>` block at the top of its file,
so the styling sits next to the markup it belongs to. The main dials are
grouped under a `🎛️ TUNE` comment near the top of each block.

Most pages use `clamp(min, scale, max)` sizes so they scale from phone to
1920px without separate mobile styles. To make something bigger everywhere,
raise the third number.

**The sign-up and log-in pages are the exception.** They are fixed layouts
that copy the Figma exactly, so every size on them is written as
`calc(<Figma px> * var(--u))`. `--u` is "one Figma pixel on your screen" and it
is set once, in `src/theme.css`: `0.8px` fits a 1536px-wide laptop window,
`1px` is exact Figma size for a 1920px-wide window. Change that one number and
both pages resize together.

## Plugging in the backend

**`src/services/postdateApi.js` is the only file the backend team needs to
touch.** Every screen gets its data from a function there; no component knows a
server exists.

**Sign-up, log-in and email verification are already real** — they call the
Express routes in `backend/controllers/authController.js` against Mongo (see
"Sign-up, log-in and verification" below). Everything else still follows the
mock pattern, two lines to uncomment and one to delete:

```js
export async function getProfile(userId = "me") {
  // const { data } = await api.get(`/profile/${userId}`);   ← uncomment
  // return data;
  return delay(MOCK_PROFILE);                               // ← delete
}
```

The `@route` comment above each function says which endpoint it expects, and
`@returns` documents the shape the UI needs. If the server ends up returning a
different shape, map it inside that function rather than editing components.

Routes:

| Function               | Route                                                              | Status |
| ----------------------- | --------------------------------------------------------------------- | ------ |
| `getLandingStats`     | `GET /api/stats`                                                   | mock |
| `submitSignup`        | `POST /api/signup`                                                 | **real** |
| `getTasteOptions`     | `GET /api/tags`                                                    | mock |
| `sendVerificationCode`| `POST /api/verify/send`                                            | **real** (fake code) |
| `verifyCode`          | `POST /api/verify/confirm`                                         | **real** (fake code) |
| `loginUser`           | `POST /api/auth/login`                                             | **real** |
| `requestRecoveryCode` | `POST /api/auth/recovery/request`                                  | mock |
| `verifyRecoveryCode`  | `POST /api/auth/recovery/verify`                                   | mock |
| `resetPassword`       | `POST /api/auth/recovery/reset`                                    | mock |
| `getDiscoverProfiles` | `GET /api/discover?query=&gender=&maxDistance=&minAge=&maxAge=`    | mock |
| `likeProfile`         | `POST /api/discover/like`                                          | mock |
| `passProfile`         | `POST /api/discover/pass`                                          | mock |
| `getProfile`          | `GET /api/profile/:userId`                                         | mock |
| `saveProfileTags`     | `PUT /api/profile/tags`                                            | mock |
| `uploadProfilePhotos` | `POST /api/profile/photos`                                         | mock |
| `getActiveCount`      | `GET /api/admin/active-count`                                      | mock |
| `getAdminSection`     | `GET /api/admin/:section`                                          | mock |

The base URL lives in `src/api.js` (`http://localhost:5000/api`).

Delete the `MOCK_` block at the bottom of `postdateApi.js` as each remaining
function goes real.

### Sign-up, log-in and verification

The loop actually works end to end: register on `/signup`, verify, then log
in on `/login` with the same email and password.

1. **Sign-up** (`WhoAreYouForm.jsx` → `submitSignup`) creates the account
   unverified. Photos aren't sent — there's no file-storage service picked
   yet (multer, S3, Cloudinary, …), same situation as email below.
2. **Verification** (`components/VerificationModal.jsx`, opened by
   `pages/Signup.jsx` right after sign-up, and mandatory — no way to skip it)
   sends a code and checks it. 🧪 **The code is fake**: nothing is actually
   emailed yet, so every account is verified by typing `0000`
   (`TEMP_VERIFY_CODE` in `authController.js` — an env var, `.env.example`
   has it). Once a real email service is picked, generate and send a real
   code there and bump `codeLength` on `<VerificationModal>` in
   `pages/Signup.jsx` to match.
3. **Log-in** (`LoginForm.jsx` → `loginUser`) returns
   `{ userId, role, token }`. `role` decides where the person lands: `user` →
   `/discover`, `moderator` → `/moderator`, `admin` → `/admin`. An account
   that hasn't verified gets a 403, shown as "Verify your email before
   logging in" rather than the generic wrong-password message.

The token comes back from a real login and is stored (`localStorage`,
`pages/Login.jsx`) and attached to later requests (`src/api.js`), but nothing
guards a route with it yet — see "Auth" below.

### Password recovery

**Still fully mock.** "Forgot password?" on `/login` needs a real email
service too, exactly like verification's code above, but nothing here is
connected to sign-up/log-in's real accounts — resetting a real account's
password through this flow won't actually change it yet. Same pattern as
everything else once an email service exists:

1. `requestRecoveryCode(email)` emails a one-time code and returns
   `{ expiresInSeconds }`, which is what the countdown on the recovery view
   counts down from. Called again if the person asks for a new code once it
   reaches 00:00.
2. `verifyRecoveryCode({ email, code })` returns a short-lived `{ resetToken }`.
3. `resetPassword({ resetToken, newPassword })` saves the new password, then
   the page goes back to log-in.

Answer `requestRecoveryCode` with 200 even when the email isn't registered —
the page must not reveal who has an account, same principle as log-in's
matching 401 for a wrong email or a wrong password.

While it's mock, type the code `000000` on the recovery view to see its error
state. A real server error shows the form's own message; no answer at all
shows "Can't reach the server", so a dead backend never looks like a wrong
code.

### Auth

`/login` and `/signup` both talk to the real backend now, and a successful
log-in stores a real token. **No route is guarded with it yet** — `/admin`,
`/discover` and `/profile` are still open to anyone, and nothing restores a
session after a page refresh. There's a `RequireAuth` sketch at the bottom of
`src/App.jsx` to drop in for the former; the latter needs a "who am I"
request on load that few real apps skip, but isn't built here yet.

## File map

```
src/
  theme.css                    colours, fonts, layout tokens (and --u)
  index.css                    global resets + font loading
  App.jsx                      route table
  api.js                       axios instance
  services/postdateApi.js      🔌 every backend call lives here
  pages/
    Home.jsx                   landing
    Signup.jsx                 3-step form
    Login.jsx                  log-in → recovery code → new password (one route)
    Profile.jsx                profile shell + tab switching
    Discover.jsx                logged-in home feed
    AdminDashboard.jsx         staff console (admin + moderator)
  components/
    Wordmark.jsx               POSTDATE! logo
    SiteNav.jsx                logged-out header
    AppNav.jsx                 logged-in header (maroon pill)
    SiteFooter.jsx             footer band
    HeroBackdrop.jsx           corner stripes + the two cloud banks (SVG)
    StepStamp.jsx              landing "how it works" stamp
    StampCardShell.jsx         signup stamp chrome
    FormStepper.jsx            1 → 2 → 3 progress
    WhoAreYouForm.jsx          signup step 1
    PhotosForm.jsx             signup step 2
    YourTasteForm.jsx          signup step 3
    SignupAside.jsx            "why we ask" column
    VerificationModal.jsx      mandatory post-signup code check (real call, fake code)
    auth/
      AuthPanel.jsx            pink panel + big title + cream card + "Register!" line
      LoginForm.jsx            log-in view
      RecoveryForm.jsx         enter-code view (with the countdown)
      NewPasswordForm.jsx      new-password view
      useAuthAction.js         busy / error bookkeeping shared by the three forms
    profile/
      ProfileIdentity.jsx      avatar + name + bio + meta
      ProfileTabs.jsx          the four tabs (exports PANEL_COLOURS)
      TasteTab.jsx             interest chips + edit/save
      ReviewsTab.jsx           review rows
      PhotosTab.jsx            photo mosaic + upload
      SettingsTab.jsx          dark placeholder panel
    admin/
      AdminSidebar.jsx         dashboard pills (exports SECTIONS)
    discover/
      PageBanner.jsx           reusable maroon page-title banner
      DiscoverToolbar.jsx      search bar + filters button/panel
      ProfileCard.jsx          one 280x280 card in the grid
      ProfileModal.jsx         card detail view, like/pass buttons
      DiscoverFooter.jsx       dark bottom band — see confidence note below
```

`components/Navbar.jsx` and `Navbar.css` are the original header — `SiteNav`
and `AppNav` replace it. They're left in place in case anything still imports
them, but nothing does.

## The discover page — read this before you trust it blindly

Every other page in this project was built against a screenshot of your
actual Figma frame, pixel-measured with a script. **The discover feed had no
screenshot** — only CSS layer names, sizes, and ordering — so it's a
reconstruction, not a measurement. It's internally consistent and the
evidence supports it, but you should open your real Figma frame and compare.
Specific spots to check:

- **`ProfileCard.jsx`** — a third of the 18 cards in the export were missing
  their distance/gender text, and the border wobbled between 1px and 3px.
  Almost certainly lost when the layer got duplicated, not an intentional
  variant — I made every card show the same three fields consistently.
- **`DiscoverToolbar.jsx`** — the Filters button had no panel content in the
  export at all. I built a dropdown with gender/distance/age since those are
  the only fields the cards themselves reference. If "filters" was meant to
  mean something else, this is a self-contained file to swap out.
- **`ProfileModal.jsx`** — the Figma draws its pass button as a "+" rotated
  ~45°, a common trick for faking an × from a +. I used a real × character
  for the same visual result with less markup.
- **`DiscoverFooter.jsx`** — this is the one I'm least sure about. The export
  has a 200px-tall dark bar with a single leftover "GENDER" text layer in it.
  200px is tall for a plain footer, so it might have held more, but one
  ambiguous label isn't enough to guess what. It ships as a plain dark
  footer band; if your Figma shows something else there, this is the only
  file that needs to change.

## Notes on the design

- The clouds on the landing page are inline SVG circles, not images, so they
  recolour with `--pd-maroon` and stay sharp at any size. The arcs were matched
  to the Figma export.
- The profile tabs each keep a fixed colour and the panel below adopts the
  selected tab's colour — that colour match is how the design shows which tab
  is open, so `PANEL_COLOURS` in `ProfileTabs.jsx` is shared with `Profile.jsx`
  to stop the two drifting apart.
- Fonts load from Google Fonts in `index.css`. If campus wifi blocks it, the
  file has a two-line swap to `@fontsource` instead.
- Not in these files: the **discover feed** (card grid, search, filters, profile
  modal) that's in your Figma CSS around `Rectangle 88`–`Rectangle 139`.
  `AppNav` already links to `/discover` for whenever that gets built.
