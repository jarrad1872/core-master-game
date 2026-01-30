# Core Master 🎮

An addictive drilling game by DMI Tools Corp. Drill through concrete, avoid rebar, earn cash, and upgrade to professional-grade equipment!

## Quick Start

### Option 1: Simple HTTP Server (Recommended)

```bash
cd /home/node/clawd/projects/dmi-drill-game/src

# Using Python 3
python3 -m http.server 8080

# Or using Node.js (if http-server is installed)
npx http-server -p 8080

# Or using PHP
php -S localhost:8080
```

Then open: http://localhost:8080

### Option 2: Open Directly

Most browsers will run the game by opening `index.html` directly, but some features may not work due to CORS restrictions.

### Option 3: Live Server (VS Code)

If using VS Code, install the "Live Server" extension and click "Go Live" with index.html open.

## Game Controls

- **Mobile/Touch**: Hold anywhere to drill
- **Desktop**: Click and hold to drill

### Gameplay Tips

1. **Pressure Control**: Keep the pressure gauge in the GREEN zone for max speed
2. **Avoid Overheating**: Going too fast (red zone) builds heat - overheat = temporary stop
3. **Watch for Rebar**: Brown bars are rebar - hitting them breaks your combo
4. **Build Combos**: Stay in the sweet spot to build combo multipliers for bonus cash

## Features

### MVP (Current Build)
- ✅ Core drilling mechanic with pressure control
- ✅ 3 equipment tiers (Basic → Pro → Laser Welded)
- ✅ 4 job types with increasing difficulty
- ✅ XP and level progression
- ✅ Currency system for upgrades
- ✅ Shop with real DMI product links
- ✅ Procedural audio (drill sounds, effects)
- ✅ Particle effects and screen shake
- ✅ Mobile-responsive design
- ✅ Local save/load progress

### DMI Integration
- Equipment mapped to real DMI products
- Direct links to dmitools.com
- Promo code system (COREMASTER20 etc.)
- Real product prices displayed

## Technical Details

### Stack
- **Engine**: Phaser.js 3.70
- **Audio**: Web Audio API (procedural)
- **Storage**: localStorage
- **Assets**: All generated programmatically (no external files needed)

### Performance
- Bundle: < 500KB (Phaser CDN)
- First playable: < 3 seconds
- 60fps on mobile devices
- Works offline after first load

### Browser Support
- Chrome 90+
- Safari 14+
- Firefox 90+
- Edge 90+

## File Structure

```
src/
├── index.html      # Entry point
├── game.js         # All game logic (Phaser scenes)
├── styles.css      # Mobile-first styling
├── assets/         # (Textures generated in code)
└── README.md       # This file
```

## Customization

### Promo Codes
Edit the promo codes in `game.js` and `index.html`:
- COREMASTER10 (starter)
- COREMASTER20 (mid-game)
- COREMASTER25 (high-level)

### Equipment
Modify the `EQUIPMENT` object in `game.js` to:
- Change prices/stats
- Update real product URLs
- Add new equipment tiers

### Jobs
Modify the `JOBS` array to:
- Adjust difficulty/rewards
- Add new job types
- Change unlock requirements

## Deployment

### Cloudflare Pages (Recommended)
1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Build command: (none needed)
4. Output directory: `src`

### Any Static Host
Simply upload the `src` folder contents to any static hosting:
- Netlify
- Vercel
- GitHub Pages
- S3 + CloudFront

## Analytics (TODO)

For production, add tracking:
- Mixpanel/Amplitude for funnel analysis
- Track: game_start, level_up, shop_view, product_click, purchase

## License

Proprietary - DMI Tools Corp

---

Made with 🔧 for concrete professionals
