/**
 * Core Master - DMI Tools Corp
 * An addictive drilling game showcasing DMI drill bits
 * Built with Phaser 3
 */

// ============================================
// GAME CONFIGURATION & DATA
// ============================================

const DMI_COLORS = {
    blue: 0x1a4b8c,
    orange: 0xf47920,
    white: 0xffffff,
    darkBg: 0x0a1628,
    concrete: 0x4a5568,
    concreteLight: 0x718096,
    rebar: 0x8b4513,
    success: 0x48bb78,
    warning: 0xf56565,
    gold: 0xffd700
};

// Equipment tiers mapped to real DMI products
const EQUIPMENT = {
    basic: {
        id: 'basic',
        name: 'Basic Brazed Bit',
        realName: 'DMI Brazed Core Bit',
        price: 0,
        speed: 1.0,
        durability: 1.0,
        overheatResist: 1.0,
        unlockLevel: 1,
        realPrice: '$101-$150',
        productUrl: 'https://dmitools.com/collections/core-bits'
    },
    pro: {
        id: 'pro',
        name: 'Pro Brazed Bit',
        realName: 'DMI Pro Brazed Core Bit',
        price: 500,
        speed: 1.5,
        durability: 1.3,
        overheatResist: 1.2,
        unlockLevel: 5,
        realPrice: '$150-$300',
        productUrl: 'https://dmitools.com/collections/core-bits'
    },
    laserSmall: {
        id: 'laserSmall',
        name: 'Laser Welded 2"',
        realName: 'DMI Laser Welded Core Bit',
        price: 1500,
        speed: 2.0,
        durability: 1.8,
        overheatResist: 1.5,
        unlockLevel: 10,
        realPrice: '$113-$350',
        productUrl: 'https://dmitools.com/collections/laser-welded'
    }
};

// Job types
const JOBS = [
    {
        id: 'residential',
        name: 'Residential',
        description: 'Standard concrete slab',
        difficulty: 1,
        depth: 100,
        rebarChance: 0.05,
        reward: { min: 50, max: 100 },
        xp: 25,
        unlockLevel: 1
    },
    {
        id: 'commercial',
        name: 'Commercial',
        description: 'Reinforced concrete floor',
        difficulty: 2,
        depth: 150,
        rebarChance: 0.15,
        reward: { min: 150, max: 300 },
        xp: 50,
        unlockLevel: 3
    },
    {
        id: 'industrial',
        name: 'Industrial',
        description: 'Heavy reinforced structure',
        difficulty: 3,
        depth: 200,
        rebarChance: 0.25,
        reward: { min: 400, max: 700 },
        xp: 100,
        unlockLevel: 7
    },
    {
        id: 'infrastructure',
        name: 'Infrastructure',
        description: 'Bridge foundation',
        difficulty: 4,
        depth: 300,
        rebarChance: 0.35,
        reward: { min: 1000, max: 2000 },
        xp: 200,
        unlockLevel: 12
    }
];

// Game state (saved to localStorage)
let gameState = {
    level: 1,
    xp: 0,
    xpToNext: 100,
    cash: 0,
    equipment: 'basic',
    ownedEquipment: ['basic'],
    jobsCompleted: 0,
    totalDepthDrilled: 0,
    highScore: 0,
    dailyStreak: 0,
    lastPlayed: null,
    promoShown: {}
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function loadGameState() {
    const saved = localStorage.getItem('coremaster_save');
    if (saved) {
        const parsed = JSON.parse(saved);
        gameState = { ...gameState, ...parsed };
    }
}

function saveGameState() {
    gameState.lastPlayed = Date.now();
    localStorage.setItem('coremaster_save', JSON.stringify(gameState));
}

function addXP(amount) {
    gameState.xp += amount;
    while (gameState.xp >= gameState.xpToNext) {
        gameState.xp -= gameState.xpToNext;
        gameState.level++;
        gameState.xpToNext = Math.floor(100 * Math.pow(1.2, gameState.level - 1));
    }
    saveGameState();
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

// Simple procedural audio
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.log('Web Audio not supported');
            this.enabled = false;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playDrill(intensity = 0.5) {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = 80 + intensity * 60;
        
        filter.type = 'lowpass';
        filter.frequency.value = 500 + intensity * 800;
        
        gain.gain.value = 0.1 * intensity;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playHitRebar() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = 200;
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);
        
        gain.gain.value = 0.3;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playSuccess() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.value = 0;
            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.4);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.4);
        });
    }

    playClick() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 800;
        
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playOverheat() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.value = 220;
        
        gain.gain.value = 0.15;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }
}

