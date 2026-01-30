/**
 * CORE DRILLER v3 - DMI Tools Corp
 * Professional-grade 2D side-scrolling run-and-gun platformer
 * 
 * Built with pure JavaScript/Canvas - no external dependencies
 */

// ============================================================================
// GAME CONFIGURATION
// ============================================================================
const CONFIG = {
    // Display
    GAME_WIDTH: 800,
    GAME_HEIGHT: 450,
    PIXEL_SCALE: 2,
    
    // Physics
    GRAVITY: 2400,
    TERMINAL_VELOCITY: 800,
    
    // Player
    PLAYER_SPEED: 280,
    PLAYER_JUMP_FORCE: 620,
    PLAYER_JUMP_HOLD_FORCE: 180,
    PLAYER_JUMP_HOLD_TIME: 0.25,
    COYOTE_TIME: 0.12,
    JUMP_BUFFER_TIME: 0.1,
    
    // Combat
    SHOOT_COOLDOWN: 0.25,
    PROJECTILE_SPEED: 600,
    PROJECTILE_RANGE: 500,
    INVINCIBILITY_TIME: 1.5,
    
    // Power-ups
    POWERUP_DURATION: 8,
    SHIELD_HITS: 3,
    RANGE_MULTIPLIER: 1.8,
    DAMAGE_MULTIPLIER: 2,
    
    // Audio
    MASTER_VOLUME: 0.3,
    
    // Colors (from art direction)
    COLORS: {
        DMI_ORANGE: '#FF6B00',
        DMI_BLUE: '#4FC3F7',
        SAFETY_YELLOW: '#FFD700',
        SAFETY_ORANGE: '#FF8C00',
        CONCRETE_GRAY: '#8B8680',
        DARK_CONCRETE: '#5C5C5C',
        STEEL_GRAY: '#A8A8A8',
        RUST_ORANGE: '#C25F30',
        DIRT_BROWN: '#8B7355',
        SKY_BLUE: '#87CEEB',
        SKIN_TONE: '#F4C2A0',
        SKIN_SHADOW: '#D2945E',
        DRILL_SILVER: '#C0C0C0',
        DRILL_BLACK: '#2D2D2D',
        DMI_RED: '#CC0000',
        WHITE: '#FFFFFF',
        BLACK: '#000000'
    }
};

// ============================================================================
// AUDIO ENGINE - Procedural Sound Generation
// ============================================================================
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterGain = null;
    }
    
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = CONFIG.MASTER_VOLUME;
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            this.enabled = false;
        }
    }
    
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    
    // Drill shoot sound - satisfying "whoosh-thunk"
    playShoot() {
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noise = this.createNoise(0.08);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        noise.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
    
    // Impact sound - concrete hitting
    playImpact() {
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(150 + Math.random() * 50, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
    
    // Player hurt sound
    playHurt() {
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }
    
    // Enemy death - satisfying explosion
    playEnemyDeath() {
        if (!this.enabled || !this.ctx) return;
        
        const noise = this.createNoise(0.2);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        noise.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }
    
    // Power-up pickup
    playPowerup() {
        if (!this.enabled || !this.ctx) return;
        
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = this.ctx.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + 0.1);
        });
    }
    
    // Jump sound
    playJump() {
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
    
    // Create noise burst
    createNoise(duration) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        
        source.buffer = buffer;
        gain.gain.value = 0.15;
        
        source.connect(gain);
        source.start();
        
        return gain;
    }
}

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================
class Particle {
    constructor(x, y, vx, vy, color, size, lifetime, gravity = true) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.gravity = gravity;
        this.alpha = 1;
    }
    
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        if (this.gravity) {
            this.vy += 600 * dt;
        }
        
        this.lifetime -= dt;
        this.alpha = Math.max(0, this.lifetime / this.maxLifetime);
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            Math.floor(this.x - this.size / 2),
            Math.floor(this.y - this.size / 2),
            this.size,
            this.size
        );
        ctx.globalAlpha = 1;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, count, config) {
        for (let i = 0; i < count; i++) {
            const angle = config.angle !== undefined 
                ? config.angle + (Math.random() - 0.5) * (config.spread || Math.PI)
                : Math.random() * Math.PI * 2;
            const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
            const color = Array.isArray(config.colors) 
                ? config.colors[Math.floor(Math.random() * config.colors.length)]
                : config.colors;
            const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);
            const lifetime = config.lifetimeMin + Math.random() * (config.lifetimeMax - config.lifetimeMin);
            
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * (config.offsetX || 0),
                y + (Math.random() - 0.5) * (config.offsetY || 0),
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                size,
                lifetime,
                config.gravity !== false
            ));
        }
    }
    
    // Pre-defined effects
    drillImpact(x, y, direction) {
        this.emit(x, y, 8, {
            angle: direction,
            spread: Math.PI / 3,
            speedMin: 150,
            speedMax: 300,
            colors: [CONFIG.COLORS.CONCRETE_GRAY, CONFIG.COLORS.STEEL_GRAY, CONFIG.COLORS.WHITE],
            sizeMin: 2,
            sizeMax: 5,
            lifetimeMin: 0.2,
            lifetimeMax: 0.4
        });
        
        // Blue energy particles
        this.emit(x, y, 4, {
            angle: direction,
            spread: Math.PI / 4,
            speedMin: 200,
            speedMax: 350,
            colors: [CONFIG.COLORS.DMI_BLUE, CONFIG.COLORS.WHITE],
            sizeMin: 2,
            sizeMax: 4,
            lifetimeMin: 0.15,
            lifetimeMax: 0.3
        });
    }
    
    enemyDeath(x, y) {
        // Explosion particles
        this.emit(x, y, 20, {
            spread: Math.PI * 2,
            speedMin: 100,
            speedMax: 250,
            colors: [CONFIG.COLORS.DMI_ORANGE, CONFIG.COLORS.SAFETY_YELLOW, CONFIG.COLORS.WHITE, CONFIG.COLORS.RUST_ORANGE],
            sizeMin: 3,
            sizeMax: 8,
            lifetimeMin: 0.3,
            lifetimeMax: 0.6
        });
        
        // Debris
        this.emit(x, y, 10, {
            spread: Math.PI * 2,
            speedMin: 50,
            speedMax: 180,
            colors: [CONFIG.COLORS.CONCRETE_GRAY, CONFIG.COLORS.DARK_CONCRETE, CONFIG.COLORS.STEEL_GRAY],
            sizeMin: 4,
            sizeMax: 10,
            lifetimeMin: 0.5,
            lifetimeMax: 1.0
        });
    }
    
    landingDust(x, y) {
        this.emit(x, y, 6, {
            angle: -Math.PI / 2,
            spread: Math.PI,
            speedMin: 20,
            speedMax: 80,
            colors: ['#D2B48C', '#C4A882', CONFIG.COLORS.CONCRETE_GRAY],
            sizeMin: 4,
            sizeMax: 8,
            lifetimeMin: 0.3,
            lifetimeMax: 0.5,
            gravity: false
        });
    }
    
    muzzleFlash(x, y, direction) {
        this.emit(x, y, 5, {
            angle: direction,
            spread: Math.PI / 6,
            speedMin: 300,
            speedMax: 500,
            colors: [CONFIG.COLORS.WHITE, CONFIG.COLORS.DMI_BLUE, CONFIG.COLORS.SAFETY_YELLOW],
            sizeMin: 2,
            sizeMax: 4,
            lifetimeMin: 0.05,
            lifetimeMax: 0.1,
            gravity: false
        });
    }
    
    powerupPickup(x, y, color) {
        this.emit(x, y, 15, {
            spread: Math.PI * 2,
            speedMin: 80,
            speedMax: 200,
            colors: [color, CONFIG.COLORS.WHITE, CONFIG.COLORS.SAFETY_YELLOW],
            sizeMin: 3,
            sizeMax: 6,
            lifetimeMin: 0.4,
            lifetimeMax: 0.8,
            gravity: false
        });
    }
    
    update(dt) {
        this.particles = this.particles.filter(p => p.update(dt));
    }
    
    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}

