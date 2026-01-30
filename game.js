/**
 * CORE DRILLER - A DMI Tools Corp Game
 * 2D Side-Scrolling Action Platformer
 * Built with Phaser 3
 */

// Game Configuration
const GAME_CONFIG = {
    GRAVITY: 800,
    PLAYER_SPEED: 200,
    JUMP_VELOCITY: -400,
    CORE_SPEED: 600,
    ENEMY_SPEED: 80,
    COLORS: {
        DMI_ORANGE: 0xFF6B00,
        DMI_BLUE: 0x4FC3F7,
        DARK_BLUE: 0x1a1a2e,
        GROUND: 0x5D4037,
        CONCRETE: 0x9E9E9E,
        SKY: 0x87CEEB,
        VEST_ORANGE: 0xFF9800,
        HARD_HAT: 0xFFEB3B,
        SKIN: 0xFFCC99,
        ENEMY_RED: 0xE53935,
        HEALTH_RED: 0xF44336,
        HEALTH_GREEN: 0x4CAF50
    }
};

// Utility Functions
const Utils = {
    isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    
    getHighScore: () => parseInt(localStorage.getItem('coreDrillerHighScore') || '0'),
    setHighScore: (score) => localStorage.setItem('coreDrillerHighScore', score.toString()),
    
    formatScore: (score) => score.toString().padStart(6, '0')
};

