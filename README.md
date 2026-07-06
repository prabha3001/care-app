# Domiciliary Care Attendance & Feedback App — Phase 1

JavaScript everywhere: HTML/CSS/JS frontend, Node.js/Express backend, PostgreSQL database.

## Project layout

- `backend/` — Express API + PostgreSQL database
- `frontend/` — plain HTML/CSS/JS pages (served statically by the backend)
- `render.yaml` — Render deployment blueprint (web service + Postgres database)

## Running locally

You need a Postgres database to point at — either a local install/Docker container, or
the free Postgres instance you create on Render (see Deployment below); its connection
string works fine from your laptop too.

```
cd backend
npm install
cp .env.example .env      # then fill in DATABASE_URL and JWT_SECRET
node seed.js               # creates a test carer, client, and today's visit (run once)
node server.js
```

To test the clock-in/clock-out flow again after a visit is already completed, reset it
back to a fresh not-started state:

```
node reset-visit.js       # resets visit id 1 (pass a different id as an argument)
```

Then open `http://localhost:3000` in a browser.

Test login: `carer@test.com` / `password123`

## What's implemented (Phase 1)

- Carer login (JWT-based session, bcrypt-hashed passwords)
- Today's visits list per carer
- Clock-in / clock-out with GPS capture
- Public feedback page (star rating + comment), linked per visit, no login required

## Deployment (Render)

1. **Push this repo to GitHub** — create an empty repo on github.com (no README/license,
   so it doesn't conflict with what's already here), then:
   ```
   git remote add origin https://github.com/<you>/<repo-name>.git
   git push -u origin main
   ```
2. **Render** — on render.com, sign up/log in, then **New > Blueprint**, connect your
   GitHub account, and pick this repo. Render reads `render.yaml` automatically and
   proposes a web service (`care-app`) plus a free Postgres database (`care-app-db`),
   with `JWT_SECRET` auto-generated and `DATABASE_URL` wired to the database. Click
   **Apply** to create both.
3. Once the database is up, grab its **External Database URL** from the Render
   dashboard and put it in your local `backend/.env` as `DATABASE_URL` (with
   `NODE_ENV=production` so the SSL setting matches). Run `node seed.js` locally once
   against it to create the test carer/client/visit — or skip this and create real
   carers/clients directly once you're past the demo stage.
4. Render will build and deploy automatically. Your app is live at the `.onrender.com`
   URL shown on the dashboard.

Free-tier notes: the web service spins down after inactivity (first request after idle
takes ~30-50s to wake up), and the free Postgres database expires after 90 days —
fine for a demo/pilot, but plan to upgrade before real client use.

## Not yet done (see `phase1-build-guide.md` for the full roadmap)

- Real carer/client onboarding (currently only seeded test data)
- HTTPS is automatic on Render, but the other data-protection steps in the build guide
  (no logging sensitive data, written agreement with Simple Care 4 U) are still to do
  before real client data goes in
- Anything from the "genuinely optional to skip for now" list in the build guide