// ============================================================================
// SCREEN SHAKE
// ============================================================================
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    shake(intensity, duration) {
        this.intensity = Math.max(this.intensity, intensity);
        this.duration = Math.max(this.duration, duration);
    }
    
    // Pre-defined shake levels
    small() { this.shake(3, 0.1); }
    medium() { this.shake(6, 0.15); }
    large() { this.shake(10, 0.2); }
    epic() { this.shake(15, 0.3); }
    
    update(dt) {
        if (this.duration > 0) {
            this.duration -= dt;
            const t = this.duration > 0 ? 1 : 0;
            this.offsetX = (Math.random() - 0.5) * this.intensity * t;
            this.offsetY = (Math.random() - 0.5) * this.intensity * t;
            this.intensity *= 0.9;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
            this.intensity = 0;
        }
    }
}

// ============================================================================
// SPRITE RENDERER - Programmatic pixel art
// ============================================================================
class SpriteRenderer {
    constructor() {
        this.cache = new Map();
    }
    
    // Create offscreen canvas for caching
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    
    // Get or create cached sprite
    getSprite(key, width, height, drawFn) {
        if (!this.cache.has(key)) {
            const canvas = this.createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            drawFn(ctx);
            this.cache.set(key, canvas);
        }
        return this.cache.get(key);
    }
    
    // ========== PLAYER SPRITES ==========
    drawPlayer(ctx, frame = 0, facingRight = true, shooting = false) {
        const key = `player_${frame}_${facingRight}_${shooting}`;
        return this.getSprite(key, 32, 48, (c) => {
            this._drawPlayerSprite(c, frame, facingRight, shooting);
        });
    }
    
    _drawPlayerSprite(ctx, frame, facingRight, shooting) {
        const bobY = Math.sin(frame * 0.3) * 1;
        const C = CONFIG.COLORS;
        
        if (!facingRight) {
            ctx.translate(32, 0);
            ctx.scale(-1, 1);
        }
        
        // Body/Vest (Safety Yellow)
        ctx.fillStyle = C.SAFETY_YELLOW;
        ctx.fillRect(8, 16 + bobY, 14, 18);
        
        // Reflective stripes on vest
        ctx.fillStyle = C.WHITE;
        ctx.fillRect(9, 19 + bobY, 2, 14);
        ctx.fillRect(19, 19 + bobY, 2, 14);
        ctx.fillRect(10, 25 + bobY, 10, 2);
        
        // Blue shirt (arms)
        ctx.fillStyle = C.DMI_BLUE;
        ctx.fillRect(4, 18 + bobY, 5, 8);
        ctx.fillRect(21, 18 + bobY, 5, 8);
        
        // Pants (dark gray)
        ctx.fillStyle = C.DARK_CONCRETE;
        ctx.fillRect(9, 34 + bobY, 5, 10);
        ctx.fillRect(16, 34 + bobY, 5, 10);
        
        // Boots (black)
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(8, 43 + bobY, 6, 5);
        ctx.fillRect(16, 43 + bobY, 6, 5);
        
        // Boot steel toe
        ctx.fillStyle = C.STEEL_GRAY;
        ctx.fillRect(8, 45 + bobY, 3, 3);
        ctx.fillRect(19, 45 + bobY, 3, 3);
        
        // Head (skin tone)
        ctx.fillStyle = C.SKIN_TONE;
        ctx.fillRect(10, 6 + bobY, 10, 10);
        
        // Face shadow
        ctx.fillStyle = C.SKIN_SHADOW;
        ctx.fillRect(10, 13 + bobY, 10, 3);
        
        // Eyes
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(12, 9 + bobY, 2, 2);
        ctx.fillRect(17, 9 + bobY, 2, 2);
        
        // Hard hat (DMI Orange)
        ctx.fillStyle = C.DMI_ORANGE;
        ctx.fillRect(8, 2 + bobY, 14, 6);
        ctx.fillRect(6, 6 + bobY, 18, 3);
        
        // Hard hat brim highlight
        ctx.fillStyle = C.SAFETY_YELLOW;
        ctx.fillRect(8, 3 + bobY, 12, 1);
        
        // Hard hat reflective stripe
        ctx.fillStyle = C.WHITE;
        ctx.fillRect(7, 7 + bobY, 16, 1);
        
        // THE CORE DRILL - Must be recognizable!
        const drillX = shooting ? 24 : 22;
        const drillY = 20 + bobY;
        
        // Drill motor body (silver/white)
        ctx.fillStyle = C.DRILL_SILVER;
        ctx.fillRect(drillX - 2, drillY, 8, 12);
        
        // DMI Logo (red)
        ctx.fillStyle = C.DMI_RED;
        ctx.fillRect(drillX, drillY + 2, 4, 3);
        
        // Motor details
        ctx.fillStyle = C.STEEL_GRAY;
        ctx.fillRect(drillX - 2, drillY + 6, 8, 2);
        
        // Handle on top
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(drillX, drillY - 2, 4, 3);
        
        // Core bit (BLACK tube with silver segments)
        ctx.fillStyle = C.DRILL_BLACK;
        ctx.fillRect(drillX + 6, drillY + 2, 10, 8);
        
        // Diamond segments (silver teeth at tip)
        ctx.fillStyle = C.STEEL_GRAY;
        ctx.fillRect(drillX + 14, drillY + 2, 3, 2);
        ctx.fillRect(drillX + 14, drillY + 5, 3, 2);
        ctx.fillRect(drillX + 14, drillY + 8, 3, 2);
        
        // Highlight on bit
        ctx.fillStyle = '#444444';
        ctx.fillRect(drillX + 7, drillY + 3, 1, 6);
        
        // Hand holding drill
        ctx.fillStyle = C.SKIN_TONE;
        ctx.fillRect(drillX - 4, drillY + 3, 4, 6);
        
        // Black outline around whole character
        this._addOutline(ctx, 32, 48);
    }
    
