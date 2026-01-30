# Core Driller 🔧

**A DMI Tools Corp Game**

A 2D side-scrolling action platformer where you play as a construction worker armed with a core drill! Blast through enemies with concrete cores and drill through walls to reach the finish line.

## 🎮 How to Play

### Controls

**Desktop:**
- **Arrow Keys / WASD** - Move left/right
- **Space / W** - Jump
- **Mouse Click** - Shoot cores
- **ESC** - Pause game

**Mobile:**
- **Left/Right Buttons** - Move
- **Jump Button** - Jump  
- **Tap Screen** - Shoot cores

### Objective

Navigate through construction sites, defeat enemies, drill through walls, and reach the finish flag at the end of each level. Complete all 3 levels to win!

## 🎯 Gameplay Features

### Your Character
You're a construction worker equipped with a core drill machine. The drill shoots wall cores (cylindrical concrete slugs) at enemies.

### Enemies
- **Angry Homeowners** 👔 - Basic ground enemies (100 pts)
- **Hard Hat Enemies** 🪖 - Flying enemies that track you (150 pts)
- **Angry Foremen** 👷 - Tough enemies that shoot back (300 pts, 3 hits to kill)

### Wall Drilling
When you see an orange drill target on a wall:
1. Walk into it and hold your direction
2. Hold to drill through (progress bar fills)
3. Wall destroyed! +500 bonus points

### Power-Ups
- ⚡ **Speed Boost** (Blue) - Faster fire rate for 10 seconds
- 💥 **Big Cores** (Orange) - Larger, more powerful shots for 15 seconds
- 🛡️ **Shield** (Green) - Safety glasses protect from one hit
- ❤️ **Health** (Red) - +1 life (max 5)

### Obstacles
- **Rebar** - Rusty metal spikes sticking up
- **Pipes** - PVC pipes to jump over
- Touch an obstacle = damage!

## 📊 Scoring

| Action | Points |
|--------|--------|
| Homeowner kill | 100 |
| Hard Hat kill | 150 |
| Foreman kill | 300 |
| Power-up collected | 50 |
| Wall drilled | 500 |
| Life bonus (per life at level end) | 500 |

High scores are saved locally!

## 🏗️ Levels

1. **Construction Site** - Easy introduction (3200px)
2. **The Basement** - More enemies, more obstacles (4000px)  
3. **Boss Site** - Maximum challenge! (4800px)

## 🛠️ Technical Details

- **Engine:** Phaser 3.70
- **Resolution:** 800x480 (scales to fit)
- **Mobile Support:** Touch controls, responsive design
- **Audio:** Procedurally generated sound effects
- **Graphics:** All sprites generated at runtime (no external assets)

## 🚀 Running Locally

Simply serve the files with any HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🎨 Visual Style

- Pixel art aesthetic with clean 2D sprites
- DMI brand colors: Orange (#FF6B00) and Blue (#4FC3F7)
- Construction site theme throughout
- Fun and cartoony but not childish

## 📱 Mobile Optimization

- Responsive scaling to any screen size
- Touch-friendly control buttons
- Optimized for portrait and landscape
- Fast loading (no external assets to download)

## 🔗 Links

- [Shop Real Core Drill Bits](https://dmitools.com/collections/core-drill-bits) - Available in pause menu and game over screen
- [DMI Tools Corp](https://dmitools.com) - Professional diamond tools

---

**Made with 💪 by DMI Tools Corp**

*"Drill through the competition!"*