const soundManager = new SoundManager();

// ============================================
// BOOT SCENE
// ============================================

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Update loading bar
        const progressBar = document.getElementById('load-progress');
        
        this.load.on('progress', (value) => {
            if (progressBar) progressBar.style.width = (value * 100) + '%';
        });

        // Generate textures programmatically (no external assets needed)
        this.createTextures();
    }

    createTextures() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Drill bit texture
        g.clear();
        g.fillStyle(DMI_COLORS.orange);
        g.fillCircle(32, 32, 28);
        g.fillStyle(DMI_COLORS.blue);
        g.fillCircle(32, 32, 12);
        g.fillStyle(DMI_COLORS.white);
        g.fillCircle(32, 32, 4);
        g.generateTexture('drillBit', 64, 64);

        // Concrete texture
        g.clear();
        g.fillStyle(DMI_COLORS.concrete);
        g.fillRect(0, 0, 64, 64);
        // Add noise/texture
        for (let i = 0; i < 50; i++) {
            const shade = Phaser.Math.Between(0x3a4558, 0x5a6578);
            g.fillStyle(shade);
            g.fillRect(
                Phaser.Math.Between(0, 60),
                Phaser.Math.Between(0, 60),
                Phaser.Math.Between(2, 6),
                Phaser.Math.Between(2, 6)
            );
        }
        g.generateTexture('concrete', 64, 64);

        // Rebar texture
        g.clear();
        g.fillStyle(DMI_COLORS.rebar);
        g.fillRect(0, 0, 48, 8);
        g.generateTexture('rebar', 48, 8);

        // Particle
        g.clear();
        g.fillStyle(0xffffff);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle', 8, 8);

        // Button
        g.clear();
        g.fillStyle(DMI_COLORS.orange);
        g.fillRoundedRect(0, 0, 200, 50, 10);
        g.generateTexture('button', 200, 50);

        // Button hover
        g.clear();
        g.fillStyle(0xff8c3a);
        g.fillRoundedRect(0, 0, 200, 50, 10);
        g.generateTexture('buttonHover', 200, 50);

        g.destroy();
    }

    create() {
        loadGameState();
        soundManager.init();
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }

        this.scene.start('MenuScene');
    }
}