    _addOutline(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const outline = [];
        
        // Find edge pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                if (data[i + 3] > 0) {
                    // Check if any neighbor is transparent
                    const neighbors = [
                        [x-1, y], [x+1, y], [x, y-1], [x, y+1]
                    ];
                    for (const [nx, ny] of neighbors) {
                        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
                            outline.push([x, y]);
                            break;
                        }
                        const ni = (ny * width + nx) * 4;
                        if (data[ni + 3] === 0) {
                            outline.push([nx, ny]);
                        }
                    }
                }
            }
        }
        
        // Draw outline
        ctx.fillStyle = CONFIG.COLORS.BLACK;
        outline.forEach(([x, y]) => {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                ctx.fillRect(x, y, 1, 1);
            }
        });
    }
    
    // ========== ENEMY SPRITES ==========
    drawAngryHomeowner(ctx, frame = 0) {
        const key = `homeowner_${frame}`;
        return this.getSprite(key, 28, 40, (c) => {
            this._drawHomeownerSprite(c, frame);
        });
    }
    
    _drawHomeownerSprite(ctx, frame) {
        const C = CONFIG.COLORS;
        const bob = Math.sin(frame * 0.4) * 1;
        
        // Legs
        ctx.fillStyle = '#8B7355'; // khaki
        ctx.fillRect(8, 28 + bob, 5, 10);
        ctx.fillRect(15, 28 + bob, 5, 10);
        
        // Slippers
        ctx.fillStyle = '#654321';
        ctx.fillRect(7, 36 + bob, 7, 4);
        ctx.fillRect(14, 36 + bob, 7, 4);
        
        // Body (polo shirt)
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(6, 14 + bob, 16, 14);
        
        // Collar
        ctx.fillStyle = '#6BB5D8';
        ctx.fillRect(10, 14 + bob, 8, 3);
        
        // Arms (raised in anger)
        ctx.fillStyle = C.SKIN_TONE;
        ctx.fillRect(2, 10 + bob, 5, 8);
        ctx.fillRect(21, 10 + bob, 5, 8);
        
        // Fists
        ctx.fillRect(2, 8 + bob, 5, 5);
        ctx.fillRect(21, 8 + bob, 5, 5);
        
        // Head
        ctx.fillStyle = C.SKIN_TONE;
        ctx.fillRect(8, 2 + bob, 12, 12);
        
        // Angry red face
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(9, 6 + bob, 10, 6);
        
        // Angry eyebrows
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(9, 4 + bob, 4, 2);
        ctx.fillRect(15, 4 + bob, 4, 2);
        
        // Eyes
        ctx.fillRect(10, 6 + bob, 2, 2);
        ctx.fillRect(16, 6 + bob, 2, 2);
        
        // Shouting mouth
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(11, 10 + bob, 6, 3);
        
        // Balding head
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(9, 0 + bob, 10, 3);
    }
    
    drawForeman(ctx, frame = 0) {
        const key = `foreman_${frame}`;
        return this.getSprite(key, 32, 48, (c) => {
            this._drawForemanSprite(c, frame);
        });
    }
    
    _drawForemanSprite(ctx, frame) {
        const C = CONFIG.COLORS;
        const bob = Math.sin(frame * 0.3) * 1;
        
        // Legs
        ctx.fillStyle = '#2C2C54';
        ctx.fillRect(9, 34 + bob, 5, 10);
        ctx.fillRect(16, 34 + bob, 5, 10);
        
        // Boots
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(8, 43 + bob, 6, 5);
        ctx.fillRect(16, 43 + bob, 6, 5);
        
        // Body (yellow vest)
        ctx.fillStyle = C.SAFETY_YELLOW;
        ctx.fillRect(7, 16 + bob, 16, 18);
        
        // FOREMAN text suggestion (stripes)
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(9, 20 + bob, 12, 2);
        ctx.fillRect(9, 24 + bob, 12, 2);
        ctx.fillRect(9, 28 + bob, 12, 2);
        
        // Arms
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(3, 18 + bob, 5, 10);
        ctx.fillRect(22, 18 + bob, 5, 10);
        
        // Clipboard
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(1, 22 + bob, 7, 10);
        ctx.fillStyle = C.WHITE;
        ctx.fillRect(2, 23 + bob, 5, 8);
        
        // Head
        ctx.fillStyle = C.SKIN_TONE;
        ctx.fillRect(10, 6 + bob, 10, 10);
        
        // Mustache
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(11, 12 + bob, 8, 2);
        
        // Sunglasses
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(10, 8 + bob, 4, 3);
        ctx.fillRect(16, 8 + bob, 4, 3);
        ctx.fillRect(14, 9 + bob, 2, 1);
        
        // Hard hat (Yellow - different from player)
        ctx.fillStyle = C.SAFETY_YELLOW;
        ctx.fillRect(8, 0 + bob, 14, 6);
        ctx.fillRect(6, 4 + bob, 18, 3);
        
        // Hat brim
        ctx.fillStyle = C.WHITE;
        ctx.fillRect(7, 5 + bob, 16, 1);
        
        // Whistle
        ctx.fillStyle = C.STEEL_GRAY;
        ctx.fillRect(24, 14 + bob, 4, 3);
    }
    
    drawFlyingHardHat(ctx, frame = 0) {
        const key = `hardhat_${frame}`;
        return this.getSprite(key, 24, 24, (c) => {
            this._drawHardHatSprite(c, frame);
        });
    }
    
    _drawHardHatSprite(ctx, frame) {
        const C = CONFIG.COLORS;
        const rot = frame * 0.5;
        
        // Possessed aura (flickering)
        if (frame % 4 < 2) {
            ctx.fillStyle = 'rgba(255, 107, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(12, 12, 12, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Hard hat body (DMI Orange)
        ctx.fillStyle = C.DMI_ORANGE;
        ctx.fillRect(4, 8, 16, 10);
        ctx.fillRect(6, 6, 12, 4);
        
        // Hat brim
        ctx.fillStyle = C.SAFETY_ORANGE;
        ctx.fillRect(2, 16, 20, 4);
        
        // Cracks
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(8, 9, 1, 6);
        ctx.fillRect(15, 10, 1, 5);
        
        // Glowing angry eyes
        ctx.fillStyle = C.WHITE;
        ctx.fillRect(7, 12, 3, 3);
        ctx.fillRect(14, 12, 3, 3);
        
        // Pupils
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(8, 13, 2, 2);
        ctx.fillRect(15, 13, 2, 2);
        
        // Flame particles (possession effect)
        ctx.fillStyle = C.SAFETY_YELLOW;
        const flameOffset = Math.sin(rot) * 2;
        ctx.fillRect(3 + flameOffset, 4, 2, 3);
        ctx.fillRect(19 - flameOffset, 5, 2, 3);
        ctx.fillRect(11, 2 + Math.abs(flameOffset), 2, 3);
    }
    
    drawBuildingInspector(ctx, frame = 0) {
        const key = `inspector_${frame}`;
        return this.getSprite(key, 28, 44, (c) => {
            this._drawInspectorSprite(c, frame);
        });
    }
    
    _drawInspectorSprite(ctx, frame) {
        const C = CONFIG.COLORS;
        const bob = Math.sin(frame * 0.35) * 1;
        
        // Legs
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(8, 30 + bob, 5, 10);
        ctx.fillRect(15, 30 + bob, 5, 10);
        
        // Dress shoes
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(7, 38 + bob, 6, 4);
        ctx.fillRect(15, 38 + bob, 6, 4);
        
        // Body (suit jacket)
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(6, 14 + bob, 16, 16);
        
        // Tie
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(13, 15 + bob, 2, 12);
        
        // White shirt collar
        ctx.fillStyle = C.WHITE;
        ctx.fillRect(11, 14 + bob, 6, 3);
        
        // Arms
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(2, 16 + bob, 5, 12);
        ctx.fillRect(21, 16 + bob, 5, 12);
        
        // Clipboard with violations
        ctx.fillStyle = C.WHITE;
        ctx.fillRect(0, 20 + bob, 6, 10);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(1, 21 + bob, 4, 1);
        ctx.fillRect(1, 23 + bob, 4, 1);
        ctx.fillRect(1, 25 + bob, 4, 1);
        
        // Head
        ctx.fillStyle = C.SKIN_TONE;
        ctx.fillRect(9, 4 + bob, 10, 10);
        
        // Stern expression
        ctx.fillStyle = C.BLACK;
        ctx.fillRect(10, 7 + bob, 3, 2);
        ctx.fillRect(15, 7 + bob, 3, 2);
        
        // Glasses
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(9, 6 + bob, 4, 3);
        ctx.fillRect(15, 6 + bob, 4, 3);
        ctx.fillRect(13, 7 + bob, 2, 1);
        
        // Frown
        ctx.fillRect(12, 11 + bob, 4, 1);
        
        // Hair (neat)
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(9, 2 + bob, 10, 3);
    }
    
    // ========== PROJECTILES ==========
    drawCoreProjectile(ctx, frame = 0) {
        const key = `core_${frame}`;
        return this.getSprite(key, 16, 12, (c) => {
            this._drawCoreProjectile(c, frame);
        });
    }
    
    _drawCoreProjectile(ctx, frame) {
        const C = CONFIG.COLORS;
        
        // Concrete core (cylindrical slug)
        ctx.fillStyle = C.CONCRETE_GRAY;
        ctx.fillRect(2, 2, 12, 8);
        
        // Darker edges (3D effect)
        ctx.fillStyle = C.DARK_CONCRETE;
        ctx.fillRect(2, 2, 2, 8);
        ctx.fillRect(12, 2, 2, 8);
        
        // Highlight
        ctx.fillStyle = C.STEEL_GRAY;
        ctx.fillRect(6, 3, 4, 2);
        
        // Blue energy trail
        ctx.fillStyle = C.DMI_BLUE;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(0, 3, 3, 6);
        ctx.globalAlpha = 0.4;
        ctx.fillRect(0, 4, 2, 4);
        ctx.globalAlpha = 1;
    }
    
    // ========== POWER-UPS ==========
    drawPowerup(ctx, type, frame = 0) {
        const key = `powerup_${type}_${Math.floor(frame / 4) % 2}`;
        return this.getSprite(key, 24, 24, (c) => {
            this._drawPowerupSprite(c, type, frame);
        });
    }
    
    _drawPowerupSprite(ctx, type, frame) {
        const C = CONFIG.COLORS;
        const pulse = Math.sin(frame * 0.2) * 2;
        
        // Glowing background
        const colors = {
            shield: C.DMI_BLUE,
            range: C.SAFETY_YELLOW,
            damage: C.DMI_ORANGE,
            invincible: C.WHITE
        };
        
        ctx.fillStyle = colors[type] || C.DMI_BLUE;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(12, 12, 10 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        switch(type) {
            case 'shield': // Slurry Ring
                ctx.fillStyle = C.DMI_BLUE;
                ctx.fillRect(6, 6, 12, 12);
                ctx.fillStyle = C.WHITE;
                ctx.fillRect(9, 9, 6, 6);
                ctx.fillStyle = C.DMI_BLUE;
                ctx.fillRect(10, 10, 4, 4);
                break;
                
            case 'range': // Bit Extension
                ctx.fillStyle = C.DRILL_BLACK;
                ctx.fillRect(4, 10, 16, 4);
                ctx.fillStyle = C.STEEL_GRAY;
                ctx.fillRect(18, 10, 3, 4);
                ctx.fillRect(4, 10, 3, 4);
                break;
                
            case 'damage': // Sharpening Block
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(6, 8, 12, 10);
                ctx.fillStyle = '#5c7cfa';
                ctx.fillRect(7, 9, 10, 3);
                // Diamond sparkle
                ctx.fillStyle = C.WHITE;
                ctx.fillRect(11, 11, 2, 2);
                break;
                
            case 'invincible': // Anchors
                ctx.fillStyle = C.STEEL_GRAY;
                // Anchor shape
                ctx.fillRect(10, 4, 4, 14);
                ctx.fillRect(6, 14, 12, 4);
                ctx.fillRect(4, 16, 4, 4);
                ctx.fillRect(16, 16, 4, 4);
                // Ring at top
                ctx.fillStyle = C.RUST_ORANGE;
                ctx.fillRect(9, 2, 6, 4);
                ctx.fillStyle = C.STEEL_GRAY;
                ctx.fillRect(10, 3, 4, 2);
                break;
        }
    }
    
    // ========== PLATFORMS ==========
    drawPlatform(ctx, width, type = 'concrete') {
        const key = `platform_${type}_${width}`;
        return this.getSprite(key, width, 32, (c) => {
            this._drawPlatformSprite(c, width, type);
        });
    }
    
    _drawPlatformSprite(ctx, width, type) {
        const C = CONFIG.COLORS;
        
        if (type === 'concrete') {
            // Main concrete body
            ctx.fillStyle = C.CONCRETE_GRAY;
            ctx.fillRect(0, 0, width, 32);
            
            // Top surface (lighter)
            ctx.fillStyle = C.STEEL_GRAY;
            ctx.fillRect(0, 0, width, 4);
            
            // Bottom shadow
            ctx.fillStyle = C.DARK_CONCRETE;
            ctx.fillRect(0, 28, width, 4);
            
            // Random cracks
            ctx.fillStyle = C.DARK_CONCRETE;
            for (let i = 0; i < width / 40; i++) {
                const x = Math.floor(Math.random() * width);
                ctx.fillRect(x, 4, 1, 8 + Math.random() * 10);
            }
            
            // Rebar showing
            ctx.fillStyle = C.RUST_ORANGE;
            for (let i = 0; i < width / 60; i++) {
                const x = Math.floor(Math.random() * width);
                ctx.fillRect(x, 20, 3, 8);
            }
        } else if (type === 'scaffold') {
            // Steel frame
            ctx.fillStyle = C.STEEL_GRAY;
            ctx.fillRect(0, 0, width, 4);
            ctx.fillRect(0, 28, width, 4);
            ctx.fillRect(0, 0, 4, 32);
            ctx.fillRect(width - 4, 0, 4, 32);
            
            // Cross braces
            ctx.strokeStyle = C.STEEL_GRAY;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(width, 32);
            ctx.moveTo(width, 0);
            ctx.lineTo(0, 32);
            ctx.stroke();
            
            // Wood planks on top
            ctx.fillStyle = C.DIRT_BROWN;
            ctx.fillRect(4, 4, width - 8, 6);
            
            // Safety rail (yellow)
            ctx.fillStyle = C.SAFETY_YELLOW;
            ctx.fillRect(0, 0, width, 2);
        }
    }
}

// ============================================================================
// ENTITY CLASSES
// ============================================================================
class Player {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 44;
        this.vx = 0;
        this.vy = 0;
        
        this.facingRight = true;
        this.isGrounded = false;
        this.isJumping = false;
        this.jumpHoldTime = 0;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.shootCooldown = 0;
        
        this.hp = 5;
        this.maxHp = 5;
        this.invincibleTimer = 0;
        this.flashTimer = 0;
        
        // Power-ups
        this.shield = 0;
        this.rangeBoost = false;
        this.damageBoost = false;
        this.isInvincible = false;
        this.powerupTimers = {
            range: 0,
            damage: 0,
            invincible: 0
        };
        
        this.animFrame = 0;
        this.score = 0;
    }
    
    update(dt, input) {
        this.animFrame += dt * 10;
        
        // Timers
        this.shootCooldown = Math.max(0, this.shootCooldown - dt);
        this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
        this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
        this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
        this.flashTimer += dt;
        
        // Power-up timers
        for (const key in this.powerupTimers) {
            if (this.powerupTimers[key] > 0) {
                this.powerupTimers[key] -= dt;
                if (this.powerupTimers[key] <= 0) {
                    this[key === 'range' ? 'rangeBoost' : key === 'damage' ? 'damageBoost' : 'isInvincible'] = false;
                }
            }
        }
        
        // Horizontal movement
        this.vx = 0;
        if (input.left) {
            this.vx = -CONFIG.PLAYER_SPEED;
            this.facingRight = false;
        }
        if (input.right) {
            this.vx = CONFIG.PLAYER_SPEED;
            this.facingRight = true;
        }
        
        // Jumping
        if (input.jumpPressed) {
            this.jumpBufferTimer = CONFIG.JUMP_BUFFER_TIME;
        }
        
        if (this.jumpBufferTimer > 0 && (this.isGrounded || this.coyoteTimer > 0)) {
            this.vy = -CONFIG.PLAYER_JUMP_FORCE;
            this.isJumping = true;
            this.jumpHoldTime = 0;
            this.jumpBufferTimer = 0;
            this.coyoteTimer = 0;
            this.game.audio.playJump();
        }
        
        // Variable jump height
        if (this.isJumping && input.jump && this.jumpHoldTime < CONFIG.PLAYER_JUMP_HOLD_TIME) {
            this.vy -= CONFIG.PLAYER_JUMP_HOLD_FORCE * dt * 60;
            this.jumpHoldTime += dt;
        }
        
        if (!input.jump) {
            this.isJumping = false;
        }
        
        // Gravity
        this.vy += CONFIG.GRAVITY * dt;
        this.vy = Math.min(this.vy, CONFIG.TERMINAL_VELOCITY);
        
        // Fast fall
        if (input.down && this.vy > 0) {
            this.vy *= 1.5;
        }
        
        // Apply velocity
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Ground check (simplified - just floor)
        const wasGrounded = this.isGrounded;
        this.isGrounded = false;
        
        // Platform collisions
        for (const platform of this.game.platforms) {
            if (this.vy >= 0 && this.collidesWith(platform)) {
                const playerBottom = this.y + this.height;
                const platformTop = platform.y;
                
                if (playerBottom >= platformTop && this.y + this.height - this.vy * dt <= platformTop) {
                    this.y = platformTop - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                    
                    if (!wasGrounded) {
                        this.game.particles.landingDust(this.x + this.width/2, this.y + this.height);
                    }
                }
            }
        }
        
        // Coyote time
        if (wasGrounded && !this.isGrounded && this.vy >= 0) {
            this.coyoteTimer = CONFIG.COYOTE_TIME;
        }
        
        // Screen bounds
        this.x = Math.max(0, Math.min(this.game.worldWidth - this.width, this.x));
        
        // Death by falling
        if (this.y > CONFIG.GAME_HEIGHT + 100) {
            this.takeDamage(this.hp);
        }
        
        // Shooting
        if (input.shoot && this.shootCooldown <= 0) {
            this.shoot();
        }
    }
    
    shoot() {
        this.shootCooldown = CONFIG.SHOOT_COOLDOWN;
        
        const direction = this.facingRight ? 1 : -1;
        const projectileX = this.facingRight ? this.x + this.width : this.x;
        const projectileY = this.y + 20;
        
        const range = this.rangeBoost ? CONFIG.PROJECTILE_RANGE * CONFIG.RANGE_MULTIPLIER : CONFIG.PROJECTILE_RANGE;
        const damage = this.damageBoost ? 2 : 1;
        
        this.game.projectiles.push(new Projectile(
            this.game,
            projectileX,
            projectileY,
            direction * CONFIG.PROJECTILE_SPEED,
            0,
            range,
            damage,
            true
        ));
        
        // Effects
        this.game.audio.playShoot();
        this.game.particles.muzzleFlash(
            projectileX + direction * 10,
            projectileY,
            this.facingRight ? 0 : Math.PI
        );
        this.game.shake.small();
    }
    
    takeDamage(amount) {
        if (this.invincibleTimer > 0 || this.isInvincible) return;
        
        // Shield absorbs damage
        if (this.shield > 0) {
            this.shield--;
            this.game.audio.playImpact();
            this.game.particles.powerupPickup(this.x + this.width/2, this.y + this.height/2, CONFIG.COLORS.DMI_BLUE);
            this.invincibleTimer = 0.5;
            return;
        }
        
        this.hp -= amount;
        this.invincibleTimer = CONFIG.INVINCIBILITY_TIME;
        this.game.audio.playHurt();
        this.game.shake.medium();
        
        if (this.hp <= 0) {
            this.game.gameOver();
        }
    }
    
    addPowerup(type) {
        this.game.audio.playPowerup();
        this.game.particles.powerupPickup(this.x + this.width/2, this.y + this.height/2, CONFIG.COLORS.SAFETY_YELLOW);
        
        switch(type) {
            case 'shield':
                this.shield = Math.min(this.shield + CONFIG.SHIELD_HITS, CONFIG.SHIELD_HITS);
                break;
            case 'range':
                this.rangeBoost = true;
                this.powerupTimers.range = CONFIG.POWERUP_DURATION;
                break;
            case 'damage':
                this.damageBoost = true;
                this.powerupTimers.damage = CONFIG.POWERUP_DURATION;
                break;
            case 'invincible':
                this.isInvincible = true;
                this.powerupTimers.invincible = CONFIG.POWERUP_DURATION;
                break;
            case 'health':
                this.hp = Math.min(this.hp + 1, this.maxHp);
                break;
        }
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    draw(ctx) {
        // Invincibility flash
        if (this.invincibleTimer > 0 && Math.floor(this.flashTimer * 10) % 2 === 0) {
            return;
        }
        
        const sprite = this.game.sprites.drawPlayer(
            ctx,
            Math.floor(this.animFrame),
            this.facingRight,
            this.shootCooldown > CONFIG.SHOOT_COOLDOWN * 0.5
        );
        
        // Shield visual
        if (this.shield > 0) {
            ctx.strokeStyle = CONFIG.COLORS.DMI_BLUE;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5 + Math.sin(this.animFrame) * 0.2;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // Invincibility aura
        if (this.isInvincible) {
            ctx.fillStyle = CONFIG.COLORS.SAFETY_YELLOW;
            ctx.globalAlpha = 0.3 + Math.sin(this.animFrame * 2) * 0.1;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        ctx.drawImage(sprite, Math.floor(this.x - 4), Math.floor(this.y));
    }
}

// ============================================================================
// ENEMY CLASSES
// ============================================================================
class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.hp = 1;
        this.damage = 1;
        this.points = 100;
        this.width = 28;
        this.height = 40;
        this.animFrame = 0;
        this.dead = false;
        this.flashTimer = 0;
    }
    
    update(dt) {
        this.animFrame += dt * 10;
        this.flashTimer = Math.max(0, this.flashTimer - dt);
        
        // Gravity
        this.vy += CONFIG.GRAVITY * dt;
        this.vy = Math.min(this.vy, CONFIG.TERMINAL_VELOCITY);
        
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Platform collision
        for (const platform of this.game.platforms) {
            if (this.vy >= 0 && this.collidesWith(platform)) {
                const bottom = this.y + this.height;
                if (bottom >= platform.y && this.y + this.height - this.vy * dt <= platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                }
            }
        }
        
        // Player collision
        if (this.game.player.collidesWith(this)) {
            this.game.player.takeDamage(this.damage);
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        this.flashTimer = 0.1;
        
        if (this.hp <= 0) {
            this.die();
        } else {
            this.game.audio.playImpact();
        }
    }
    
    die() {
        this.dead = true;
        this.game.player.score += this.points;
        this.game.audio.playEnemyDeath();
        this.game.particles.enemyDeath(this.x + this.width/2, this.y + this.height/2);
        this.game.shake.small();
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    draw(ctx) {
        if (this.flashTimer > 0) {
            ctx.filter = 'brightness(3)';
        }
    }
}

class AngryHomeowner extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.hp = 2;
        this.points = 100;
        this.width = 28;
        this.height = 40;
        this.speed = 60;
        this.throwCooldown = 0;
        this.throwInterval = 2;
    }
    
    update(dt) {
        super.update(dt);
        
        this.throwCooldown -= dt;
        
        // Chase player
        const dx = this.game.player.x - this.x;
        if (Math.abs(dx) < 400) {
            this.vx = dx > 0 ? this.speed : -this.speed;
            
            // Throw objects
            if (this.throwCooldown <= 0 && Math.abs(dx) < 300) {
                this.throwObject();
                this.throwCooldown = this.throwInterval;
            }
        } else {
            this.vx = 0;
        }
    }
    
    throwObject() {
        const direction = this.game.player.x > this.x ? 1 : -1;
        this.game.enemyProjectiles.push(new EnemyProjectile(
            this.game,
            this.x + this.width/2,
            this.y + 10,
            direction * 200,
            -150,
            'wrench'
        ));
    }
    
    draw(ctx) {
        super.draw(ctx);
        const sprite = this.game.sprites.drawAngryHomeowner(ctx, Math.floor(this.animFrame));
        ctx.drawImage(sprite, Math.floor(this.x), Math.floor(this.y));
        ctx.filter = 'none';
    }
}

class AngryForeman extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.hp = 3;
        this.points = 200;
        this.width = 32;
        this.height = 48;
        this.attackCooldown = 0;
        this.attackInterval = 1.5;
    }
    
    update(dt) {
        super.update(dt);
        
        this.attackCooldown -= dt;
        
        const dx = Math.abs(this.game.player.x - this.x);
        
        // Blow whistle (shoot complaint projectiles)
        if (this.attackCooldown <= 0 && dx < 350) {
            this.blowWhistle();
            this.attackCooldown = this.attackInterval;
        }
    }
    
    blowWhistle() {
        const direction = this.game.player.x > this.x ? 1 : -1;
        
        // Multiple complaint waves
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (!this.dead) {
                    this.game.enemyProjectiles.push(new EnemyProjectile(
                        this.game,
                        this.x + this.width/2,
                        this.y + 15,
                        direction * (180 + i * 30),
                        -50 + i * 20,
                        'complaint'
                    ));
                }
            }, i * 150);
        }
    }
    
    draw(ctx) {
        super.draw(ctx);
        const sprite = this.game.sprites.drawForeman(ctx, Math.floor(this.animFrame));
        ctx.drawImage(sprite, Math.floor(this.x), Math.floor(this.y));
        ctx.filter = 'none';
    }
}

