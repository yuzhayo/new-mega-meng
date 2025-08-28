# Project Log – new-mega-meng

This file records frozen bases, milestones, and major changes.  
Use it alongside Git commit history and tags for a full timeline.

---

## v0.1.0-base (2025-08-29)
- 🚀 First clean baseline created  
- Locked environment: Node **20.19.0**, Vite **7.1**, React **19**, TypeScript **5.9**, Vitest **3.2**  
- TailwindCSS + PostCSS configured and working  
- ESLint v9 config migrated (`eslint.config.js`) with TypeScript + React rules  
- Netlify deploy confirmed (command: `npm run build`, publish: `dist`)  
- GitHub repo connected via VS Code → commit → push → tag  

---

## Next Planned Steps
- **v0.2.0-plan**: Add rotation system core (Three.js integration)  
- Create scaffolding for:
  - `src/Launcher/LauncherScreen.tsx` (preview canvas)  
  - `src/Launcher/LauncherSetting.tsx` (floating config panel)  
- Implement adaptive performance rules (FPS cap, pause on tab hide, quality tiers)  

---

👉 **Workflow Reminder:**  
- When freezing a base → commit with `freeze: …` and tag it (`v0.x.x-base`).  
- Update this log with date + notes.  