// ============================================
// MENU SCENE
// ============================================

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(width/2, height/2, width, height, DMI_COLORS.darkBg);
        
        // Animated background particles
        this.createBackgroundParticles();

        // Logo area
        const logoY = height * 0.2;
        
        // Drill icon
        const drillIcon = this.add.image(width/2, logoY, 'drillBit')
            .setScale(1.5);
        
        this.tweens.add({
            targets: drillIcon,
            rotation: Math.PI * 2,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
        });

        // Title
        this.add.text(width/2, logoY + 70, 'CORE MASTER', {
            fontSize: Math.min(width * 0.1, 48) + 'px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff',
            stroke: '#1a4b8c',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Tagline
        this.add.text(width/2, logoY + 110, 'by DMI Tools Corp', {
            fontSize: Math.min(width * 0.04, 18) + 'px',
            fontFamily: 'Arial, sans-serif',
            color: '#f47920'
        }).setOrigin(0.5);

        // Stats display
        const statsY = height * 0.4;
        this.add.text(width/2, statsY, `Level ${gameState.level}`, {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width/2, statsY + 30, `$${formatNumber(gameState.cash)}`, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#48bb78'
        }).setOrigin(0.5);

        // Buttons
        const buttonY = height * 0.55;
        const buttonSpacing = 70;

        this.createButton(width/2, buttonY, 'PLAY', () => {
            soundManager.playClick();
            this.scene.start('JobSelectScene');
        });

        this.createButton(width/2, buttonY + buttonSpacing, 'SHOP', () => {
            soundManager.playClick();
            this.scene.start('ShopScene');
        });

        // DMI link
        const link = this.add.text(width/2, height - 40, '🔧 Shop Real DMI Tools →', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#f47920'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        link.on('pointerdown', () => {
            window.open('https://dmitools.com', '_blank');
        });

        link.on('pointerover', () => link.setColor('#ff9940'));
        link.on('pointerout', () => link.setColor('#f47920'));
    }

    createBackgroundParticles() {
        const { width, height } = this.cameras.main;
        
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const particle = this.add.circle(x, y, Phaser.Math.Between(1, 3), 0x1a4b8c, 0.3);
            
            this.tweens.add({
                targets: particle,
                y: particle.y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000),
                onRepeat: () => {
                    particle.y = height + 50;
                    particle.x = Phaser.Math.Between(0, width);
                    particle.alpha = 0.3;
                }
            });
        }
    }

    createButton(x, y, text, callback) {
        const btn = this.add.image(x, y, 'button').setInteractive({ useHandCursor: true });
        const btnText = this.add.text(x, y, text, {
            fontSize: '20px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setTexture('buttonHover'));
        btn.on('pointerout', () => btn.setTexture('button'));
        btn.on('pointerdown', callback);

        return { btn, btnText };
    }
}

// ============================================
// JOB SELECT SCENE
// ============================================

class JobSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'JobSelectScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(width/2, height/2, width, height, DMI_COLORS.darkBg);

        // Header
        this.add.text(width/2, 40, 'SELECT JOB', {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Current equipment
        const equipment = EQUIPMENT[gameState.equipment];
        this.add.text(width/2, 75, `🔧 ${equipment.name}`, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#f47920'
        }).setOrigin(0.5);

        // Job cards
        const startY = 120;
        const cardHeight = 90;
        const padding = 15;

        JOBS.forEach((job, index) => {
            const y = startY + index * (cardHeight + padding);
            this.createJobCard(width/2, y, job, cardHeight);
        });

        // Back button
        this.createBackButton();
    }

    createJobCard(x, y, job, height) {
        const { width } = this.cameras.main;
        const cardWidth = width - 40;
        const locked = gameState.level < job.unlockLevel;

        // Card background
        const card = this.add.rectangle(x, y, cardWidth, height, locked ? 0x2d3748 : DMI_COLORS.blue, 0.8)
            .setStrokeStyle(2, locked ? 0x4a5568 : DMI_COLORS.orange);

        if (!locked) {
            card.setInteractive({ useHandCursor: true });
            
            card.on('pointerover', () => card.setFillStyle(0x2a5a9c, 0.9));
            card.on('pointerout', () => card.setFillStyle(DMI_COLORS.blue, 0.8));
            card.on('pointerdown', () => {
                soundManager.playClick();
                this.scene.start('GameScene', { job });
            });
        }

        // Job name
        this.add.text(x - cardWidth/2 + 15, y - height/2 + 15, job.name, {
            fontSize: '20px',
            fontFamily: 'Arial Black, sans-serif',
            color: locked ? '#718096' : '#ffffff'
        });

        // Description
        this.add.text(x - cardWidth/2 + 15, y - height/2 + 40, job.description, {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: locked ? '#4a5568' : '#a0aec0'
        });

        // Difficulty stars
        const stars = '⭐'.repeat(job.difficulty);
        this.add.text(x - cardWidth/2 + 15, y + height/2 - 25, stars, {
            fontSize: '14px'
        });

        // Reward
        this.add.text(x + cardWidth/2 - 15, y - 10, `$${job.reward.min}-${job.reward.max}`, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: locked ? '#4a5568' : '#48bb78'
        }).setOrigin(1, 0.5);

        // XP
        this.add.text(x + cardWidth/2 - 15, y + 15, `+${job.xp} XP`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: locked ? '#4a5568' : '#f47920'
        }).setOrigin(1, 0.5);

        // Lock overlay
        if (locked) {
            this.add.text(x + cardWidth/2 - 15, y - 25, `🔒 Level ${job.unlockLevel}`, {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#718096'
            }).setOrigin(1, 0.5);
        }
    }

    createBackButton() {
        const back = this.add.text(20, 35, '← Back', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#f47920'
        }).setInteractive({ useHandCursor: true });

        back.on('pointerdown', () => {
            soundManager.playClick();
            this.scene.start('MenuScene');
        });
    }
}