class FlyingHardHat extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.hp = 1;
        this.points = 150;
        this.width = 24;
        this.height = 24;
        this.baseY = y;
        this.phase = Math.random() * Math.PI * 2;
        this.swooping = false;
        this.swoopTarget = null;
    }
    
    update(dt) {
        this.animFrame += dt * 10;
        this.flashTimer = Math.max(0, this.flashTimer - dt);
        this.phase += dt * 3;
        
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (!this.swooping && dist < 250) {
            // Start swoop attack
            this.swooping = true;
            this.swoopTarget = { x: this.game.player.x, y: this.game.player.y };
        }
        
        if (this.swooping) {
            // Dive toward target
            const targetDx = this.swoopTarget.x - this.x;
            const targetDy = this.swoopTarget.y - this.y;
            const targetDist = Math.sqrt(targetDx*targetDx + targetDy*targetDy);
            
            if (targetDist > 10) {
                this.vx = (targetDx / targetDist) * 300;
                this.vy = (targetDy / targetDist) * 300;
            } else {
                // Finished swoop, return to hovering
                this.swooping = false;
                this.vy = 0;
            }
        } else {
            // Hovering behavior
            this.y = this.baseY + Math.sin(this.phase) * 30;
            this.vx = dx > 0 ? 50 : -50;
            this.vy = 0;
        }
        
        this.x += this.vx * dt;
        if (this.swooping) {
            this.y += this.vy * dt;
        }
        
        // Player collision
        if (this.game.player.collidesWith(this)) {
            this.game.player.takeDamage(this.damage);
        }
    }
    
    draw(ctx) {
        super.draw(ctx);
        const sprite = this.game.sprites.drawFlyingHardHat(ctx, Math.floor(this.animFrame));
        ctx.drawImage(sprite, Math.floor(this.x), Math.floor(this.y));
        ctx.filter = 'none';
    }
}

