// Sound Manager for Tetris Game

class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        
        // Initialize sound effects
        this.loadSounds();
    }
    
    loadSounds() {
        // Define all game sounds
        const soundFiles = {
            move: 'Audio/move.mp3',
            rotate: 'Audio/rotate.mp3',
            hardDrop: 'Audio/hard-drop.mp3',
            lineClear: 'Audio/line-clear.mp3',
            undo: 'Audio/undo.mp3'
        };
        
        // Create audio elements for each sound
        for (const [name, path] of Object.entries(soundFiles)) {
            const audio = new Audio(path);
            audio.volume = 0.5; // Set default volume
            this.sounds[name] = audio;
        }
    }
    
    play(soundName) {
        if (this.muted || !this.sounds[soundName]) return;
        
        // Clone the audio to allow overlapping sounds
        const sound = this.sounds[soundName].cloneNode();
        sound.volume = this.sounds[soundName].volume;
        sound.play().catch(e => {
            console.log(`Sound playback failed: ${soundName}`, e);
        });
    }
    
    setVolume(volume) {
        // Set volume for all sounds (0.0 to 1.0)
        const vol = Math.max(0, Math.min(1, volume));
        for (const sound of Object.values(this.sounds)) {
            sound.volume = vol;
        }
    }
    
    mute() {
        this.muted = true;
    }
    
    unmute() {
        this.muted = false;
    }
    
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

// Export the sound manager
const soundManager = new SoundManager();