// ============================================
// MAIN GAME SCENE
// ============================================

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.currentJob = data.job;
        this.drilling = false;
        this.depth = 0;
        this.targetDepth = data.job.depth;
        this.pressure = 0;
        this.heat = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.obstacles = [];
        this.score = 0;
        this.equipment = EQUIPMENT[gameState.equipment];
        this.gameOver = false;
        this.shakeIntensity = 0;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(width/2, height/2, width, height, DMI_COLORS.darkBg);

        // Concrete layers (scrolling)
        this.concreteGroup = this.add.group();
        this.createConcreteBackground();

        // Generate obstacles
        this.generateObstacles();

        // Drill bit (player controlled)
        this.drillBit = this.add.image(width/2, 100, 'drillBit').setScale(1.2);

        // Particle emitter for drilling
        this.particles = this.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 150 },
            angle: { min: -150, max: -30 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            tint: [DMI_COLORS.concrete, DMI_COLORS.concreteLight, 0x666666],
            emitting: false
        });

        // Sparks for rebar hits
        this.sparks = this.add.particles(0, 0, 'particle', {
            speed: { min: 100, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            lifespan: 300,
            tint: [0xffff00, 0xff8800, 0xffffff],
            emitting: false
        });

        // UI
        this.createUI();

        // Input
        this.input.on('pointerdown', () => this.startDrilling());
        this.input.on('pointerup', () => this.stopDrilling());
        this.input.on('pointerout', () => this.stopDrilling());

        // Initialize audio on first interaction
        this.input.once('pointerdown', () => soundManager.resume());
    }

    createConcreteBackground() {
        const { width, height } = this.cameras.main;
        const tileSize = 64;

        for (let y = 120; y < height + tileSize; y += tileSize) {
            for (let x = 0; x < width; x += tileSize) {
                const tile = this.add.image(x + tileSize/2, y + tileSize/2, 'concrete');
                this.concreteGroup.add(tile);
            }
        }
    }

    generateObstacles() {
        const { width } = this.cameras.main;
        const numObstacles = Math.floor(this.targetDepth / 20 * this.currentJob.rebarChance * 10);

        for (let i = 0; i < numObstacles; i++) {
            const obstacleDepth = Phaser.Math.Between(20, this.targetDepth - 20);
            const x = Phaser.Math.Between(50, width - 50);
            
            this.obstacles.push({
                depth: obstacleDepth,
                x: x,
                hit: false,
                sprite: null
            });
        }
    }

    createUI() {
        const { width, height } = this.cameras.main;

        // Depth meter (left side)
        this.add.text(15, 15, 'DEPTH', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#a0aec0'
        });

        this.depthText = this.add.text(15, 32, '0 ft', {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        });

        this.depthBar = this.add.rectangle(15, 70, 8, height - 100, 0x2d3748).setOrigin(0);
        this.depthProgress = this.add.rectangle(15, 70, 8, 0, DMI_COLORS.orange).setOrigin(0);

        // Target depth
        this.add.text(28, height - 35, `/${this.targetDepth}ft`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#718096'
        });

        // Pressure gauge (right side)
        this.add.text(width - 80, 15, 'PRESSURE', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#a0aec0'
        });

        this.pressureBar = this.add.rectangle(width - 30, 40, 15, 150, 0x2d3748).setOrigin(0.5, 0);
        this.pressureFill = this.add.rectangle(width - 30, 190, 15, 0, DMI_COLORS.blue).setOrigin(0.5, 1);
        
        // Sweet spot indicator
        this.sweetSpot = this.add.rectangle(width - 30, 100, 20, 30, DMI_COLORS.success, 0.3)
            .setStrokeStyle(2, DMI_COLORS.success);

        // Heat indicator
        this.add.text(width - 80, 200, 'HEAT', {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#a0aec0'
        });

        this.heatBar = this.add.rectangle(width - 30, 220, 15, 80, 0x2d3748).setOrigin(0.5, 0);
        this.heatFill = this.add.rectangle(width - 30, 300, 15, 0, DMI_COLORS.warning).setOrigin(0.5, 1);

        // Combo display
        this.comboText = this.add.text(width/2, 50, '', {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffd700'
        }).setOrigin(0.5).setAlpha(0);

        // Job name
        this.add.text(width/2, 15, this.currentJob.name.toUpperCase(), {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#f47920'
        }).setOrigin(0.5);

        // Instruction
        this.instructionText = this.add.text(width/2, height - 60, '👆 HOLD TO DRILL', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.instructionText,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    startDrilling() {
        if (this.gameOver) return;
        this.drilling = true;
        this.particles.emitting = true;
        this.instructionText.setVisible(false);
    }

    stopDrilling() {
        this.drilling = false;
        this.particles.emitting = false;
    }

    update(time, delta) {
        if (this.gameOver) return;

        const { width, height } = this.cameras.main;
        const dt = delta / 1000;

        // Update pressure
        if (this.drilling) {
            this.pressure = Math.min(1, this.pressure + dt * 2);
        } else {
            this.pressure = Math.max(0, this.pressure - dt * 3);
        }

        // Check if in sweet spot (0.5 - 0.8)
        const inSweetSpot = this.pressure >= 0.5 && this.pressure <= 0.8;
        
        // Calculate drill speed
        let drillSpeed = 0;
        if (this.drilling && this.heat < 1) {
            const baseSpeed = 30 * this.equipment.speed;
            
            if (inSweetSpot) {
                drillSpeed = baseSpeed * 1.5;
                this.combo = Math.min(5, this.combo + dt * 0.5);
                this.comboTimer = 2;
            } else if (this.pressure > 0.8) {
                drillSpeed = baseSpeed * 0.5;
                this.heat += dt * 0.3 / this.equipment.overheatResist;
            } else {
                drillSpeed = baseSpeed * this.pressure;
            }

            // Apply combo multiplier
            drillSpeed *= (1 + (this.combo - 1) * 0.2);

            // Play drill sound
            if (time % 100 < 20) {
                soundManager.playDrill(this.pressure);
            }
        }

        // Combo decay
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
            this.combo = Math.max(1, this.combo - dt);
        }

        // Heat decay
        if (!this.drilling || this.pressure < 0.8) {
            this.heat = Math.max(0, this.heat - dt * 0.2);
        }

        // Overheat check
        if (this.heat >= 1) {
            soundManager.playOverheat();
            this.cameras.main.shake(200, 0.01);
            this.heat = 0.5;
        }

        // Update depth
        this.depth += drillSpeed * dt;

        // Check for obstacle collision
        this.checkObstacles();

        // Scroll concrete
        this.scrollConcrete(drillSpeed * dt);

        // Update UI
        this.updateUI();

        // Update particle position
        this.particles.setPosition(this.drillBit.x, this.drillBit.y + 30);

        // Screen shake when drilling
        if (this.drilling && this.pressure > 0.3) {
            this.shakeIntensity = this.pressure * 2;
            this.drillBit.x = width/2 + Phaser.Math.Between(-this.shakeIntensity, this.shakeIntensity);
            this.drillBit.rotation = Phaser.Math.Between(-5, 5) * 0.01;
        } else {
            this.drillBit.x = width/2;
            this.drillBit.rotation = 0;
        }

        // Drill bit rotation
        if (this.drilling) {
            this.drillBit.rotation += dt * 10 * this.pressure;
        }

        // Check win condition
        if (this.depth >= this.targetDepth) {
            this.completeJob();
        }
    }

    checkObstacles() {
        const { width, height } = this.cameras.main;

        this.obstacles.forEach(obs => {
            // Show obstacle when close
            if (!obs.sprite && this.depth > obs.depth - 50) {
                const screenY = 120 + (obs.depth - this.depth) * 3;
                obs.sprite = this.add.image(obs.x, screenY, 'rebar').setScale(2, 1);
            }

            // Update sprite position
            if (obs.sprite) {
                const screenY = 120 + (obs.depth - this.depth) * 3;
                obs.sprite.y = screenY;

                // Check collision
                if (!obs.hit && Math.abs(this.depth - obs.depth) < 5) {
                    const drillX = this.drillBit.x;
                    if (Math.abs(drillX - obs.x) < 40) {
                        this.hitRebar(obs);
                    }
                }

                // Remove when past
                if (screenY < 0) {
                    obs.sprite.destroy();
                    obs.sprite = null;
                }
            }
        });
    }

    hitRebar(obstacle) {
        obstacle.hit = true;
        
        soundManager.playHitRebar();
        this.cameras.main.shake(300, 0.02);
        
        // Sparks
        this.sparks.setPosition(obstacle.x, obstacle.sprite.y);
        this.sparks.explode(20);

        // Penalty
        this.combo = 1;
        this.heat += 0.2;

        // Flash rebar
        this.tweens.add({
            targets: obstacle.sprite,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
    }

    scrollConcrete(amount) {
        this.concreteGroup.getChildren().forEach(tile => {
            tile.y -= amount * 2;
            if (tile.y < -32) {
                tile.y += this.cameras.main.height + 64;
            }
        });
    }

    updateUI() {
        const { height } = this.cameras.main;

        // Depth
        this.depthText.setText(Math.floor(this.depth) + ' ft');
        const depthPercent = this.depth / this.targetDepth;
        this.depthProgress.height = (height - 100) * depthPercent;

        // Pressure
        this.pressureFill.height = this.pressure * 150;
        
        // Color pressure bar based on zone
        if (this.pressure >= 0.5 && this.pressure <= 0.8) {
            this.pressureFill.setFillStyle(DMI_COLORS.success);
        } else if (this.pressure > 0.8) {
            this.pressureFill.setFillStyle(DMI_COLORS.warning);
        } else {
            this.pressureFill.setFillStyle(DMI_COLORS.blue);
        }

        // Heat
        this.heatFill.height = this.heat * 80;
        this.heatFill.setFillStyle(this.heat > 0.7 ? 0xff0000 : DMI_COLORS.warning);

        // Combo
        if (this.combo > 1.5) {
            this.comboText.setText(`x${this.combo.toFixed(1)} COMBO!`);
            this.comboText.setAlpha(1);
        } else {
            this.comboText.setAlpha(0);
        }
    }

    completeJob() {
        this.gameOver = true;
        this.drilling = false;
        this.particles.emitting = false;

        soundManager.playSuccess();
        this.cameras.main.flash(500, 255, 255, 255);

        // Calculate rewards
        const baseReward = Phaser.Math.Between(this.currentJob.reward.min, this.currentJob.reward.max);
        const comboBonus = Math.floor(baseReward * (this.combo - 1) * 0.2);
        const totalReward = baseReward + comboBonus;

        // Update game state
        gameState.cash += totalReward;
        gameState.jobsCompleted++;
        gameState.totalDepthDrilled += this.depth;
        addXP(this.currentJob.xp);
        saveGameState();

        // Transition to results
        this.time.delayedCall(1000, () => {
            this.scene.start('ResultsScene', {
                job: this.currentJob,
                depth: this.depth,
                reward: totalReward,
                bonus: comboBonus,
                combo: this.combo
            });
        });
    }
}

// ============================================
// RESULTS SCENE
// ============================================

class ResultsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultsScene' });
    }

    init(data) {
        this.results = data;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(width/2, height/2, width, height, DMI_COLORS.darkBg);

        // Confetti-like particles
        this.createCelebration();

        // Title
        this.add.text(width/2, 60, '🎉 JOB COMPLETE!', {
            fontSize: '28px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Job name
        this.add.text(width/2, 100, this.results.job.name, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#f47920'
        }).setOrigin(0.5);

        // Stats
        const statsY = 160;
        const lineHeight = 40;

        this.add.text(width/2, statsY, `Depth: ${Math.floor(this.results.depth)} ft`, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#a0aec0'
        }).setOrigin(0.5);

        if (this.results.combo > 1.5) {
            this.add.text(width/2, statsY + lineHeight, `Max Combo: x${this.results.combo.toFixed(1)}`, {
                fontSize: '20px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffd700'
            }).setOrigin(0.5);
        }

        // Reward
        this.add.text(width/2, statsY + lineHeight * 2.5, 'EARNED', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            color: '#718096'
        }).setOrigin(0.5);

        const rewardText = this.add.text(width/2, statsY + lineHeight * 3.2, `$${this.results.reward}`, {
            fontSize: '48px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#48bb78'
        }).setOrigin(0.5);

        // Animate reward
        this.tweens.add({
            targets: rewardText,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: 'Back.out'
        });

        if (this.results.bonus > 0) {
            this.add.text(width/2, statsY + lineHeight * 4.2, `(+$${this.results.bonus} combo bonus!)`, {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#ffd700'
            }).setOrigin(0.5);
        }

        // XP gain
        this.add.text(width/2, statsY + lineHeight * 5.5, `+${this.results.job.xp} XP`, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#f47920'
        }).setOrigin(0.5);

        // Level progress bar
        const barWidth = width - 80;
        const barY = statsY + lineHeight * 6.5;
        
        this.add.rectangle(width/2, barY, barWidth, 20, 0x2d3748, 1)
            .setStrokeStyle(1, 0x4a5568);
        
        const xpProgress = gameState.xp / gameState.xpToNext;
        this.add.rectangle(width/2 - barWidth/2 + (barWidth * xpProgress)/2, barY, barWidth * xpProgress, 16, DMI_COLORS.orange);

        this.add.text(width/2, barY + 20, `Level ${gameState.level} - ${gameState.xp}/${gameState.xpToNext} XP`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#a0aec0'
        }).setOrigin(0.5);

        // Buttons
        const btnY = height - 140;

        this.createButton(width/2, btnY, 'PLAY AGAIN', () => {
            soundManager.playClick();
            this.scene.start('JobSelectScene');
        });

        this.createButton(width/2, btnY + 60, 'SHOP', () => {
            soundManager.playClick();
            this.scene.start('ShopScene');
        });

        // Show promo after level 3
        if (gameState.level >= 3 && !gameState.promoShown.level3) {
            this.showPromo();
            gameState.promoShown.level3 = true;
            saveGameState();
        }
    }

    createCelebration() {
        const { width } = this.cameras.main;
        
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const color = Phaser.Utils.Array.GetRandom([DMI_COLORS.orange, DMI_COLORS.blue, DMI_COLORS.success, DMI_COLORS.gold]);
            const particle = this.add.circle(x, -20, Phaser.Math.Between(3, 8), color);
            
            this.tweens.add({
                targets: particle,
                y: this.cameras.main.height + 50,
                x: x + Phaser.Math.Between(-100, 100),
                rotation: Phaser.Math.Between(0, 10),
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 1000),
                ease: 'Sine.in'
            });
        }
    }

    createButton(x, y, text, callback) {
        const btn = this.add.image(x, y, 'button').setInteractive({ useHandCursor: true });
        this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setTexture('buttonHover'));
        btn.on('pointerout', () => btn.setTexture('button'));
        btn.on('pointerdown', callback);
    }

    showPromo() {
        // Show the promo banner
        const banner = document.getElementById('promo-banner');
        if (banner) {
            banner.classList.remove('hidden');
            
            // Hide after 10 seconds
            setTimeout(() => {
                banner.classList.add('hidden');
            }, 10000);
        }
    }
}