class BuildingInspector extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.hp = 4;
        this.points = 300;
        this.width = 28;
        this.height = 44;
        this.attackCooldown = 0;
        this.attackInterval = 2;
    }
    
    update(dt) {
        super.update(dt);
        
        this.attackCooldown -= dt;
        
        const dx = Math.abs(this.game.player.x - this.x);
        
        // Throw violation papers
        if (this.attackCooldown <= 0 && dx < 400) {
            this.throwViolation();
            this.attackCooldown = this.attackInterval;
        }
        
        // Slowly approach
        const playerDx = this.game.player.x - this.x;
        if (Math.abs(playerDx) < 350 && Math.abs(playerDx) > 150) {
            this.vx = playerDx > 0 ? 30 : -30;
        } else {
            this.vx = 0;
        }
    }
    
    throwViolation() {
        const direction = this.game.player.x > this.x ? 1 : -1;
        
        // Spread of violation papers
        for (let i = -1; i <= 1; i++) {
            this.game.enemyProjectiles.push(new EnemyProjectile(
                this.game,
                this.x + this.width/2,
                this.y + 20,
                direction * 150,
                -100 + i * 50,
                'violation'
            ));
        }
    }
    
    draw(ctx) {
        super.draw(ctx);
        const sprite = this.game.sprites.drawBuildingInspector(ctx, Math.floor(this.animFrame));
        ctx.drawImage(sprite, Math.floor(this.x), Math.floor(this.y));
        ctx.filter = 'none';
    }
}

