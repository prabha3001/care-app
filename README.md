# Domiciliary Care Attendance & Feedback App — Phase 1

JavaScript everywhere: HTML/CSS/JS frontend, Node.js/Express backend, SQLite database.

## Project layout

- `backend/` — Express API + SQLite database
- `frontend/` — plain HTML/CSS/JS pages (served statically by the backend)

## Running locally

```
cd backend
npm install
node seed.js      # creates a test carer, client, and today's visit (run once)
node server.js
```

Then open `http://localhost:3000` in a browser.

Test login: `carer@test.com` / `password123`

## What's implemented (Phase 1)

- Carer login (JWT-based session, bcrypt-hashed passwords)
- Today's visits list per carer
- Clock-in / clock-out with GPS capture
- Public feedback page (star rating + comment), linked per visit, no login required

## Not yet done (see `phase1-build-guide.md` for the full roadmap)

- Deployment (Render/Netlify) and migrating off SQLite for production
- Real carer/client onboarding (currently only seeded test data)
- Anything from the "genuinely optional to skip for now" list in the build guide