// ============================================
// SHOP SCENE
// ============================================

class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Background
        this.add.rectangle(width/2, height/2, width, height, DMI_COLORS.darkBg);

        // Header
        this.add.text(width/2, 40, 'EQUIPMENT SHOP', {
            fontSize: '24px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Cash display
        this.cashText = this.add.text(width/2, 75, `💰 $${formatNumber(gameState.cash)}`, {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#48bb78'
        }).setOrigin(0.5);

        // Equipment cards
        const startY = 130;
        const cardHeight = 120;
        const padding = 15;

        Object.values(EQUIPMENT).forEach((item, index) => {
            const y = startY + index * (cardHeight + padding);
            this.createEquipmentCard(width/2, y, item, cardHeight);
        });

        // DMI CTA
        const ctaY = height - 70;
        
        this.add.text(width/2, ctaY - 20, '🔥 Want the REAL thing?', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        const shopLink = this.add.text(width/2, ctaY + 10, 'Shop DMI Core Bits →', {
            fontSize: '18px',
            fontFamily: 'Arial Black, sans-serif',
            color: '#f47920'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        shopLink.on('pointerdown', () => {
            window.open('https://dmitools.com/collections/core-bits', '_blank');
        });

        // Back button
        this.createBackButton();
    }

    createEquipmentCard(x, y, item, height) {
        const { width } = this.cameras.main;
        const cardWidth = width - 40;
        
        const owned = gameState.ownedEquipment.includes(item.id);
        const equipped = gameState.equipment === item.id;
        const canAfford = gameState.cash >= item.price;
        const unlocked = gameState.level >= item.unlockLevel;
        const canBuy = !owned && canAfford && unlocked;

        // Card background
        let bgColor = equipped ? 0x2a5a9c : 0x1e293b;
        const card = this.add.rectangle(x, y, cardWidth, height, bgColor)
            .setStrokeStyle(2, equipped ? DMI_COLORS.success : (owned ? DMI_COLORS.blue : 0x4a5568));

        // Equipment icon
        const iconX = x - cardWidth/2 + 50;
        const icon = this.add.image(iconX, y, 'drillBit').setScale(0.8);
        
        if (!unlocked) {
            icon.setTint(0x333333);
        }

        // Name
        this.add.text(iconX + 50, y - height/2 + 20, item.name, {
            fontSize: '18px',
            fontFamily: 'Arial Black, sans-serif',
            color: unlocked ? '#ffffff' : '#4a5568'
        });

        // Real product name
        this.add.text(iconX + 50, y - height/2 + 42, item.realName, {
            fontSize: '11px',
            fontFamily: 'Arial, sans-serif',
            color: '#f47920'
        });

        // Stats
        const statsY = y + 10;
        this.add.text(iconX + 50, statsY, `⚡ Speed: ${(item.speed * 100).toFixed(0)}%`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#a0aec0'
        });
        
        this.add.text(iconX + 50, statsY + 18, `🛡️ Durability: ${(item.durability * 100).toFixed(0)}%`, {
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            color: '#a0aec0'
        });

        // Price / Status
        const priceX = x + cardWidth/2 - 20;
        
        if (equipped) {
            this.add.text(priceX, y - 15, '✓ EQUIPPED', {
                fontSize: '14px',
                fontFamily: 'Arial Black, sans-serif',
                color: '#48bb78'
            }).setOrigin(1, 0.5);
        } else if (owned) {
            const equipBtn = this.add.text(priceX, y - 15, 'EQUIP', {
                fontSize: '14px',
                fontFamily: 'Arial Black, sans-serif',
                color: '#f47920',
                backgroundColor: '#2d3748',
                padding: { x: 10, y: 5 }
            }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

            equipBtn.on('pointerdown', () => {
                soundManager.playClick();
                gameState.equipment = item.id;
                saveGameState();
                this.scene.restart();
            });
        } else if (!unlocked) {
            this.add.text(priceX, y - 15, `🔒 Lvl ${item.unlockLevel}`, {
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                color: '#718096'
            }).setOrigin(1, 0.5);
        } else {
            this.add.text(priceX, y - 25, `$${item.price}`, {
                fontSize: '20px',
                fontFamily: 'Arial Black, sans-serif',
                color: canAfford ? '#48bb78' : '#f56565'
            }).setOrigin(1, 0.5);

            if (canBuy) {
                const buyBtn = this.add.text(priceX, y + 10, 'BUY', {
                    fontSize: '14px',
                    fontFamily: 'Arial Black, sans-serif',
                    color: '#ffffff',
                    backgroundColor: '#f47920',
                    padding: { x: 15, y: 5 }
                }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

                buyBtn.on('pointerdown', () => {
                    soundManager.playSuccess();
                    gameState.cash -= item.price;
                    gameState.ownedEquipment.push(item.id);
                    gameState.equipment = item.id;
                    saveGameState();
                    this.scene.restart();
                });
            }
        }

        // Real price tag
        this.add.text(priceX, y + height/2 - 20, `Real: ${item.realPrice}`, {
            fontSize: '10px',
            fontFamily: 'Arial, sans-serif',
            color: '#718096'
        }).setOrigin(1, 0.5);
    }

    createBackButton() {
        const back = this.add.text(20, 35, '← Back', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#f47920'
        }).setInteractive({ useHandCursor: true });

        back.on('pointerdown', () => {
            soundManager.playClick();
            this.scene.start('MenuScene');
        });
    }
}

// ============================================
// GAME INITIALIZATION
// ============================================

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: DMI_COLORS.darkBg,
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%',
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 600,
            height: 900
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [BootScene, MenuScene, JobSelectScene, GameScene, ResultsScene, ShopScene],
    input: {
        activePointers: 1
    },
    render: {
        pixelArt: false,
        antialias: true
    }
};

// Start game when DOM ready
window.addEventListener('load', () => {
    new Phaser.Game(config);
});