// ============================================================================
// PROJECTILES
// ============================================================================
class Projectile {
    constructor(game, x, y, vx, vy, range, damage, isPlayer) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.range = range;
        this.damage = damage;
        this.isPlayer = isPlayer;
        this.startX = x;
        this.width = 16;
        this.height = 12;
        this.dead = false;
        this.animFrame = 0;
    }
    
    update(dt) {
        this.animFrame += dt * 15;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // Range check
        if (Math.abs(this.x - this.startX) > this.range) {
            this.dead = true;
            return;
        }
        
        // Enemy collision (if player projectile)
        if (this.isPlayer) {
            for (const enemy of this.game.enemies) {
                if (!enemy.dead && this.collidesWith(enemy)) {
                    enemy.takeDamage(this.damage);
                    this.game.particles.drillImpact(this.x, this.y, this.vx > 0 ? 0 : Math.PI);
                    this.dead = true;
                    return;
                }
            }
        }
        
        // Platform collision
        for (const platform of this.game.platforms) {
            if (this.collidesWith(platform)) {
                this.game.particles.drillImpact(this.x, this.y, this.vx > 0 ? 0 : Math.PI);
                this.game.audio.playImpact();
                this.dead = true;
                return;
            }
        }
        
        // Screen bounds
        if (this.x < -50 || this.x > this.game.worldWidth + 50) {
            this.dead = true;
        }
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    draw(ctx) {
        const sprite = this.game.sprites.drawCoreProjectile(ctx, Math.floor(this.animFrame));
        
        ctx.save();
        if (this.vx < 0) {
            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, 0, 0);
        } else {
            ctx.drawImage(sprite, Math.floor(this.x), Math.floor(this.y));
        }
        ctx.restore();
    }
}

class EnemyProjectile {
    constructor(game, x, y, vx, vy, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.width = 12;
        this.height = 12;
        this.dead = false;
        this.lifetime = 5;
        this.rotation = 0;
    }
    
    update(dt) {
        this.lifetime -= dt;
        if (this.lifetime <= 0) {
            this.dead = true;
            return;
        }
        
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vy += 300 * dt; // Gravity
        this.rotation += dt * 10;
        
        // Player collision
        if (this.collidesWith(this.game.player)) {
            this.game.player.takeDamage(1);
            this.dead = true;
            return;
        }
        
        // Platform collision
        for (const platform of this.game.platforms) {
            if (this.collidesWith(platform)) {
                this.dead = true;
                return;
            }
        }
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + 6, this.y + 6);
        ctx.rotate(this.rotation);
        
        if (this.type === 'wrench') {
            ctx.fillStyle = CONFIG.COLORS.STEEL_GRAY;
            ctx.fillRect(-6, -3, 12, 6);
            ctx.fillStyle = CONFIG.COLORS.DARK_CONCRETE;
            ctx.fillRect(-6, -4, 4, 8);
        } else if (this.type === 'complaint') {
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('!', -4, 5);
        } else if (this.type === 'violation') {
            ctx.fillStyle = CONFIG.COLORS.WHITE;
            ctx.fillRect(-5, -6, 10, 12);
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(-4, -4, 8, 2);
            ctx.fillRect(-4, 0, 8, 2);
        }
        
        ctx.restore();
    }
}

// ============================================================================
// POWERUP CLASS
// ============================================================================
class Powerup {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 24;
        this.height = 24;
        this.dead = false;
        this.animFrame = 0;
        this.baseY = y;
    }
    
    update(dt) {
        this.animFrame += dt * 10;
        this.y = this.baseY + Math.sin(this.animFrame * 0.3) * 3;
        
        // Player pickup
        if (this.collidesWith(this.game.player)) {
            this.game.player.addPowerup(this.type);
            this.dead = true;
        }
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    draw(ctx) {
        const sprite = this.game.sprites.drawPowerup(ctx, this.type, Math.floor(this.animFrame));
        ctx.drawImage(sprite, Math.floor(this.x), Math.floor(this.y));
    }
}

// ============================================================================
// PLATFORM CLASS
// ============================================================================
class Platform {
    constructor(game, x, y, width, type = 'concrete') {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 32;
        this.type = type;
        this.sprite = null;
    }
    
    draw(ctx) {
        if (!this.sprite) {
            this.sprite = this.game.sprites.drawPlatform(ctx, this.width, this.type);
        }
        ctx.drawImage(this.sprite, Math.floor(this.x), Math.floor(this.y));
    }
}

// ============================================================================
// BACKGROUND SYSTEM (Parallax)
// ============================================================================
class Background {
    constructor(game) {
        this.game = game;
        this.layers = [];
        this.init();
    }
    
    init() {
        // Layer 1: Sky (0.1x scroll)
        this.layers.push({
            speed: 0.1,
            elements: [
                { type: 'sky' }
            ]
        });
        
        // Layer 2: Distant buildings (0.3x scroll)
        this.layers.push({
            speed: 0.3,
            elements: this.generateBuildings(5, 0.5)
        });
        
        // Layer 3: Mid construction (0.5x scroll)
        this.layers.push({
            speed: 0.5,
            elements: this.generateConstruction()
        });
        
        // Layer 4: Near structures (0.7x scroll)
        this.layers.push({
            speed: 0.7,
            elements: this.generateNearStructures()
        });
    }
    
    generateBuildings(count, alpha) {
        const buildings = [];
        for (let i = 0; i < count; i++) {
            buildings.push({
                type: 'building',
                x: i * 300 + Math.random() * 100,
                width: 80 + Math.random() * 60,
                height: 100 + Math.random() * 150,
                alpha: alpha
            });
        }
        return buildings;
    }
    
    generateConstruction() {
        const elements = [];
        for (let i = 0; i < 3; i++) {
            elements.push({
                type: 'crane',
                x: i * 400 + 100,
                height: 200 + Math.random() * 100
            });
        }
        return elements;
    }
    
    generateNearStructures() {
        const elements = [];
        for (let i = 0; i < 8; i++) {
            elements.push({
                type: 'scaffold',
                x: i * 150,
                width: 60 + Math.random() * 40,
                height: 80 + Math.random() * 60
            });
        }
        return elements;
    }
    