// ============================================
// BOOT SCENE - Load assets, generate sprites
// ============================================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Generate all game textures
        this.generateTextures();
    }

    generateTextures() {
        // Player sprite (construction worker with drill)
        this.createPlayerTexture();
        this.createPlayerJumpTexture();
        
        // Core projectile
        this.createCoreTexture();
        this.createBigCoreTexture();
        
        // Enemies
        this.createHomeownerTexture();
        this.createForemanTexture();
        this.createHardHatEnemyTexture();
        
        // Tiles and platforms
        this.createGroundTexture();
        this.createConcreteBlockTexture();
        this.createRebarTexture();
        this.createPipeTexture();
        this.createDrillWallTexture();
        
        // Power-ups
        this.createPowerUpTextures();
        
        // UI elements
        this.createButtonTexture();
        this.createHeartTexture();
        
        // Particles
        this.createSparkTexture();
        this.createDebrisTexture();
    }

    createPlayerTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 48;
        
        // Body/Vest (orange safety vest)
        g.fillStyle(GAME_CONFIG.COLORS.VEST_ORANGE);
        g.fillRect(8, 16, 16, 20);
        
        // Reflective stripes on vest
        g.fillStyle(0xCCCCCC);
        g.fillRect(8, 20, 16, 2);
        g.fillRect(8, 28, 16, 2);
        
        // Head
        g.fillStyle(GAME_CONFIG.COLORS.SKIN);
        g.fillRect(10, 6, 12, 12);
        
        // Hard hat (yellow)
        g.fillStyle(GAME_CONFIG.COLORS.HARD_HAT);
        g.fillRect(8, 2, 16, 8);
        g.fillRect(6, 8, 20, 3);
        
        // Eyes
        g.fillStyle(0x000000);
        g.fillRect(12, 10, 2, 2);
        g.fillRect(18, 10, 2, 2);
        
        // Legs (jeans)
        g.fillStyle(0x1565C0);
        g.fillRect(10, 36, 5, 12);
        g.fillRect(17, 36, 5, 12);
        
        // Boots
        g.fillStyle(0x5D4037);
        g.fillRect(9, 44, 6, 4);
        g.fillRect(17, 44, 6, 4);
        
        // Arms
        g.fillStyle(GAME_CONFIG.COLORS.VEST_ORANGE);
        g.fillRect(4, 18, 4, 10);
        g.fillRect(24, 18, 4, 10);
        
        // Hands
        g.fillStyle(GAME_CONFIG.COLORS.SKIN);
        g.fillRect(4, 26, 4, 4);
        g.fillRect(24, 26, 4, 4);
        
        // DRILL (held in front)
        // Motor housing (dark gray)
        g.fillStyle(0x424242);
        g.fillRect(26, 22, 14, 10);
        
        // Handle
        g.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        g.fillRect(24, 20, 4, 14);
        
        // Diamond drill bit (silver/blue)
        g.fillStyle(0xB0BEC5);
        g.fillRect(40, 24, 8, 6);
        g.fillStyle(GAME_CONFIG.COLORS.DMI_BLUE);
        g.fillRect(48, 25, 4, 4);
        
        g.generateTexture('player', 52, h);
        g.destroy();
    }

    createPlayerJumpTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 48;
        
        // Same as player but with legs bent
        g.fillStyle(GAME_CONFIG.COLORS.VEST_ORANGE);
        g.fillRect(8, 16, 16, 20);
        
        g.fillStyle(0xCCCCCC);
        g.fillRect(8, 20, 16, 2);
        g.fillRect(8, 28, 16, 2);
        
        g.fillStyle(GAME_CONFIG.COLORS.SKIN);
        g.fillRect(10, 6, 12, 12);
        
        g.fillStyle(GAME_CONFIG.COLORS.HARD_HAT);
        g.fillRect(8, 2, 16, 8);
        g.fillRect(6, 8, 20, 3);
        
        g.fillStyle(0x000000);
        g.fillRect(12, 10, 2, 2);
        g.fillRect(18, 10, 2, 2);
        
        // Bent legs
        g.fillStyle(0x1565C0);
        g.fillRect(8, 36, 6, 6);
        g.fillRect(18, 36, 6, 6);
        g.fillRect(6, 40, 6, 4);
        g.fillRect(20, 40, 6, 4);
        
        g.fillStyle(0x5D4037);
        g.fillRect(4, 42, 6, 4);
        g.fillRect(22, 42, 6, 4);
        
        g.fillStyle(GAME_CONFIG.COLORS.VEST_ORANGE);
        g.fillRect(4, 18, 4, 10);
        g.fillRect(24, 18, 4, 10);
        
        g.fillStyle(GAME_CONFIG.COLORS.SKIN);
        g.fillRect(4, 26, 4, 4);
        g.fillRect(24, 26, 4, 4);
        
        g.fillStyle(0x424242);
        g.fillRect(26, 22, 14, 10);
        
        g.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        g.fillRect(24, 20, 4, 14);
        
        g.fillStyle(0xB0BEC5);
        g.fillRect(40, 24, 8, 6);
        g.fillStyle(GAME_CONFIG.COLORS.DMI_BLUE);
        g.fillRect(48, 25, 4, 4);
        
        g.generateTexture('player_jump', 52, h);
        g.destroy();
    }

    createCoreTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Cylindrical core sample (wall slug)
        g.fillStyle(0x9E9E9E);
        g.fillCircle(8, 8, 6);
        g.fillRect(2, 4, 12, 8);
        g.fillCircle(14, 8, 4);
        
        // Concrete texture
        g.fillStyle(0x757575);
        g.fillRect(4, 6, 2, 2);
        g.fillRect(8, 9, 2, 2);
        g.fillRect(12, 5, 2, 2);
        
        g.generateTexture('core', 18, 16);
        g.destroy();
    }

    createBigCoreTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Bigger core with DMI orange glow
        g.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        g.fillCircle(12, 12, 10);
        g.fillRect(2, 4, 20, 16);
        g.fillCircle(22, 12, 8);
        
        g.fillStyle(0x9E9E9E);
        g.fillCircle(12, 12, 8);
        g.fillRect(4, 6, 16, 12);
        g.fillCircle(20, 12, 6);
        
        g.generateTexture('big_core', 28, 24);
        g.destroy();
    }

    createHomeownerTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Angry homeowner (red face, casual clothes)
        // Head
        g.fillStyle(0xFFCCCC);
        g.fillRect(10, 4, 12, 12);
        
        // Angry hair
        g.fillStyle(0x5D4037);
        g.fillRect(8, 2, 16, 4);
        
        // Angry eyebrows
        g.fillStyle(0x000000);
        g.fillRect(11, 8, 4, 2);
        g.fillRect(17, 8, 4, 2);
        
        // Eyes
        g.fillRect(12, 10, 2, 2);
        g.fillRect(18, 10, 2, 2);
        
        // Angry mouth
        g.fillStyle(GAME_CONFIG.COLORS.ENEMY_RED);
        g.fillRect(13, 13, 6, 2);
        
        // Body (polo shirt)
        g.fillStyle(0x2196F3);
        g.fillRect(8, 16, 16, 18);
        
        // Khaki pants
        g.fillStyle(0xD7CCC8);
        g.fillRect(9, 34, 6, 10);
        g.fillRect(17, 34, 6, 10);
        
        // Shoes
        g.fillStyle(0x795548);
        g.fillRect(8, 42, 7, 4);
        g.fillRect(17, 42, 7, 4);
        
        // Raised fist
        g.fillStyle(0xFFCCCC);
        g.fillRect(24, 14, 6, 6);
        
        g.generateTexture('homeowner', 32, 48);
        g.destroy();
    }

    createForemanTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Big angry foreman (white hard hat, clipboard)
        // Head
        g.fillStyle(GAME_CONFIG.COLORS.SKIN);
        g.fillRect(12, 8, 16, 14);
        
        // White hard hat
        g.fillStyle(0xFFFFFF);
        g.fillRect(10, 2, 20, 10);
        g.fillRect(8, 10, 24, 3);
        
        // Angry face
        g.fillStyle(0x000000);
        g.fillRect(14, 14, 3, 2);
        g.fillRect(23, 14, 3, 2);
        g.fillStyle(GAME_CONFIG.COLORS.ENEMY_RED);
        g.fillRect(16, 18, 8, 3);
        
        // Big body (orange vest like player but bigger)
        g.fillStyle(GAME_CONFIG.COLORS.VEST_ORANGE);
        g.fillRect(8, 22, 24, 24);
        
        // Stripes
        g.fillStyle(0xCCCCCC);
        g.fillRect(8, 28, 24, 3);
        g.fillRect(8, 38, 24, 3);
        
        // Legs
        g.fillStyle(0x1565C0);
        g.fillRect(10, 46, 8, 12);
        g.fillRect(22, 46, 8, 12);
        
        // Boots
        g.fillStyle(0x5D4037);
        g.fillRect(8, 54, 10, 6);
        g.fillRect(22, 54, 10, 6);
        
        // Clipboard
        g.fillStyle(0x8D6E63);
        g.fillRect(32, 28, 10, 14);
        g.fillStyle(0xFFFFFF);
        g.fillRect(33, 30, 8, 10);
        
        g.generateTexture('foreman', 44, 60);
        g.destroy();
    }

    createHardHatEnemyTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Flying hard hat with angry face
        g.fillStyle(GAME_CONFIG.COLORS.HARD_HAT);
        g.fillRect(4, 4, 24, 12);
        g.fillRect(2, 14, 28, 4);
        
        // Red angry visor
        g.fillStyle(GAME_CONFIG.COLORS.ENEMY_RED);
        g.fillRect(6, 16, 20, 4);
        
        // Eyes on visor
        g.fillStyle(0xFFFFFF);
        g.fillRect(8, 17, 4, 2);
        g.fillRect(20, 17, 4, 2);
        
        // Pupils
        g.fillStyle(0x000000);
        g.fillRect(10, 17, 2, 2);
        g.fillRect(22, 17, 2, 2);
        
        g.generateTexture('hardhat_enemy', 32, 24);
        g.destroy();
    }

    createGroundTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Dirt/ground tile
        g.fillStyle(GAME_CONFIG.COLORS.GROUND);
        g.fillRect(0, 0, 32, 32);
        
        // Texture details
        g.fillStyle(0x4E342E);
        g.fillRect(4, 8, 3, 3);
        g.fillRect(20, 4, 4, 4);
        g.fillRect(12, 20, 5, 3);
        g.fillRect(26, 24, 3, 3);
        
        // Top grass/edge
        g.fillStyle(0x7CB342);
        g.fillRect(0, 0, 32, 4);
        
        g.generateTexture('ground', 32, 32);
        g.destroy();
    }

    createConcreteBlockTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        g.fillStyle(GAME_CONFIG.COLORS.CONCRETE);
        g.fillRect(0, 0, 32, 32);
        
        // Cracks and texture
        g.fillStyle(0x757575);
        g.fillRect(2, 2, 28, 2);
        g.fillRect(2, 28, 28, 2);
        g.fillRect(2, 2, 2, 28);
        g.fillRect(28, 2, 2, 28);
        
        g.fillStyle(0x616161);
        g.fillRect(8, 12, 6, 1);
        g.fillRect(20, 8, 1, 8);
        g.fillRect(5, 22, 8, 1);
        
        g.generateTexture('concrete', 32, 32);
        g.destroy();
    }

    createRebarTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Rusty rebar sticking up
        g.fillStyle(0x8D6E63);
        g.fillRect(12, 0, 8, 32);
        
        // Rust texture
        g.fillStyle(0xA1887F);
        g.fillRect(14, 4, 4, 4);
        g.fillRect(13, 16, 6, 3);
        g.fillRect(15, 26, 3, 4);
        
        // Ridges
        g.fillStyle(0x6D4C41);
        for (let i = 2; i < 30; i += 6) {
            g.fillRect(10, i, 2, 2);
            g.fillRect(20, i, 2, 2);
        }
        
        g.generateTexture('rebar', 32, 32);
        g.destroy();
    }

    createPipeTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // PVC pipe
        g.fillStyle(0xB0BEC5);
        g.fillRect(0, 8, 32, 16);
        
        // Highlights
        g.fillStyle(0xCFD8DC);
        g.fillRect(0, 10, 32, 4);
        
        // Shadow
        g.fillStyle(0x90A4AE);
        g.fillRect(0, 20, 32, 4);
        
        g.generateTexture('pipe', 32, 32);
        g.destroy();
    }

    createDrillWallTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Wall segment that can be drilled
        g.fillStyle(0x8D6E63);
        g.fillRect(0, 0, 48, 96);
        
        // Brick pattern
        g.fillStyle(0x795548);
        for (let y = 0; y < 96; y += 16) {
            const offset = (y % 32 === 0) ? 0 : 12;
            for (let x = offset; x < 48; x += 24) {
                g.fillRect(x, y, 22, 14);
            }
        }
        
        // Drill target marker
        g.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        g.fillCircle(24, 48, 16);
        g.fillStyle(0xFFFFFF);
        g.fillCircle(24, 48, 10);
        g.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        g.fillCircle(24, 48, 4);
        
        g.generateTexture('drill_wall', 48, 96);
        g.destroy();
    }

    createPowerUpTextures() {
        // Speed boost (faster drill)
        let g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(GAME_CONFIG.COLORS.DMI_BLUE);
        g.fillCircle(16, 16, 14);
        g.fillStyle(0xFFFFFF);
        g.fillTriangle(10, 8, 10, 24, 24, 16);
        g.generateTexture('powerup_speed', 32, 32);
        g.destroy();
        
        // Big cores
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        g.fillCircle(16, 16, 14);
        g.fillStyle(0xFFFFFF);
        g.fillCircle(16, 16, 8);
        g.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        g.fillCircle(16, 16, 4);
        g.generateTexture('powerup_bigcore', 32, 32);
        g.destroy();
        
        // Shield (safety glasses)
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x4CAF50);
        g.fillCircle(16, 16, 14);
        g.fillStyle(0x212121);
        g.fillRect(4, 12, 10, 8);
        g.fillRect(18, 12, 10, 8);
        g.fillRect(14, 14, 4, 4);
        g.fillStyle(0x81D4FA);
        g.fillRect(6, 14, 6, 4);
        g.fillRect(20, 14, 6, 4);
        g.generateTexture('powerup_shield', 32, 32);
        g.destroy();
        
        // Health (first aid)
        g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xF44336);
        g.fillCircle(16, 16, 14);
        g.fillStyle(0xFFFFFF);
        g.fillRect(12, 6, 8, 20);
        g.fillRect(6, 12, 20, 8);
        g.generateTexture('powerup_health', 32, 32);
        g.destroy();
    }

    createButtonTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        g.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        g.fillRoundedRect(0, 0, 200, 60, 10);
        
        g.fillStyle(0xFFFFFF, 0.3);
        g.fillRoundedRect(4, 4, 192, 26, 8);
        
        g.generateTexture('button', 200, 60);
        g.destroy();
    }

    createHeartTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        g.fillStyle(GAME_CONFIG.COLORS.HEALTH_RED);
        g.fillCircle(8, 8, 8);
        g.fillCircle(24, 8, 8);
        g.fillTriangle(0, 10, 32, 10, 16, 28);
        
        g.generateTexture('heart', 32, 32);
        g.destroy();
    }

    createSparkTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        g.fillCircle(4, 4, 4);
        g.generateTexture('spark', 8, 8);
        g.destroy();
    }

    createDebrisTexture() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(GAME_CONFIG.COLORS.CONCRETE);
        g.fillRect(0, 0, 6, 6);
        g.generateTexture('debris', 6, 6);
        g.destroy();
    }

    create() {
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => loadingScreen.remove(), 500);
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
        this.cameras.main.setBackgroundColor(GAME_CONFIG.COLORS.DARK_BLUE);
        
        // Animated background particles
        this.createBackgroundParticles();
        
        // Title
        this.add.text(width / 2, height * 0.2, 'CORE DRILLER', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '24px' : '48px',
            color: '#FF6B00',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width / 2, height * 0.3, 'A DMI Tools Corp Game', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '8px' : '14px',
            color: '#4FC3F7'
        }).setOrigin(0.5);
        
        // Animated player preview
        this.playerPreview = this.add.sprite(width / 2, height * 0.5, 'player');
        this.playerPreview.setScale(3);
        this.tweens.add({
            targets: this.playerPreview,
            y: height * 0.5 - 10,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Start button
        const startBtn = this.createButton(width / 2, height * 0.7, 'START GAME', () => {
            this.sound.play('click', { volume: 0.3 });
            this.cameras.main.fadeOut(300);
            this.time.delayedCall(300, () => {
                this.scene.start('GameScene', { level: 1 });
            });
        });
        
        // High score
        this.add.text(width / 2, height * 0.85, `HIGH SCORE: ${Utils.formatScore(Utils.getHighScore())}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '10px' : '16px',
            color: '#FFD54F'
        }).setOrigin(0.5);
        
        // Controls hint
        const controlsText = Utils.isMobile() 
            ? 'TAP LEFT/RIGHT TO MOVE\nTAP JUMP TO JUMP • TAP SCREEN TO SHOOT'
            : 'ARROWS/WASD TO MOVE • SPACE TO JUMP • CLICK TO SHOOT';
        
        this.add.text(width / 2, height * 0.93, controlsText, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '6px' : '10px',
            color: '#888',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create sounds
        this.createSounds();
        
        this.cameras.main.fadeIn(300);
    }

    createBackgroundParticles() {
        // Simple floating particles
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const particle = this.add.circle(x, y, 2, GAME_CONFIG.COLORS.DMI_ORANGE, 0.3);
            
            this.tweens.add({
                targets: particle,
                y: y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, this.cameras.main.width);
                    particle.y = this.cameras.main.height + 10;
                    particle.alpha = 0.3;
                }
            });
        }
    }

    createButton(x, y, text, callback) {
        const btn = this.add.image(x, y, 'button').setInteractive();
        const label = this.add.text(x, y, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '12px' : '16px',
            color: '#FFF'
        }).setOrigin(0.5);
        
        btn.on('pointerover', () => {
            btn.setTint(0xFFFFFF);
            btn.setScale(1.05);
            label.setScale(1.05);
        });
        
        btn.on('pointerout', () => {
            btn.clearTint();
            btn.setScale(1);
            label.setScale(1);
        });
        
        btn.on('pointerdown', callback);
        
        return { btn, label };
    }

    createSounds() {
        // Generate simple sound effects using Web Audio
        const audioContext = this.sound.context;
        
        // Click sound
        this.createToneSound('click', 800, 0.1);
        
        // Jump sound
        this.createToneSound('jump', 400, 0.15, 'square', 600);
        
        // Shoot sound
        this.createToneSound('shoot', 200, 0.1, 'sawtooth');
        
        // Hit sound
        this.createToneSound('hit', 150, 0.2, 'square');
        
        // Powerup sound
        this.createToneSound('powerup', 600, 0.3, 'sine', 900);
        
        // Drill sound
        this.createToneSound('drill', 100, 0.5, 'sawtooth', 150);
        
        // Death sound
        this.createToneSound('death', 400, 0.4, 'square', 100);
        
        // Level complete
        this.createToneSound('levelup', 523, 0.5, 'sine', 783);
    }

    createToneSound(key, freq, duration, type = 'sine', freqEnd = null) {
        const sampleRate = 44100;
        const samples = sampleRate * duration;
        const buffer = this.sound.context.createBuffer(1, samples, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const currentFreq = freqEnd ? freq + (freqEnd - freq) * (i / samples) : freq;
            let sample;
            
            switch (type) {
                case 'square':
                    sample = Math.sin(2 * Math.PI * currentFreq * t) > 0 ? 0.3 : -0.3;
                    break;
                case 'sawtooth':
                    sample = 0.3 * (2 * (currentFreq * t % 1) - 1);
                    break;
                default:
                    sample = 0.3 * Math.sin(2 * Math.PI * currentFreq * t);
            }
            
            // Envelope
            const envelope = 1 - (i / samples);
            data[i] = sample * envelope;
        }
        
        this.cache.audio.add(key, buffer);
    }
}

// ============================================
// GAME SCENE - Main gameplay
// ============================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.score = data.score || 0;
        this.lives = data.lives || 3;
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Physics world bounds (will be set by level)
        this.physics.world.setBounds(0, 0, 3200, height);
        
        // Create level
        this.createLevel();
        
        // Create player
        this.createPlayer();
        
        // Create enemies
        this.enemies = this.physics.add.group();
        this.spawnEnemies();
        
        // Create projectiles
        this.cores = this.physics.add.group();
        this.enemyProjectiles = this.physics.add.group();
        
        // Create power-ups
        this.powerups = this.physics.add.group();
        this.spawnPowerUps();
        
        // Setup collisions
        this.setupCollisions();
        
        // Create UI
        this.createUI();
        
        // Create controls
        this.createControls();
        
        // Camera setup
        this.cameras.main.setBounds(0, 0, this.levelWidth, height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        
        // Game state
        this.isPaused = false;
        this.isDrilling = false;
        this.isInvincible = false;
        this.hasShield = false;
        this.hasBigCores = false;
        this.fireRate = 300;
        this.lastFired = 0;
        
        // Level complete zone
        this.createLevelEndZone();
        
        this.cameras.main.fadeIn(300);
    }

    createLevel() {
        const { height } = this.cameras.main;
        
        // Level configurations
        const levels = {
            1: { width: 3200, name: 'Construction Site', enemies: 8, speed: 1 },
            2: { width: 4000, name: 'The Basement', enemies: 12, speed: 1.2 },
            3: { width: 4800, name: 'Boss Site', enemies: 15, speed: 1.4 }
        };
        
        const levelConfig = levels[this.currentLevel] || levels[1];
        this.levelWidth = levelConfig.width;
        this.levelName = levelConfig.name;
        this.enemyCount = levelConfig.enemies;
        this.difficultyMultiplier = levelConfig.speed;
        
        // Sky gradient background
        this.createSkyBackground();
        
        // Platforms group
        this.platforms = this.physics.add.staticGroup();
        
        // Ground
        for (let x = 0; x < this.levelWidth; x += 32) {
            this.platforms.create(x + 16, height - 16, 'ground');
        }
        
        // Create varied platforms based on level
        this.createPlatforms();
        
        // Obstacles (hazards)
        this.obstacles = this.physics.add.staticGroup();
        this.createObstacles();
        
        // Drill walls
        this.drillWalls = this.physics.add.staticGroup();
        this.createDrillWalls();
    }

    createSkyBackground() {
        const { width, height } = this.cameras.main;
        
        // Create parallax background layers
        const bgGraphics = this.add.graphics();
        
        // Sky gradient
        bgGraphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xE1F5FE, 0xE1F5FE);
        bgGraphics.fillRect(0, 0, this.levelWidth, height);
        
        // Background buildings/construction site
        bgGraphics.fillStyle(0x78909C);
        for (let x = 0; x < this.levelWidth; x += 200) {
            const buildingHeight = Phaser.Math.Between(100, 250);
            bgGraphics.fillRect(x, height - 32 - buildingHeight, 80, buildingHeight);
            
            // Windows
            bgGraphics.fillStyle(0xFFEB3B, 0.3);
            for (let wy = height - 32 - buildingHeight + 20; wy < height - 60; wy += 30) {
                for (let wx = x + 10; wx < x + 70; wx += 20) {
                    if (Math.random() > 0.3) {
                        bgGraphics.fillRect(wx, wy, 10, 15);
                    }
                }
            }
            bgGraphics.fillStyle(0x78909C);
        }
        
        // Cranes in background
        bgGraphics.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        for (let x = 300; x < this.levelWidth; x += 600) {
            bgGraphics.fillRect(x, height - 300, 8, 280);
            bgGraphics.fillRect(x - 50, height - 300, 150, 8);
        }
        
        bgGraphics.setScrollFactor(0.5); // Parallax effect
    }

    createPlatforms() {
        const { height } = this.cameras.main;
        
        // Platform patterns for each level
        const platformSets = [
            // Level 1 - Easy introduction
            [
                { x: 300, y: height - 100, type: 'concrete', count: 3 },
                { x: 500, y: height - 180, type: 'concrete', count: 2 },
                { x: 800, y: height - 120, type: 'concrete', count: 4 },
                { x: 1100, y: height - 200, type: 'concrete', count: 3 },
                { x: 1400, y: height - 100, type: 'concrete', count: 2 },
                { x: 1700, y: height - 160, type: 'concrete', count: 5 },
                { x: 2000, y: height - 80, type: 'concrete', count: 3 },
                { x: 2300, y: height - 180, type: 'concrete', count: 4 },
                { x: 2600, y: height - 120, type: 'concrete', count: 3 },
                { x: 2900, y: height - 200, type: 'concrete', count: 2 }
            ],
            // Level 2 - More challenging
            [
                { x: 250, y: height - 120, type: 'concrete', count: 2 },
                { x: 400, y: height - 220, type: 'concrete', count: 2 },
                { x: 600, y: height - 160, type: 'concrete', count: 3 },
                { x: 850, y: height - 280, type: 'concrete', count: 2 },
                { x: 1050, y: height - 180, type: 'concrete', count: 2 },
                { x: 1300, y: height - 100, type: 'concrete', count: 4 },
                { x: 1550, y: height - 240, type: 'concrete', count: 3 },
                { x: 1800, y: height - 160, type: 'concrete', count: 2 },
                { x: 2100, y: height - 300, type: 'concrete', count: 2 },
                { x: 2350, y: height - 200, type: 'concrete', count: 3 },
                { x: 2650, y: height - 120, type: 'concrete', count: 2 },
                { x: 2900, y: height - 240, type: 'concrete', count: 4 },
                { x: 3200, y: height - 180, type: 'concrete', count: 3 },
                { x: 3500, y: height - 280, type: 'concrete', count: 2 }
            ],
            // Level 3 - Boss level
            [
                { x: 200, y: height - 100, type: 'concrete', count: 3 },
                { x: 450, y: height - 200, type: 'concrete', count: 2 },
                { x: 700, y: height - 300, type: 'concrete', count: 2 },
                { x: 950, y: height - 180, type: 'concrete', count: 3 },
                { x: 1200, y: height - 260, type: 'concrete', count: 2 },
                { x: 1500, y: height - 140, type: 'concrete', count: 4 },
                { x: 1800, y: height - 320, type: 'concrete', count: 2 },
                { x: 2100, y: height - 200, type: 'concrete', count: 3 },
                { x: 2400, y: height - 280, type: 'concrete', count: 2 },
                { x: 2700, y: height - 160, type: 'concrete', count: 4 },
                { x: 3000, y: height - 240, type: 'concrete', count: 3 },
                { x: 3300, y: height - 180, type: 'concrete', count: 2 },
                { x: 3600, y: height - 300, type: 'concrete', count: 3 },
                { x: 3900, y: height - 220, type: 'concrete', count: 2 },
                { x: 4200, y: height - 160, type: 'concrete', count: 4 }
            ]
        ];
        
        const platforms = platformSets[this.currentLevel - 1] || platformSets[0];
        
        platforms.forEach(p => {
            for (let i = 0; i < p.count; i++) {
                this.platforms.create(p.x + i * 32, p.y, p.type);
            }
        });
    }

    createObstacles() {
        const { height } = this.cameras.main;
        
        // Rebar and pipe obstacles
        const obstaclePositions = [
            { x: 600, type: 'rebar' },
            { x: 1200, type: 'pipe' },
            { x: 1800, type: 'rebar' },
            { x: 2400, type: 'pipe' }
        ];
        
        // Add more obstacles for higher levels
        if (this.currentLevel >= 2) {
            obstaclePositions.push(
                { x: 900, type: 'rebar' },
                { x: 2100, type: 'pipe' },
                { x: 3000, type: 'rebar' }
            );
        }
        
        if (this.currentLevel >= 3) {
            obstaclePositions.push(
                { x: 750, type: 'pipe' },
                { x: 1500, type: 'rebar' },
                { x: 3500, type: 'pipe' },
                { x: 4000, type: 'rebar' }
            );
        }
        
        obstaclePositions.forEach(obs => {
            const obstacle = this.obstacles.create(obs.x, height - 48, obs.type);
            obstacle.setSize(16, 32);
            obstacle.setOffset(8, 0);
        });
    }

    createDrillWalls() {
        const { height } = this.cameras.main;
        
        // Walls that must be drilled through
        const wallPositions = [
            { x: 1000 },
            { x: 2200 }
        ];
        
        if (this.currentLevel >= 2) {
            wallPositions.push({ x: 1600 }, { x: 3200 });
        }
        
        if (this.currentLevel >= 3) {
            wallPositions.push({ x: 2800 }, { x: 4000 });
        }
        
        wallPositions.forEach(wall => {
            const drillWall = this.drillWalls.create(wall.x, height - 80, 'drill_wall');
            drillWall.drillProgress = 0;
            drillWall.isDrilled = false;
        });
    }

    createPlayer() {
        const { height } = this.cameras.main;
        
        this.player = this.physics.add.sprite(100, height - 100, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(32, 48);
        this.player.setOffset(10, 0);
        this.player.facingRight = true;
    }

    spawnEnemies() {
        const { height } = this.cameras.main;
        
        const enemyTypes = ['homeowner', 'foreman', 'hardhat_enemy'];
        
        for (let i = 0; i < this.enemyCount; i++) {
            const x = Phaser.Math.Between(400, this.levelWidth - 200);
            const type = enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)];
            
            let y = height - 80;
            if (type === 'hardhat_enemy') {
                y = Phaser.Math.Between(height - 200, height - 100);
            }
            
            const enemy = this.enemies.create(x, y, type);
            enemy.setBounce(0);
            enemy.setCollideWorldBounds(true);
            enemy.enemyType = type;
            enemy.direction = Math.random() > 0.5 ? 1 : -1;
            enemy.patrolStart = x - 100;
            enemy.patrolEnd = x + 100;
            enemy.health = type === 'foreman' ? 3 : 1;
            enemy.lastShot = 0;
            
            if (type === 'hardhat_enemy') {
                enemy.setGravityY(-GAME_CONFIG.GRAVITY); // Float
            }
            
            if (type === 'foreman') {
                enemy.setScale(0.9);
            }
        }
    }

    spawnPowerUps() {
        const { height } = this.cameras.main;
        
        const powerUpTypes = ['powerup_speed', 'powerup_bigcore', 'powerup_shield', 'powerup_health'];
        
        // Spawn 4-6 power-ups per level
        const count = 4 + this.currentLevel;
        
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(300, this.levelWidth - 200);
            const y = Phaser.Math.Between(height - 250, height - 100);
            const type = powerUpTypes[Phaser.Math.Between(0, powerUpTypes.length - 1)];
            
            const powerup = this.powerups.create(x, y, type);
            powerup.powerupType = type;
            powerup.setBounce(0.5);
            powerup.setCollideWorldBounds(true);
            
            // Floating animation
            this.tweens.add({
                targets: powerup,
                y: y - 10,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
        }
    }

    setupCollisions() {
        // Player vs platforms
        this.physics.add.collider(this.player, this.platforms);
        
        // Player vs obstacles (damage)
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
        
        // Player vs drill walls
        this.physics.add.overlap(this.player, this.drillWalls, this.checkDrillWall, null, this);
        
        // Enemies vs platforms
        this.physics.add.collider(this.enemies, this.platforms);
        
        // Cores vs enemies
        this.physics.add.overlap(this.cores, this.enemies, this.coreHitEnemy, null, this);
        
        // Cores vs platforms (destroy)
        this.physics.add.collider(this.cores, this.platforms, (core) => {
            this.createDebrisEffect(core.x, core.y);
            core.destroy();
        });
        
        // Player vs enemies
        this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);
        
        // Player vs enemy projectiles
        this.physics.add.overlap(this.player, this.enemyProjectiles, this.playerHitProjectile, null, this);
        
        // Player vs power-ups
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerUp, null, this);
        
        // Power-ups vs platforms
        this.physics.add.collider(this.powerups, this.platforms);
    }

    createUI() {
        const { width } = this.cameras.main;
        
        // UI container (fixed to camera)
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setScrollFactor(0);
        this.uiContainer.setDepth(100);
        
        // Score
        this.scoreText = this.add.text(16, 16, `SCORE: ${Utils.formatScore(this.score)}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#FFF',
            stroke: '#000',
            strokeThickness: 2
        });
        this.uiContainer.add(this.scoreText);
        
        // Level
        this.levelText = this.add.text(16, 40, `LEVEL ${this.currentLevel}: ${this.levelName}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#4FC3F7',
            stroke: '#000',
            strokeThickness: 2
        });
        this.uiContainer.add(this.levelText);
        
        // Lives (hearts)
        this.heartsContainer = this.add.container(width - 120, 16);
        this.updateHearts();
        this.uiContainer.add(this.heartsContainer);
        
        // Power-up indicators
        this.powerUpIndicator = this.add.text(width - 16, 50, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#FFD54F',
            stroke: '#000',
            strokeThickness: 2,
            align: 'right'
        }).setOrigin(1, 0);
        this.uiContainer.add(this.powerUpIndicator);
        
        // Pause button
        this.pauseBtn = this.add.text(width - 16, 16, '❚❚', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#FFF'
        }).setOrigin(1, 0).setInteractive();
        
        this.pauseBtn.on('pointerdown', () => this.togglePause());
        this.uiContainer.add(this.pauseBtn);
        
        // Mobile controls
        if (Utils.isMobile()) {
            this.createMobileControls();
        }
    }

    updateHearts() {
        this.heartsContainer.removeAll(true);
        
        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.image(i * 30, 0, 'heart').setScale(0.8);
            this.heartsContainer.add(heart);
        }
    }

    createMobileControls() {
        const { width, height } = this.cameras.main;
        
        // Left button
        this.leftBtn = this.add.circle(70, height - 70, 40, GAME_CONFIG.COLORS.DMI_ORANGE, 0.5)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(100);
        this.add.text(70, height - 70, '◀', { fontSize: '24px', color: '#FFF' })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);
        
        // Right button
        this.rightBtn = this.add.circle(170, height - 70, 40, GAME_CONFIG.COLORS.DMI_ORANGE, 0.5)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(100);
        this.add.text(170, height - 70, '▶', { fontSize: '24px', color: '#FFF' })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);
        
        // Jump button
        this.jumpBtn = this.add.circle(width - 70, height - 70, 50, GAME_CONFIG.COLORS.DMI_BLUE, 0.5)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(100);
        this.add.text(width - 70, height - 70, 'JUMP', { fontSize: '12px', color: '#FFF', fontFamily: '"Press Start 2P"' })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(101);
        
        // Touch state
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;
        
        this.leftBtn.on('pointerdown', () => this.touchLeft = true);
        this.leftBtn.on('pointerup', () => this.touchLeft = false);
        this.leftBtn.on('pointerout', () => this.touchLeft = false);
        
        this.rightBtn.on('pointerdown', () => this.touchRight = true);
        this.rightBtn.on('pointerup', () => this.touchRight = false);
        this.rightBtn.on('pointerout', () => this.touchRight = false);
        
        this.jumpBtn.on('pointerdown', () => {
            this.touchJump = true;
            this.tryJump();
        });
        this.jumpBtn.on('pointerup', () => this.touchJump = false);
        this.jumpBtn.on('pointerout', () => this.touchJump = false);
        
        // Tap anywhere else to shoot
        this.input.on('pointerdown', (pointer) => {
            // Don't shoot if tapping UI buttons
            if (pointer.x < 220 || pointer.x > width - 120) return;
            if (pointer.y > height - 140) return;
            this.tryShoot();
        });
    }

    createControls() {
        // Keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Mouse/touch shooting for desktop
        if (!Utils.isMobile()) {
            this.input.on('pointerdown', () => this.tryShoot());
        }
        
        // Pause on ESC
        this.escKey.on('down', () => this.togglePause());
    }

    tryJump() {
        if (this.player.body.touching.down || this.player.body.blocked.down) {
            this.player.setVelocityY(GAME_CONFIG.JUMP_VELOCITY);
            this.sound.play('jump', { volume: 0.3 });
        }
    }

    tryShoot() {
        if (this.isPaused || this.isDrilling) return;
        
        const now = this.time.now;
        if (now - this.lastFired < this.fireRate) return;
        
        this.lastFired = now;
        
        const coreType = this.hasBigCores ? 'big_core' : 'core';
        const core = this.cores.create(
            this.player.x + (this.player.facingRight ? 30 : -30),
            this.player.y,
            coreType
        );
        
        core.setVelocityX(this.player.facingRight ? GAME_CONFIG.CORE_SPEED : -GAME_CONFIG.CORE_SPEED);
        core.damage = this.hasBigCores ? 2 : 1;
        core.body.setAllowGravity(false);
        
        // Auto-destroy after 2 seconds
        this.time.delayedCall(2000, () => {
            if (core.active) core.destroy();
        });
        
        this.sound.play('shoot', { volume: 0.2 });
        
        // Muzzle flash
        this.createSparkEffect(this.player.x + (this.player.facingRight ? 40 : -40), this.player.y);
    }

    createSparkEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            const spark = this.add.image(x, y, 'spark');
            spark.setTint(GAME_CONFIG.COLORS.DMI_ORANGE);
            
            this.tweens.add({
                targets: spark,
                x: x + Phaser.Math.Between(-30, 30),
                y: y + Phaser.Math.Between(-20, 20),
                alpha: 0,
                scale: 0,
                duration: 200,
                onComplete: () => spark.destroy()
            });
        }
    }

    createDebrisEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            const debris = this.add.image(x, y, 'debris');
            
            this.tweens.add({
                targets: debris,
                x: x + Phaser.Math.Between(-50, 50),
                y: y + Phaser.Math.Between(-30, 50),
                alpha: 0,
                rotation: Math.PI * 2,
                duration: 500,
                onComplete: () => debris.destroy()
            });
        }
    }

    hitObstacle(player, obstacle) {
        if (this.isInvincible || this.hasShield) {
            if (this.hasShield) {
                this.hasShield = false;
                this.updatePowerUpIndicator();
            }
            return;
        }
        
        this.takeDamage();
    }

    checkDrillWall(player, wall) {
        if (wall.isDrilled) return;
        
        // Check if player is holding against the wall
        const playerRight = player.facingRight && player.body.velocity.x > 0;
        const playerLeft = !player.facingRight && player.body.velocity.x < 0;
        
        if (playerRight || playerLeft) {
            if (!this.isDrilling) {
                this.startDrilling(wall);
            }
        }
    }

    startDrilling(wall) {
        this.isDrilling = true;
        this.currentDrillWall = wall;
        
        // Show drilling UI
        this.drillProgressBar = this.add.graphics();
        this.drillProgressBar.setScrollFactor(0);
        this.drillProgressBar.setDepth(100);
        
        this.drillText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 40,
            'DRILLING...',
            {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '16px',
                color: '#FF6B00',
                stroke: '#000',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        
        this.sound.play('drill', { volume: 0.3, loop: true });
    }

    updateDrilling(delta) {
        if (!this.isDrilling) return;
        
        const drillSpeed = 50 * (this.fireRate < 300 ? 1.5 : 1); // Faster with speed powerup
        this.currentDrillWall.drillProgress += drillSpeed * delta / 1000;
        
        // Update progress bar
        const progress = Math.min(this.currentDrillWall.drillProgress / 100, 1);
        const { width, height } = this.cameras.main;
        
        this.drillProgressBar.clear();
        this.drillProgressBar.fillStyle(0x333333);
        this.drillProgressBar.fillRect(width / 2 - 100, height / 2, 200, 20);
        this.drillProgressBar.fillStyle(GAME_CONFIG.COLORS.DMI_ORANGE);
        this.drillProgressBar.fillRect(width / 2 - 100, height / 2, 200 * progress, 20);
        
        // Shake effect
        this.cameras.main.shake(50, 0.002);
        
        // Sparks
        if (Math.random() > 0.7) {
            this.createSparkEffect(this.currentDrillWall.x, this.currentDrillWall.y);
        }
        
        if (this.currentDrillWall.drillProgress >= 100) {
            this.completeDrilling();
        }
    }

    completeDrilling() {
        this.isDrilling = false;
        this.currentDrillWall.isDrilled = true;
        
        // Clean up UI
        this.drillProgressBar.destroy();
        this.drillText.destroy();
        
        // Stop drill sound
        this.sound.stopByKey('drill');
        this.sound.play('levelup', { volume: 0.3 });
        
        // Destroy wall with effect
        this.createDebrisEffect(this.currentDrillWall.x, this.currentDrillWall.y);
        this.currentDrillWall.destroy();
        
        // Bonus points
        this.addScore(500);
        
        // Show bonus text
        const bonusText = this.add.text(
            this.player.x,
            this.player.y - 50,
            '+500 WALL DRILLED!',
            {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '12px',
                color: '#FFD54F',
                stroke: '#000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
        
        this.tweens.add({
            targets: bonusText,
            y: bonusText.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => bonusText.destroy()
        });
    }

    coreHitEnemy(core, enemy) {
        this.createDebrisEffect(core.x, core.y);
        
        enemy.health -= core.damage;
        core.destroy();
        
        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        } else {
            // Flash enemy
            enemy.setTint(0xFF0000);
            this.time.delayedCall(100, () => enemy.clearTint());
            this.sound.play('hit', { volume: 0.3 });
        }
    }

    killEnemy(enemy) {
        // Points based on enemy type
        const points = {
            'homeowner': 100,
            'foreman': 300,
            'hardhat_enemy': 150
        };
        
        this.addScore(points[enemy.enemyType] || 100);
        
        // Death effect
        this.tweens.add({
            targets: enemy,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 0.5,
            duration: 200,
            onComplete: () => enemy.destroy()
        });
        
        this.createDebrisEffect(enemy.x, enemy.y);
        this.sound.play('hit', { volume: 0.4 });
    }

    playerHitEnemy(player, enemy) {
        if (this.isInvincible) return;
        
        if (this.hasShield) {
            this.hasShield = false;
            this.updatePowerUpIndicator();
            this.killEnemy(enemy);
            return;
        }
        
        this.takeDamage();
    }

    playerHitProjectile(player, projectile) {
        if (this.isInvincible) return;
        
        projectile.destroy();
        
        if (this.hasShield) {
            this.hasShield = false;
            this.updatePowerUpIndicator();
            return;
        }
        
        this.takeDamage();
    }

    collectPowerUp(player, powerup) {
        const type = powerup.powerupType;
        powerup.destroy();
        
        this.sound.play('powerup', { volume: 0.4 });
        this.addScore(50);
        
        switch (type) {
            case 'powerup_speed':
                this.fireRate = 150;
                this.time.delayedCall(10000, () => {
                    this.fireRate = 300;
                    this.updatePowerUpIndicator();
                });
                break;
                
            case 'powerup_bigcore':
                this.hasBigCores = true;
                this.time.delayedCall(15000, () => {
                    this.hasBigCores = false;
                    this.updatePowerUpIndicator();
                });
                break;
                
            case 'powerup_shield':
                this.hasShield = true;
                break;
                
            case 'powerup_health':
                if (this.lives < 5) {
                    this.lives++;
                    this.updateHearts();
                }
                break;
        }
        
        this.updatePowerUpIndicator();
        
        // Pickup effect
        const pickupText = this.add.text(player.x, player.y - 30, this.getPowerUpName(type), {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#4CAF50',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: pickupText,
            y: pickupText.y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => pickupText.destroy()
        });
    }

    getPowerUpName(type) {
        const names = {
            'powerup_speed': 'RAPID FIRE!',
            'powerup_bigcore': 'BIG CORES!',
            'powerup_shield': 'SHIELD!',
            'powerup_health': '+1 LIFE!'
        };
        return names[type] || 'POWER UP!';
    }

    updatePowerUpIndicator() {
        const active = [];
        if (this.fireRate < 300) active.push('⚡RAPID');
        if (this.hasBigCores) active.push('💥BIG');
        if (this.hasShield) active.push('🛡️SHIELD');
        
        this.powerUpIndicator.setText(active.join('\n'));
    }

    takeDamage() {
        if (this.isInvincible) return;
        
        this.lives--;
        this.updateHearts();
        this.sound.play('hit', { volume: 0.5 });
        
        if (this.lives <= 0) {
            this.gameOver();
            return;
        }
        
        // Invincibility frames
        this.isInvincible = true;
        
        // Flash effect
        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 10,
            onComplete: () => {
                this.player.alpha = 1;
                this.isInvincible = false;
            }
        });
        
        // Knockback
        this.player.setVelocityY(-200);
        this.cameras.main.shake(100, 0.01);
    }

    addScore(points) {
        this.score += points;
        this.scoreText.setText(`SCORE: ${Utils.formatScore(this.score)}`);
        
        // Score pop effect
        this.tweens.add({
            targets: this.scoreText,
            scale: 1.2,
            duration: 100,
            yoyo: true
        });
    }

    createLevelEndZone() {
        const { height } = this.cameras.main;
        
        // End zone marker
        this.endZone = this.add.rectangle(
            this.levelWidth - 50,
            height - 100,
            40,
            150,
            GAME_CONFIG.COLORS.DMI_ORANGE,
            0.5
        );
        this.physics.add.existing(this.endZone, true);
        
        // Flag/marker
        this.add.text(this.levelWidth - 50, height - 200, '🚩', {
            fontSize: '32px'
        }).setOrigin(0.5);
        
        this.add.text(this.levelWidth - 50, height - 230, 'FINISH', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#FFD54F',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Collision
        this.physics.add.overlap(this.player, this.endZone, this.levelComplete, null, this);
    }

    levelComplete() {
        if (this.levelCompleted) return;
        this.levelCompleted = true;
        
        this.sound.play('levelup', { volume: 0.5 });
        
        // Bonus for lives remaining
        const lifeBonus = this.lives * 500;
        this.addScore(lifeBonus);
        
        // Show level complete
        const { width, height } = this.cameras.main;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setScrollFactor(0)
            .setDepth(200);
        
        const completeText = this.add.text(width / 2, height / 2 - 60, `LEVEL ${this.currentLevel} COMPLETE!`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '20px',
            color: '#FFD54F',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        
        const bonusText = this.add.text(width / 2, height / 2, `LIFE BONUS: +${lifeBonus}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#4CAF50'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
        
        // Next level or victory
        this.time.delayedCall(2000, () => {
            if (this.currentLevel < 3) {
                this.scene.restart({ level: this.currentLevel + 1, score: this.score, lives: this.lives });
            } else {
                this.victory();
            }
        });
    }

    victory() {
        // Update high score
        if (this.score > Utils.getHighScore()) {
            Utils.setHighScore(this.score);
        }
        
        this.scene.start('GameOverScene', {
            score: this.score,
            victory: true
        });
    }

    gameOver() {
        this.sound.play('death', { volume: 0.5 });
        
        // Update high score
        if (this.score > Utils.getHighScore()) {
            Utils.setHighScore(this.score);
        }
        
        // Death animation
        this.tweens.add({
            targets: this.player,
            y: this.player.y - 100,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.scene.start('GameOverScene', {
                    score: this.score,
                    victory: false
                });
            }
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.physics.pause();
            this.showPauseMenu();
        } else {
            this.physics.resume();
            this.hidePauseMenu();
        }
    }

    showPauseMenu() {
        const { width, height } = this.cameras.main;
        
        this.pauseContainer = this.add.container(0, 0);
        this.pauseContainer.setScrollFactor(0);
        this.pauseContainer.setDepth(300);
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        this.pauseContainer.add(overlay);
        
        const title = this.add.text(width / 2, height * 0.3, 'PAUSED', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '32px',
            color: '#FF6B00'
        }).setOrigin(0.5);
        this.pauseContainer.add(title);
        
        // Resume button
        const resumeBtn = this.add.image(width / 2, height * 0.5, 'button').setInteractive();
        const resumeLabel = this.add.text(width / 2, height * 0.5, 'RESUME', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#FFF'
        }).setOrigin(0.5);
        resumeBtn.on('pointerdown', () => this.togglePause());
        this.pauseContainer.add(resumeBtn);
        this.pauseContainer.add(resumeLabel);
        
        // Quit button
        const quitBtn = this.add.image(width / 2, height * 0.65, 'button').setInteractive();
        const quitLabel = this.add.text(width / 2, height * 0.65, 'QUIT', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#FFF'
        }).setOrigin(0.5);
        quitBtn.on('pointerdown', () => this.scene.start('MenuScene'));
        this.pauseContainer.add(quitBtn);
        this.pauseContainer.add(quitLabel);
        
        // Shop link
        const shopLink = this.add.text(width / 2, height * 0.85, '🛒 Shop Real Drill Bits', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#4FC3F7'
        }).setOrigin(0.5).setInteractive();
        shopLink.on('pointerdown', () => {
            window.open('https://dmitools.com/collections/core-drill-bits', '_blank');
        });
        this.pauseContainer.add(shopLink);
    }

    hidePauseMenu() {
        if (this.pauseContainer) {
            this.pauseContainer.destroy();
        }
    }

    updateEnemies(delta) {
        this.enemies.children.iterate((enemy) => {
            if (!enemy || !enemy.active) return;
            
            const speed = GAME_CONFIG.ENEMY_SPEED * this.difficultyMultiplier;
            
            // Basic patrol AI
            if (enemy.enemyType === 'hardhat_enemy') {
                // Flying enemy - moves toward player
                const dx = this.player.x - enemy.x;
                const dy = this.player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 400) {
                    enemy.setVelocity(
                        (dx / dist) * speed * 0.8,
                        (dy / dist) * speed * 0.5
                    );
                }
            } else {
                // Ground enemies - patrol
                if (enemy.x <= enemy.patrolStart) {
                    enemy.direction = 1;
                } else if (enemy.x >= enemy.patrolEnd) {
                    enemy.direction = -1;
                }
                
                enemy.setVelocityX(speed * enemy.direction);
                enemy.setFlipX(enemy.direction < 0);
            }
            
            // Foreman can shoot
            if (enemy.enemyType === 'foreman') {
                const now = this.time.now;
                const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                
                if (dist < 300 && now - enemy.lastShot > 2000) {
                    enemy.lastShot = now;
                    this.enemyShoot(enemy);
                }
            }
        });
    }

    enemyShoot(enemy) {
        const projectile = this.enemyProjectiles.create(enemy.x, enemy.y, 'debris');
        projectile.setScale(2);
        projectile.setTint(0xFF0000);
        
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        projectile.setVelocity(
            Math.cos(angle) * 200,
            Math.sin(angle) * 200
        );
        projectile.body.setAllowGravity(false);
        
        this.time.delayedCall(3000, () => {
            if (projectile.active) projectile.destroy();
        });
    }

    update(time, delta) {
        if (this.isPaused || this.levelCompleted) return;
        
        // Player movement
        const speed = GAME_CONFIG.PLAYER_SPEED;
        
        let moveLeft = this.cursors.left.isDown || this.wasd.A.isDown;
        let moveRight = this.cursors.right.isDown || this.wasd.D.isDown;
        let jump = Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.wasd.W);
        
        // Mobile controls
        if (Utils.isMobile()) {
            moveLeft = this.touchLeft;
            moveRight = this.touchRight;
        }
        
        if (this.isDrilling) {
            // Can't move while drilling
            this.player.setVelocityX(0);
            this.updateDrilling(delta);
            
            // Cancel drilling if player moves away
            if (moveLeft || moveRight) {
                this.isDrilling = false;
                this.sound.stopByKey('drill');
                if (this.drillProgressBar) this.drillProgressBar.destroy();
                if (this.drillText) this.drillText.destroy();
            }
        } else {
            if (moveLeft) {
                this.player.setVelocityX(-speed);
                this.player.facingRight = false;
                this.player.setFlipX(true);
            } else if (moveRight) {
                this.player.setVelocityX(speed);
                this.player.facingRight = true;
                this.player.setFlipX(false);
            } else {
                this.player.setVelocityX(0);
            }
            
            if (jump) {
                this.tryJump();
            }
        }
        
        // Update texture based on state
        const onGround = this.player.body.touching.down || this.player.body.blocked.down;
        this.player.setTexture(onGround ? 'player' : 'player_jump');
        
        // Update enemies
        this.updateEnemies(delta);
        
        // Check for falling death
        if (this.player.y > this.cameras.main.height + 100) {
            this.takeDamage();
            this.player.setPosition(100, this.cameras.main.height - 100);
        }
    }
}

