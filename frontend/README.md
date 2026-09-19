# POSTDATE! — frontend

React + Vite frontend for the MERN dating platform. Everything renders with
**no backend running** — each screen pulls from mock data until the real routes
are wired up.

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

Sizes use `clamp(min, scale, max)` so the pages scale from phone to 1920px
without separate mobile styles. To make something bigger everywhere, raise the
third number.

## Plugging in the backend

**`src/services/postdateApi.js` is the only file the backend team needs to
touch.** Every screen gets its data from a function there; no component knows a
server exists.

Each function is written like this:

```js
export async function getProfile(userId = "me") {
  // const { data } = await api.get(`/profile/${userId}`);   ← uncomment
  // return data;
  return delay(MOCK_PROFILE);                               // ← delete
}
```

So connecting a route is: uncomment two lines, delete one. The `@route` comment
above each function says which endpoint it expects, and `@returns` documents the
shape the UI needs. If the server ends up returning a different shape, map it
inside that function rather than editing components.

Routes the frontend is waiting on:

| Function               | Route                                                              |
| ----------------------- | --------------------------------------------------------------------- |
| `getLandingStats`     | `GET /api/stats`                                                   |
| `submitSignup`        | `POST /api/signup` (multipart)                                     |
| `getTasteOptions`     | `GET /api/tags`                                                    |
| `getDiscoverProfiles` | `GET /api/discover?query=&gender=&maxDistance=&minAge=&maxAge=`    |
| `likeProfile`         | `POST /api/discover/like`                                          |
| `passProfile`         | `POST /api/discover/pass`                                          |
| `getProfile`          | `GET /api/profile/:userId`                                         |
| `saveProfileTags`     | `PUT /api/profile/tags`                                            |
| `uploadProfilePhotos` | `POST /api/profile/photos`                                         |
| `getActiveCount`      | `GET /api/admin/active-count`                                      |
| `getAdminSection`     | `GET /api/admin/:section`                                          |

The base URL lives in `src/api.js` (`http://localhost:5000/api`).

Delete the `MOCK_` block at the bottom of `postdateApi.js` once everything is
connected.

### Auth

No login yet, so `/admin` is open to anyone. There's a `RequireAuth` sketch at
the bottom of `src/App.jsx` to drop in once sessions exist.

## File map

```
src/
  theme.css                    colours, fonts, layout tokens
  index.css                    global resets + font loading
  App.jsx                      route table
  api.js                       axios instance
  services/postdateApi.js      🔌 every backend call lives here
  pages/
    Home.jsx                   landing
    Signup.jsx                 3-step form
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