    draw(ctx, cameraX) {
        const C = CONFIG.COLORS;
        
        // Draw each layer
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            const offsetX = cameraX * layer.speed;
            
            for (const elem of layer.elements) {
                const drawX = elem.x - offsetX;
                
                // Wrap elements for infinite scrolling
                const wrappedX = ((drawX % 1600) + 1600) % 1600 - 400;
                
                if (elem.type === 'sky') {
                    // Gradient sky
                    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.GAME_HEIGHT);
                    gradient.addColorStop(0, '#87CEEB');
                    gradient.addColorStop(0.6, '#B0E0E6');
                    gradient.addColorStop(1, '#E0E8F0');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
                    
                    // Sun
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(650, 60, 30, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Clouds
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.drawCloud(ctx, (100 - offsetX * 0.05) % 900, 50);
                    this.drawCloud(ctx, (400 - offsetX * 0.03) % 900, 80);
                    this.drawCloud(ctx, (700 - offsetX * 0.04) % 900, 40);
                } else if (elem.type === 'building') {
                    ctx.fillStyle = `rgba(92, 92, 92, ${elem.alpha})`;
                    ctx.fillRect(wrappedX, CONFIG.GAME_HEIGHT - elem.height, elem.width, elem.height);
                    
                    // Windows
                    ctx.fillStyle = `rgba(255, 255, 200, ${elem.alpha * 0.5})`;
                    for (let wy = 0; wy < elem.height - 20; wy += 20) {
                        for (let wx = 10; wx < elem.width - 10; wx += 15) {
                            if (Math.random() > 0.3) {
                                ctx.fillRect(wrappedX + wx, CONFIG.GAME_HEIGHT - elem.height + wy + 10, 8, 12);
                            }
                        }
                    }
                } else if (elem.type === 'crane') {
                    ctx.fillStyle = C.SAFETY_YELLOW;
                    // Vertical tower
                    ctx.fillRect(wrappedX, CONFIG.GAME_HEIGHT - elem.height, 15, elem.height);
                    // Horizontal arm
                    ctx.fillRect(wrappedX - 30, CONFIG.GAME_HEIGHT - elem.height, 120, 10);
                    // Counter weight
                    ctx.fillStyle = C.CONCRETE_GRAY;
                    ctx.fillRect(wrappedX - 25, CONFIG.GAME_HEIGHT - elem.height + 10, 20, 15);
                } else if (elem.type === 'scaffold') {
                    ctx.fillStyle = C.STEEL_GRAY;
                    ctx.globalAlpha = 0.6;
                    ctx.fillRect(wrappedX, CONFIG.GAME_HEIGHT - elem.height, 4, elem.height);
                    ctx.fillRect(wrappedX + elem.width, CONFIG.GAME_HEIGHT - elem.height, 4, elem.height);
                    
                    // Horizontal bars
                    for (let h = 0; h < elem.height; h += 25) {
                        ctx.fillRect(wrappedX, CONFIG.GAME_HEIGHT - elem.height + h, elem.width + 4, 3);
                    }
                    ctx.globalAlpha = 1;
                }
            }
        }
    }
    
    drawCloud(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 25, y - 10, 30, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 25, y + 10, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================================================
// INPUT HANDLER
// ============================================================================
class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.touch = {
            moving: false,
            moveX: 0,
            shooting: false,
            jumping: false
        };
        this.jumpPressed = false;
        this.lastJumpState = false;
        
        this.init();
    }
    
    init() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('mousedown', (e) => {
            this.game.audio.resume();
            this.touch.shooting = true;
        });
        canvas.addEventListener('mouseup', () => {
            this.touch.shooting = false;
        });
        
        // Touch controls
        const moveZone = document.getElementById('moveZone');
        const actionZone = document.getElementById('actionZone');
        const jumpZone = document.getElementById('jumpZone');
        
        // Movement zone
        moveZone?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.audio.resume();
            this.handleMoveTouch(e.touches[0]);
        });
        moveZone?.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMoveTouch(e.touches[0]);
        });
        moveZone?.addEventListener('touchend', () => {
            this.touch.moving = false;
            this.touch.moveX = 0;
        });
        
        // Action zone (shoot)
        actionZone?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.audio.resume();
            this.touch.shooting = true;
        });
        actionZone?.addEventListener('touchend', () => {
            this.touch.shooting = false;
        });
        
        // Jump zone
        jumpZone?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.audio.resume();
            this.touch.jumping = true;
        });
        jumpZone?.addEventListener('touchend', () => {
            this.touch.jumping = false;
        });
    }
    
    handleMoveTouch(touch) {
        const zone = document.getElementById('moveZone');
        const rect = zone.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        
        this.touch.moving = true;
        this.touch.moveX = (touch.clientX - centerX) / (rect.width / 2);
    }
    
    getInput() {
        const currentJump = this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW'] || this.touch.jumping;
        this.jumpPressed = currentJump && !this.lastJumpState;
        this.lastJumpState = currentJump;
        
        return {
            left: this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touch.moveX < -0.3,
            right: this.keys['ArrowRight'] || this.keys['KeyD'] || this.touch.moveX > 0.3,
            up: this.keys['ArrowUp'] || this.keys['KeyW'],
            down: this.keys['ArrowDown'] || this.keys['KeyS'],
            jump: currentJump,
            jumpPressed: this.jumpPressed,
            shoot: this.keys['KeyX'] || this.keys['KeyZ'] || this.touch.shooting || this.game.mouseDown
        };
    }
}

// ============================================================================
// HUD
// ============================================================================
class HUD {
    draw(ctx, player) {
        const C = CONFIG.COLORS;
        
        // Health bar background
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(10, 10, 124, 20);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 124, 20);
        
        // Health bar fill
        const healthPercent = player.hp / player.maxHp;
        const gradient = ctx.createLinearGradient(12, 12, 12, 28);
        gradient.addColorStop(0, healthPercent > 0.3 ? C.DMI_ORANGE : '#FF0000');
        gradient.addColorStop(1, healthPercent > 0.3 ? '#CC5500' : '#AA0000');
        ctx.fillStyle = gradient;
        ctx.fillRect(12, 12, 120 * healthPercent, 16);
        
        // Health segments
        ctx.strokeStyle = '#2C2C2C';
        ctx.lineWidth = 2;
        for (let i = 1; i < player.maxHp; i++) {
            const x = 12 + (120 / player.maxHp) * i;
            ctx.beginPath();
            ctx.moveTo(x, 12);
            ctx.lineTo(x, 28);
            ctx.stroke();
        }
        
        // Shield indicator
        if (player.shield > 0) {
            ctx.fillStyle = C.DMI_BLUE;
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`🛡️ x${player.shield}`, 140, 25);
        }
        
        // Power-up indicators
        let indicatorX = 10;
        const indicatorY = 35;
        
        if (player.rangeBoost) {
            this.drawPowerupIndicator(ctx, indicatorX, indicatorY, C.SAFETY_YELLOW, 'R', player.powerupTimers.range);
            indicatorX += 30;
        }
        if (player.damageBoost) {
            this.drawPowerupIndicator(ctx, indicatorX, indicatorY, C.DMI_ORANGE, 'D', player.powerupTimers.damage);
            indicatorX += 30;
        }
        if (player.isInvincible) {
            this.drawPowerupIndicator(ctx, indicatorX, indicatorY, C.WHITE, 'I', player.powerupTimers.invincible);
            indicatorX += 30;
        }
        
        // Score
        ctx.fillStyle = C.WHITE;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`SCORE: ${player.score}`, CONFIG.GAME_WIDTH - 10, 28);
        ctx.textAlign = 'left';
        
        // Wave indicator
        if (this.game) {
            ctx.fillStyle = C.SAFETY_YELLOW;
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`WAVE ${this.game.wave}`, CONFIG.GAME_WIDTH - 100, 50);
        }
    }
    
    drawPowerupIndicator(ctx, x, y, color, letter, timer) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, y, 25, 25);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 25, 25);
        
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(letter, x + 8, y + 18);
        
        // Timer bar
        const timerPercent = timer / CONFIG.POWERUP_DURATION;
        ctx.fillStyle = color;
        ctx.fillRect(x, y + 25, 25 * timerPercent, 3);
    }
}