// ============================================
// GAME OVER SCENE
// ============================================
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.isVictory = data.victory || false;
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.cameras.main.setBackgroundColor(GAME_CONFIG.COLORS.DARK_BLUE);
        
        // Title
        const title = this.isVictory ? 'VICTORY!' : 'GAME OVER';
        const titleColor = this.isVictory ? '#4CAF50' : '#F44336';
        
        this.add.text(width / 2, height * 0.25, title, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '24px' : '48px',
            color: titleColor,
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Score
        this.add.text(width / 2, height * 0.4, `FINAL SCORE: ${Utils.formatScore(this.finalScore)}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '12px' : '20px',
            color: '#FFD54F'
        }).setOrigin(0.5);
        
        // High score
        const highScore = Utils.getHighScore();
        const isNewRecord = this.finalScore >= highScore && this.finalScore > 0;
        
        this.add.text(width / 2, height * 0.5, `HIGH SCORE: ${Utils.formatScore(highScore)}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '10px' : '16px',
            color: '#4FC3F7'
        }).setOrigin(0.5);
        
        if (isNewRecord) {
            const recordText = this.add.text(width / 2, height * 0.58, '★ NEW RECORD! ★', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: Utils.isMobile() ? '12px' : '18px',
                color: '#FFD54F'
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: recordText,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Play again button
        const playBtn = this.add.image(width / 2, height * 0.7, 'button').setInteractive();
        this.add.text(width / 2, height * 0.7, 'PLAY AGAIN', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '12px' : '16px',
            color: '#FFF'
        }).setOrigin(0.5);
        
        playBtn.on('pointerdown', () => {
            this.scene.start('GameScene', { level: 1 });
        });
        
        // Menu button
        const menuBtn = this.add.image(width / 2, height * 0.82, 'button').setInteractive();
        this.add.text(width / 2, height * 0.82, 'MAIN MENU', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '12px' : '16px',
            color: '#FFF'
        }).setOrigin(0.5);
        
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        // Shop link
        const shopLink = this.add.text(width / 2, height * 0.93, '🛒 Need a REAL Core Drill? Shop DMI Tools', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: Utils.isMobile() ? '7px' : '10px',
            color: '#888'
        }).setOrigin(0.5).setInteractive();
        
        shopLink.on('pointerover', () => shopLink.setColor('#4FC3F7'));
        shopLink.on('pointerout', () => shopLink.setColor('#888'));
        shopLink.on('pointerdown', () => {
            window.open('https://dmitools.com/collections/core-drill-bits', '_blank');
        });
        
        this.cameras.main.fadeIn(300);
    }
}

// ============================================
// GAME INITIALIZATION
// ============================================
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 480,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.GRAVITY },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 400,
            height: 240
        },
        max: {
            width: 1600,
            height: 960
        }
    },
    scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

// Start the game
window.addEventListener('load', () => {
    new Phaser.Game(config);
});
