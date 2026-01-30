# Core Driller v3 - DMI Tools Corp

A polished, professional-grade 2D side-scrolling run-and-gun platformer featuring DMI Tools Corp branding and real core drilling industry themes.

## 🎮 How to Play

### Desktop Controls
- **WASD / Arrow Keys** - Move
- **Space** - Jump (hold for higher jump)
- **Click** - Shoot concrete cores
- **Down Arrow** - Fast fall
- **ESC** - Pause

### Mobile Controls
- **Left side of screen** - Touch & drag to move
- **Right side (lower)** - Tap to shoot
- **Right side (upper)** - Tap to jump

## 🔧 Features

### The DMI Core Drill
The player character wields a recognizable DMI CD20A core drill:
- Silver/white motor body with red "DMI" logo
- Black diamond core bit with silver segments at tip
- Shoots concrete "cores" as projectiles

### Enemies (from the core drilling industry)
1. **Angry Homeowners** - Upset about mess/noise, throw household objects
2. **Impatient Foremen** - Blow whistles that shoot "complaint" projectiles
3. **Building Inspectors** - Throw violation papers in spreads
4. **Flying Hard Hats** - Possessed PPE that swoops down to attack

### Power-Ups (real DMI products)
1. **Slurry Ring** (🛡️) - Shield that absorbs 3 hits
2. **Bit Extension** (R) - Increases projectile range by 80%
3. **Sharpening Block** (D) - Doubles damage for 8 seconds
4. **Anchors** (I) - Temporary invincibility for 8 seconds
5. **Health** - Restores 1 HP

### Polish Features
- ✨ Screen shake on impacts
- 🎆 Particle systems (muzzle flash, impacts, explosions, dust)
- 💥 Hit flash on damage
- 🎵 Procedural audio (Web Audio API)
- 🏞️ Parallax scrolling backgrounds
- 📱 Mobile-optimized touch controls
- 🎮 Variable jump height (hold for higher)
- ⏱️ Coyote time & jump buffering

## 🏃 Running the Game

### Option 1: Python HTTP Server
```bash
cd src-v3
python3 -m http.server 8000
# Open http://localhost:8000
```

### Option 2: Node.js HTTP Server
```bash
cd src-v3
npx serve .
# Or: npx http-server .
```

### Option 3: Direct File
Just open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge).

## 🎯 Game Mechanics

### Physics
- Variable jump (0.25s hold time for full height)
- Coyote time (0.12s grace period after leaving platform)
- Jump buffering (0.1s before landing)
- Fast fall (hold down while airborne)

### Combat
- Shoot cooldown: 0.25s
- Projectile speed: 600 px/s
- Invincibility after hit: 1.5s

### Waves
- Enemies scale with wave number
- Power-ups spawn between waves
- Enemy mix shifts to harder types in later waves

## 📁 File Structure

```
src-v3/
├── index.html    # Main HTML with styles
├── game.js       # Complete game engine (~2500 lines)
└── README.md     # This file
```

## 🎨 Art Style

All graphics are programmatically generated using Canvas 2D:
- Chunky pixel art aesthetic
- DMI brand colors (Orange #FF6B00, Blue #4FC3F7)
- Construction site theme (safety yellow, concrete gray)
- Bold black outlines for readability

## 🔊 Audio

Procedural sound generation using Web Audio API:
- Drill shoot (whoosh-thunk)
- Impact sounds (concrete)
- Enemy deaths (explosions)
- Power-up pickups (rising melody)
- Jump sounds
- Hurt sounds

## 📱 Mobile Support

- Responsive canvas scaling
- Touch control zones (invisible by default)
- Larger hitboxes for touch accuracy
- Haptic feedback ready (if enabled)

## 🎮 Game Loop

1. **Menu** → Start Game
2. **Wave Announcement** → 3 second countdown
3. **Spawn Enemies** → Based on wave difficulty
4. **Combat** → Shoot enemies, collect power-ups
5. **Wave Complete** → Bonus power-up, next wave
6. **Game Over** → High score saved to localStorage

## 💡 Tips

- Use platforms for tactical advantage
- Flying Hard Hats telegraph their swoop - dodge sideways
- Foremen shoot in patterns - jump between shots
- Inspectors are tanky but slow
- Shield is the best defensive power-up
- Damage boost + Range boost = devastating combo

## 🏢 Credits

**DMI Tools Corp** - The real heroes of the core drilling industry

Built with ❤️ and pure JavaScript (no external dependencies)

---

*"Every time the player drills, it should feel satisfying."*