// ============================================================================
// MAIN GAME CLASS
// ============================================================================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Systems
        this.audio = new AudioEngine();
        this.audio.init();
        this.sprites = new SpriteRenderer();
        this.particles = new ParticleSystem();
        this.shake = new ScreenShake();
        this.input = new InputHandler(this);
        this.background = new Background(this);
        this.hud = new HUD();
        this.hud.game = this;
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover
        this.worldWidth = 2000;
        this.cameraX = 0;
        this.wave = 1;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.enemiesRemaining = 0;
        
        // Entities
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.powerups = [];
        this.platforms = [];
        
        // Mouse tracking
        this.mouseDown = false;
        this.canvas.addEventListener('mousedown', () => this.mouseDown = true);
        this.canvas.addEventListener('mouseup', () => this.mouseDown = false);
        this.canvas.addEventListener('mouseleave', () => this.mouseDown = false);
        
        // UI buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        
        // Pause on ESC
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.state === 'playing') {
                this.pauseGame();
            } else if (e.code === 'Escape' && this.state === 'paused') {
                this.resumeGame();
            }
        });
        
        // Start game loop
        this.lastTime = 0;
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    resize() {
        const container = document.getElementById('gameContainer');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scale = Math.min(
            containerWidth / CONFIG.GAME_WIDTH,
            containerHeight / CONFIG.GAME_HEIGHT
        );
        
        this.canvas.width = CONFIG.GAME_WIDTH;
        this.canvas.height = CONFIG.GAME_HEIGHT;
        this.canvas.style.width = `${CONFIG.GAME_WIDTH * scale}px`;
        this.canvas.style.height = `${CONFIG.GAME_HEIGHT * scale}px`;
        
        this.ctx.imageSmoothingEnabled = false;
    }
    
    startGame() {
        this.state = 'playing';
        this.wave = 1;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        
        // Hide screens
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        // Reset entities
        this.player = new Player(this, 100, 300);
        this.enemies = [];
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.powerups = [];
        
        // Create level
        this.createLevel();
        
        // Start first wave
        this.startWave();
        
        this.audio.resume();
    }
    
    createLevel() {
        this.platforms = [];
        
        // Ground
        this.platforms.push(new Platform(this, 0, 400, 2000, 'concrete'));
        
        // Floating platforms
        this.platforms.push(new Platform(this, 150, 320, 150, 'scaffold'));
        this.platforms.push(new Platform(this, 400, 280, 200, 'concrete'));
        this.platforms.push(new Platform(this, 700, 320, 120, 'scaffold'));
        this.platforms.push(new Platform(this, 900, 250, 180, 'concrete'));
        this.platforms.push(new Platform(this, 1150, 300, 150, 'scaffold'));
        this.platforms.push(new Platform(this, 1400, 280, 200, 'concrete'));
        this.platforms.push(new Platform(this, 1650, 320, 150, 'scaffold'));
        
        // Higher platforms
        this.platforms.push(new Platform(this, 300, 180, 100, 'scaffold'));
        this.platforms.push(new Platform(this, 550, 150, 120, 'concrete'));
        this.platforms.push(new Platform(this, 1000, 150, 150, 'scaffold'));
        this.platforms.push(new Platform(this, 1300, 180, 100, 'concrete'));
    }
    
    startWave() {
        // Calculate enemies for this wave
        const baseEnemies = 3 + this.wave * 2;
        this.enemiesRemaining = baseEnemies;
        this.waveTimer = 3; // Countdown before spawning
        
        // Show wave indicator
        console.log(`Starting Wave ${this.wave} with ${this.enemiesRemaining} enemies`);
    }
    
    spawnEnemy() {
        if (this.enemiesRemaining <= 0) return;
        
        const types = ['homeowner', 'foreman', 'hardhat', 'inspector'];
        const weights = [
            Math.max(0.4 - this.wave * 0.03, 0.1),  // homeowner (more common early)
            Math.max(0.2, 0.1 + this.wave * 0.02),  // foreman
            Math.min(0.2 + this.wave * 0.05, 0.4),  // hardhat (more common later)
            Math.min(0.1 + this.wave * 0.03, 0.3)   // inspector
        ];
        
        // Weighted random selection
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        let selectedType = types[0];
        
        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                selectedType = types[i];
                break;
            }
        }
        
        // Spawn position (away from player)
        let spawnX;
        if (this.player.x < this.worldWidth / 2) {
            spawnX = this.player.x + 500 + Math.random() * 300;
        } else {
            spawnX = this.player.x - 500 - Math.random() * 300;
        }
        spawnX = Math.max(50, Math.min(this.worldWidth - 50, spawnX));
        
        let enemy;
        switch (selectedType) {
            case 'homeowner':
                enemy = new AngryHomeowner(this, spawnX, 100);
                break;
            case 'foreman':
                enemy = new AngryForeman(this, spawnX, 100);
                break;
            case 'hardhat':
                enemy = new FlyingHardHat(this, spawnX, 150);
                break;
            case 'inspector':
                enemy = new BuildingInspector(this, spawnX, 100);
                break;
        }
        
        this.enemies.push(enemy);
        this.enemiesRemaining--;
    }
    
    spawnPowerup() {
        const types = ['shield', 'range', 'damage', 'invincible', 'health'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Random platform position
        const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
        const x = platform.x + Math.random() * (platform.width - 24);
        const y = platform.y - 40;
        
        this.powerups.push(new Powerup(this, x, y, type));
    }
    
    pauseGame() {
        this.state = 'paused';
        document.getElementById('pauseScreen').classList.remove('hidden');
    }
    
    resumeGame() {
        this.state = 'playing';
        document.getElementById('pauseScreen').classList.add('hidden');
    }
    
    gameOver() {
        this.state = 'gameover';
        
        // Update high score
        const highScore = parseInt(localStorage.getItem('coreDrillerHighScore') || '0');
        if (this.player.score > highScore) {
            localStorage.setItem('coreDrillerHighScore', this.player.score.toString());
        }
        
        document.getElementById('finalScore').textContent = this.player.score;
        document.getElementById('highScore').textContent = Math.max(highScore, this.player.score);
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    gameLoop(currentTime) {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
        this.lastTime = currentTime;
        
        if (this.state === 'playing') {
            this.update(dt);
        }
        
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    update(dt) {
        const input = this.input.getInput();
        
        // Update wave system
        this.waveTimer -= dt;
        if (this.waveTimer <= 0) {
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0 && this.enemiesRemaining > 0) {
                this.spawnEnemy();
                this.spawnTimer = 1.5 - Math.min(this.wave * 0.1, 1); // Faster spawns in later waves
            }
        }
        
        // Check wave completion
        if (this.enemiesRemaining <= 0 && this.enemies.length === 0) {
            this.wave++;
            this.startWave();
            
            // Bonus powerup between waves
            this.spawnPowerup();
        }
        
        // Random powerup spawns
        if (Math.random() < 0.001 * dt * 60) {
            this.spawnPowerup();
        }
        
        // Update entities
        this.player.update(dt, input);
        
        this.enemies.forEach(e => e.update(dt));
        this.enemies = this.enemies.filter(e => !e.dead);
        
        this.projectiles.forEach(p => p.update(dt));
        this.projectiles = this.projectiles.filter(p => !p.dead);
        
        this.enemyProjectiles.forEach(p => p.update(dt));
        this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.dead);
        
        this.powerups.forEach(p => p.update(dt));
        this.powerups = this.powerups.filter(p => !p.dead);
        
        // Update systems
        this.particles.update(dt);
        this.shake.update(dt);
        
        // Camera follow
        const targetCameraX = this.player.x - CONFIG.GAME_WIDTH / 3;
        this.cameraX += (targetCameraX - this.cameraX) * 0.1;
        this.cameraX = Math.max(0, Math.min(this.worldWidth - CONFIG.GAME_WIDTH, this.cameraX));
    }
    
    render() {
        const ctx = this.ctx;
        
        // Clear
        ctx.fillStyle = CONFIG.COLORS.SKY_BLUE;
        ctx.fillRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        
        // Apply screen shake
        ctx.save();
        ctx.translate(this.shake.offsetX, this.shake.offsetY);
        
        // Background (parallax)
        this.background.draw(ctx, this.cameraX);
        
        if (this.state === 'playing' || this.state === 'paused' || this.state === 'gameover') {
            // Camera transform
            ctx.save();
            ctx.translate(-this.cameraX, 0);
            
            // Platforms
            this.platforms.forEach(p => p.draw(ctx));
            
            // Powerups
            this.powerups.forEach(p => p.draw(ctx));
            
            // Enemies
            this.enemies.forEach(e => e.draw(ctx));
            
            // Projectiles
            this.projectiles.forEach(p => p.draw(ctx));
            this.enemyProjectiles.forEach(p => p.draw(ctx));
            
            // Player
            this.player.draw(ctx);
            
            // Particles
            this.particles.draw(ctx);
            
            ctx.restore();
            
            // HUD (not affected by camera)
            this.hud.draw(ctx, this.player);
            
            // Wave announcement
            if (this.waveTimer > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(CONFIG.GAME_WIDTH/2 - 100, CONFIG.GAME_HEIGHT/2 - 30, 200, 60);
                ctx.fillStyle = CONFIG.COLORS.SAFETY_YELLOW;
                ctx.font = 'bold 32px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`WAVE ${this.wave}`, CONFIG.GAME_WIDTH/2, CONFIG.GAME_HEIGHT/2 + 10);
                ctx.textAlign = 'left';
            }
        }
        
        ctx.restore();
    }
}

// ============================================================================
// START THE GAME
// ============================================================================
window.addEventListener('load', () => {
    window.game = new Game();
});
