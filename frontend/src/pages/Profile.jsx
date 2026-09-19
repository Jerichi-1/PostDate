/**
 * Profile — the signed-in user's own profile page.
 *
 *   ┌──────────────────────────────────────────────────┐
 *   │ POSTDATE!             HOME  MESSAGES  PROFILE    │  AppNav
 *   ├──────────────────────────────────────────────────┤
 *   │ ┌────────┐ │ TASTE │ REVIEWS │ PHOTOS │ ⚙ │      │
 *   │ │ avatar │ ├──────────────────────────────────┐  │
 *   │ │ name   │ │                                  │  │  tan panel
 *   │ │ bio    │ │   whichever tab is selected      │  │
 *   │ │ meta   │ │                                  │  │
 *   │ └────────┘ └──────────────────────────────────┘  │
 *   └──────────────────────────────────────────────────┘
 *
 * The panel behind the tab content takes that tab's colour — see
 * PANEL_COLOURS in components/profile/ProfileTabs.jsx.
 */
import { useEffect, useState } from "react";

import AppNav from "../components/AppNav";
import ProfileIdentity from "../components/profile/ProfileIdentity";
import ProfileTabs, { PANEL_COLOURS } from "../components/profile/ProfileTabs";
import TasteTab from "../components/profile/TasteTab";
import ReviewsTab from "../components/profile/ReviewsTab";
import PhotosTab from "../components/profile/PhotosTab";
import SettingsTab from "../components/profile/SettingsTab";

import { getProfile } from "../services/postdateApi";

export default function Profile() {
  /* 🎛️ Which tab opens first. One of: taste | reviews | photos | settings */
  const [tab, setTab] = useState("taste");

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    /* 🔌 BACKEND: GET /api/profile/me — see services/postdateApi.js.
       Swap "me" for a :userId param here when you build other people's
       profiles: const { userId } = useParams(); getProfile(userId); */
    getProfile("me")
      .then((data) => !cancelled && setProfile(data))
      .catch(() => !cancelled && setError("Could not load this profile."));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="profile">
      <style>{`
        .profile {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--pd-pink);
        }

        .profile-main {
          flex: 1;
          width: 100%;
          max-width: var(--pd-max);
          margin: 0 auto;
          padding: clamp(14px, 2vw, 34px) var(--pd-gutter) clamp(28px, 4vw, 60px);

          display: flex;
          flex-direction: column;
        }

        /* the big tan card that holds everything */
        .profile-panel {
          flex: 1;
          background: var(--pd-tan);
          border-radius: 5px;
          padding: clamp(14px, 2vw, 32px);

          /* 🎛️ THE TWO COLUMNS — first value is the left column width */
          display: grid;
          grid-template-columns: minmax(200px, 22%) minmax(0, 1fr);
          gap: clamp(14px, 2vw, 32px);
          align-items: stretch;
        }

        /* the white hairline between the two columns */
        .profile-right {
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--pd-white);
          padding-left: clamp(14px, 2vw, 32px);
          min-width: 0;
        }

        .profile-tabpanel {
          flex: 1;
          border-radius: var(--pd-radius);
          padding: clamp(14px, 2vw, 32px);
          min-height: clamp(260px, 38vw, 520px);   /* 🎛️ panel height */
          transition: background-color 0.2s ease;
        }

        .profile-status {
          font-family: var(--pd-mono);
          font-size: clamp(11px, 1vw, 16px);
          color: var(--pd-maroon);
          padding: clamp(20px, 4vw, 60px) 0;
          text-align: center;
        }

        @media (max-width: 860px) {
          .profile-panel { grid-template-columns: minmax(0, 1fr); }
          .profile-right { border-left: none; border-top: 1px solid var(--pd-white);
                           padding-left: 0; padding-top: clamp(14px, 2vw, 26px); }
        }
      `}</style>

      <AppNav />

      <main className="profile-main">
        {error && <p className="profile-status">{error}</p>}
        {!profile && !error && <p className="profile-status">Loading your profile…</p>}

        {profile && (
          <div className="profile-panel">
            <ProfileIdentity profile={profile} />

            <div className="profile-right">
              <ProfileTabs active={tab} onChange={setTab} />

              <div
                className="profile-tabpanel"
                role="tabpanel"
                id={`ppanel-${tab}`}
                aria-labelledby={`ptab-${tab}`}
                style={{ background: PANEL_COLOURS[tab] }}
              >
                {tab === "taste" && <TasteTab tags={profile.tags} />}
                {tab === "reviews" && <ReviewsTab reviews={profile.reviews} />}
                {tab === "photos" && (
                  <PhotosTab
                    photos={profile.photos}
                    onChange={(photos) => setProfile((p) => ({ ...p, photos }))}
                  />
                )}
                {tab === "settings" && <SettingsTab />}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
