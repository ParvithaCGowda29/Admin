# BuLLM Admin

Standalone workspace-administration web for BuLLM, in the same look and feel as the
BuLLM Masters web (palette, fonts, Refine.dev table style). It hosts only the Admin
section - the Masters web is untouched and runs separately.

## Sections

- System Settings - platform-wide configuration
- User Management - who can sign in and what they can touch
- Model Switching - which model serves which slot
- License & Payments - plans, seats and renewals
- Tool Setup & Integrations - configured, checked integrations
- File Type & Standardization - accepted file types and their standards

## Run

```
npm install
npm run dev
```

Runs on its own port, http://localhost:5174 (Masters stays on 5173).

## Notes

- React + Vite + TypeScript, AG Grid (Quartz theme) and Refine, same as Masters.
- Light and dark themes; the toggle sits in the header.
- Mock data only: edits are saved in the browser (localStorage), no backend is connected.
- Search per table (contains match plus tight fuzzy), Sort A-Z / Z-A inside each column's
  filter popup, right-click to add or delete rows.
