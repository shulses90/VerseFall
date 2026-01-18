export type TrackName = 'menu' | 'tension' | 'battle' | 'victory' | 'defeat' | 'aethelgard' | 'veridian' | 'chronomach' | 'celestial' | 'weavers' | 'pantheon';

// --- AUDIO CONTEXT & GLOBAL STATE ---
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;
let reverbNode: ConvolverNode | null = null;

// Sequencer State
let isPlaying = false;
let currentTrackName: TrackName | null = null;
let nextNoteTime = 0.0;
let current16thNote = 0; 
let measureCount = 0; 
let timerID: number | null = null;
let activeNodes: AudioNode[] = []; 

// Global Settings
let isMutedGlobally = false;
let globalVolume = 0.30; 

// --- MUSIC THEORY HELPERS ---
const mtof = (note: number) => 440 * Math.pow(2, (note - 69) / 12);
const N = null; // Rest

// Composition Helpers to build long structures
const seq = <T>(...parts: T[][]): T[] => parts.flat();
const rep = <T>(part: T[], times: number): T[] => (Array(times).fill(part) as T[][]).flat();
const trans = (part: (number | null)[], semitones: number) => part.map(n => n === null ? null : (n as number) + semitones);
const sil = (steps: number) => Array(steps).fill(null);

// --- REVERB (The "SNES/GBA" Atmosphere) ---
const createImpulseResponse = (duration: number, decay: number) => {
    if (!audioCtx) return null;
    const length = audioCtx.sampleRate * duration;
    const impulse = audioCtx.createBuffer(2, length, audioCtx.sampleRate);
    const L = impulse.getChannelData(0);
    const R = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
        const n = i;
        const e = Math.pow(1 - n / length, decay);
        L[i] = (Math.random() * 2 - 1) * e;
        R[i] = (Math.random() * 2 - 1) * e;
    }
    return impulse;
};

// --- INSTRUMENTS (Sound Design) ---
// Sakuraba style relies on: Sharp Brass, Breathy Flutes, Fast Arps, Rock Organs.

const Instruments = {
    // RPG Flute: Triangle wave + white noise breath + heavy vibrato
    flute: (ctx: AudioContext, dest: AudioNode, note: number, time: number, dur: number) => {
        const osc = ctx.createOscillator();
        const noise = ctx.createBufferSource();
        const env = ctx.createGain();
        const noiseGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Tone
        osc.type = 'triangle';
        osc.frequency.value = mtof(note);

        // Vibrato (Essential for the style)
        const vib = ctx.createOscillator();
        const vibGain = ctx.createGain();
        vib.frequency.value = 6; // 6Hz vibrato
        vibGain.gain.value = 6; // Depth
        vib.connect(vibGain).connect(osc.frequency);
        vib.start(time); 
        vib.stop(time + dur);

        // Breath Noise
        const bSize = ctx.sampleRate * 2;
        const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
        const d = b.getChannelData(0);
        for(let i=0; i<bSize; i++) d[i] = Math.random() * 2 - 1;
        noise.buffer = b;
        noise.loop = true;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 2000;
        noise.connect(noiseFilter).connect(noiseGain);
        noiseGain.gain.value = 0.05; // Subtle breath
        noiseGain.connect(env);

        // Routing
        osc.connect(env);
        env.connect(dest);

        // Envelope (Soft attack)
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(0.3, time + 0.1);
        env.gain.setValueAtTime(0.3, time + dur - 0.1);
        env.gain.linearRampToValueAtTime(0, time + dur + 0.1);

        osc.start(time);
        noise.start(time);
        osc.stop(time + dur + 0.2);
        noise.stop(time + dur + 0.2);
        activeNodes.push(osc, noise, env, vib);
    },

    // Heroic Brass: Sawtooths, slightly detuned, filter swells
    brass: (ctx: AudioContext, dest: AudioNode, note: number, time: number, dur: number, vol: number = 0.3) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const env = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.value = mtof(note);
        osc2.frequency.value = mtof(note) * 1.004; // Detune for thickness

        filter.type = 'lowpass';
        filter.Q.value = 2;
        filter.frequency.setValueAtTime(600, time);
        filter.frequency.linearRampToValueAtTime(3000, time + 0.1); // "Blat" sound
        filter.frequency.exponentialRampToValueAtTime(800, time + dur);

        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(vol, time + 0.05);
        env.gain.exponentialRampToValueAtTime(vol * 0.5, time + 0.3); // Decay to sustain
        env.gain.linearRampToValueAtTime(0, time + dur + 0.1);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(env).connect(dest);
        
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + dur + 0.2);
        osc2.stop(time + dur + 0.2);
        activeNodes.push(osc1, osc2, env);
    },

    // Harp/Pluck: Fast attack, long decay
    harp: (ctx: AudioContext, dest: AudioNode, note: number, time: number, dur: number) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'triangle'; 
        osc.frequency.value = mtof(note);

        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(0.3, time + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, time + 2.0); // Ring out

        osc.connect(env).connect(dest);
        osc.start(time);
        osc.stop(time + 2.0);
        activeNodes.push(osc, env);
    },

    // Prog Bass: Punchy square/saw hybrid
    bass: (ctx: AudioContext, dest: AudioNode, note: number, time: number, dur: number) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const env = ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = mtof(note - 12); // Sub octave

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, time);
        filter.frequency.exponentialRampToValueAtTime(1000, time + 0.05); // Slap
        filter.frequency.exponentialRampToValueAtTime(300, time + 0.2);

        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(0.5, time + 0.02);
        env.gain.linearRampToValueAtTime(0, time + dur + 0.05);

        osc.connect(filter).connect(env).connect(dest);
        osc.start(time);
        osc.stop(time + dur + 0.1);
        activeNodes.push(osc, env);
    },

    // Strings/Pad: Slow attack, rich
    strings: (ctx: AudioContext, dest: AudioNode, note: number, time: number, dur: number, vol: number = 0.2) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const env = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.value = mtof(note);
        osc2.frequency.value = mtof(note) * 1.01; // Detune

        // High shelf to tame harshness
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(vol, time + 0.4); // Slow attack
        env.gain.linearRampToValueAtTime(vol, time + dur - 0.2);
        env.gain.linearRampToValueAtTime(0, time + dur + 0.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(env).connect(dest);
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + dur + 0.6);
        osc2.stop(time + dur + 0.6);
        activeNodes.push(osc1, osc2, env);
    },
    
    // Drums
    drum: (ctx: AudioContext, dest: AudioNode, type: 'kick'|'snare'|'hat'|'timpani', time: number) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        
        if (type === 'kick') {
            osc.frequency.setValueAtTime(120, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
            env.gain.setValueAtTime(0.8, time);
            env.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
            osc.connect(env).connect(dest);
        } else if (type === 'snare') {
            const noise = ctx.createBufferSource();
            const bSize = ctx.sampleRate * 0.5;
            const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
            const d = b.getChannelData(0);
            for(let i=0; i<bSize; i++) d[i] = Math.random()*2-1;
            noise.buffer = b;
            const f = ctx.createBiquadFilter();
            f.type = 'highpass';
            f.frequency.value = 1000;
            env.gain.setValueAtTime(0.5, time);
            env.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
            noise.connect(f).connect(env).connect(dest);
            noise.start(time);
            return;
        } else if (type === 'hat') {
             const noise = ctx.createBufferSource();
            const bSize = ctx.sampleRate * 0.1;
            const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
            const d = b.getChannelData(0);
            for(let i=0; i<bSize; i++) d[i] = Math.random()*2-1;
            noise.buffer = b;
            const f = ctx.createBiquadFilter();
            f.type = 'highpass';
            f.frequency.value = 6000;
            env.gain.setValueAtTime(0.2, time);
            env.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            noise.connect(f).connect(env).connect(dest);
            noise.start(time);
            return;
        } else if (type === 'timpani') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, time);
            osc.frequency.linearRampToValueAtTime(60, time + 0.1); // Pitch drop
            env.gain.setValueAtTime(0.8, time);
            env.gain.linearRampToValueAtTime(0, time + 1.0);
            osc.connect(env).connect(dest);
        }
        osc.start(time);
        osc.stop(time + 1.0);
        activeNodes.push(osc, env);
    }
}

// --- SEQUENCER DATA (The "Score") ---

interface TrackData {
    bpm: number;
    loopStartBar: number; // Bar index to loop back to
    sections: {
        name: string;
        bars: number; // How many bars in this section
        // Each array is 16 steps per bar * numBars
        lead?: (number | null)[]; // Melody
        harmony?: (number | null)[]; // Chords/Arps
        bass?: (number | null)[]; // Bassline
        drums?: (string | null)[]; // Kick/Snare pattern
    }[];
}

// --- COMPOSITIONS ---

const THEMES: Record<string, TrackData> = {

    // === VERIDIAN: "Whispers of the Old World" ===
    // 3/4 feel (12/16). E Dorian.
    // Structure: Intro (2) -> A (4) -> B (4) -> A' (4) -> Bridge (4) -> Loop
    veridian: {
        bpm: 90,
        loopStartBar: 2,
        sections: [
            {
                name: 'Intro', bars: 2,
                harmony: seq(
                    // Harp rolling Em7
                    [64,N,67,71, 64,N,67,71, 64,N,67,71, 64,N,67,71],
                    [62,N,66,69, 62,N,66,69, 62,N,66,69, 62,N,66,69]
                ),
                bass: seq(
                    [40,N,N,N,N,N,N,N, 40,N,N,N,N,N,N,N],
                    [38,N,N,N,N,N,N,N, 38,N,N,N,N,N,N,N]
                )
            },
            {
                name: 'Theme A', bars: 8,
                lead: seq(
                    // Melody (Flute)
                    [76,N,N,79, 76,N,N,74, 71,N,N,N, N,N,N,N], // E... G E D B
                    [69,N,N,71, 74,N,N,76, 74,N,71,N, 69,N,N,N], // A... B D E D B A
                    [76,N,N,79, 81,N,N,79, 76,N,N,74, 71,N,N,N], // E... G A G E D B
                    [67,N,N,69, 71,N,N,74, 76,N,N,N, N,N,N,N],   // G... A B D E...
                    // Repeat var
                    [76,N,N,79, 76,N,N,74, 71,N,N,N, N,N,N,N],
                    [69,N,N,71, 74,N,N,76, 74,N,71,N, 69,N,N,N],
                    [67,N,N,N, 69,N,N,N, 71,N,N,N, 74,N,N,N],
                    [76,N,N,N, N,N,N,N, N,N,N,N, N,N,N,N]
                ),
                harmony: rep(seq(
                    [64,N,67,71, 64,N,67,71, 64,N,67,71, 64,N,67,71],
                    [62,N,66,69, 62,N,66,69, 62,N,66,69, 62,N,66,69],
                    [60,N,64,67, 60,N,64,67, 60,N,64,67, 60,N,64,67],
                    [59,N,62,66, 59,N,62,66, 59,N,62,66, 59,N,62,66]
                ), 2),
                bass: rep(seq(
                    [40,N,N,N, 47,N,N,N, 40,N,N,N, 47,N,N,N],
                    [38,N,N,N, 45,N,N,N, 38,N,N,N, 45,N,N,N],
                    [36,N,N,N, 43,N,N,N, 36,N,N,N, 43,N,N,N],
                    [35,N,N,N, 42,N,N,N, 35,N,N,N, 42,N,N,N]
                ), 2)
            },
            {
                name: 'Bridge', bars: 4,
                harmony: seq(
                    // Strings Swell
                    [60,N,64,67, 72,N,67,64, 60,N,N,N, N,N,N,N], // C Maj
                    [57,N,60,64, 69,N,64,60, 57,N,N,N, N,N,N,N], // Am
                    [62,N,66,69, 74,N,69,66, 62,N,N,N, N,N,N,N], // D Maj
                    [59,N,62,66, 71,N,66,62, 59,N,N,N, N,N,N,N]  // B7
                ),
                bass: seq(
                    [48,N,N,N,N,N,N,N, 48,N,N,N,N,N,N,N],
                    [45,N,N,N,N,N,N,N, 45,N,N,N,N,N,N,N],
                    [50,N,N,N,N,N,N,N, 50,N,N,N,N,N,N,N],
                    [47,N,N,N,N,N,N,N, 47,N,N,N,N,N,N,N]
                )
            }
        ]
    },

    // === PANTHEON: "Glorious Ascent" ===
    // Heroic March. G Major.
    pantheon: {
        bpm: 110,
        loopStartBar: 2,
        sections: [
            {
                name: 'Intro', bars: 2,
                drums: seq(
                    ['snare',N,'snare',N, 'snare',N,'snare',N, 'snare',N,'snare',N, 'snare',N,'snare',N],
                    ['snare','snare','snare','snare', 'snare','snare','snare','snare', 'timpani',N,'timpani',N, 'kick',N,'kick',N]
                ),
                bass: seq(
                    [43,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],
                    [43,N,N,N,N,N,N,N, 55,N,55,N, 43,N,N,N]
                )
            },
            {
                name: 'Theme A (Fanfare)', bars: 8,
                lead: seq(
                    [67,N,N,67, 67,N,71,72, 74,N,N,N, 67,N,N,N], // G G G B C D... G...
                    [76,N,74,72, 74,N,72,71, 72,N,N,N, 67,N,N,N], // E D C D C B C... G...
                    [79,N,N,N, 74,N,N,N, 76,N,74,72, 71,N,N,N],   // High G... D... E D C B...
                    [69,67,69,71, 72,71,72,74, 76,N,74,N, 79,N,N,N], // Run up
                    // Repeat with variation
                    [67,N,N,67, 67,N,71,72, 74,N,N,N, 67,N,N,N],
                    [76,N,74,72, 74,N,72,71, 72,N,N,N, 67,N,N,N],
                    [64,N,66,N, 67,N,69,N, 71,N,72,N, 74,N,76,N],
                    [79,N,N,N, N,N,N,N, 79,N,N,N, 67,N,N,N]
                ),
                bass: rep(seq(
                    [43,N,43,N, 43,N,43,N, 43,N,43,N, 43,N,43,N],
                    [48,N,48,N, 48,N,48,N, 43,N,43,N, 43,N,43,N],
                    [43,N,43,N, 50,N,50,N, 48,N,48,N, 47,N,47,N],
                    [45,N,45,N, 47,N,47,N, 50,N,50,N, 43,N,N,N]
                ), 2),
                drums: rep(seq(
                    ['kick',N,'snare',N, 'kick',N,'snare',N, 'kick',N,'snare',N, 'kick',N,'snare',N],
                    ['kick',N,'snare',N, 'kick',N,'snare',N, 'kick',N,'snare',N, 'kick',N,'snare',N],
                    ['kick',N,'snare',N, 'kick',N,'snare',N, 'kick',N,'snare',N, 'kick',N,'snare',N],
                    ['kick',N,'snare',N, 'kick',N,'snare',N, 'snare','snare','snare','snare', 'kick','snare','kick','snare']
                ), 2)
            },
            {
                name: 'Theme B (March)', bars: 4,
                lead: seq(
                    [60,N,N,N, 62,N,N,N, 64,N,N,N, 60,N,N,N],
                    [59,N,N,N, 60,N,N,N, 62,N,N,N, 59,N,N,N],
                    [57,N,59,N, 60,N,62,N, 64,N,65,N, 67,N,69,N],
                    [72,N,N,N, 71,N,N,N, 72,N,N,N, N,N,N,N]
                ),
                harmony: seq(
                    [52,55,52,55, 52,55,52,55, 52,55,52,55, 52,55,52,55],
                    [50,54,50,54, 50,54,50,54, 50,54,50,54, 50,54,50,54],
                    [48,52,48,52, 48,52,48,52, 48,52,48,52, 48,52,48,52],
                    [47,50,47,50, 47,50,47,50, 47,50,47,50, 47,50,47,50]
                ),
                drums: rep(seq(
                    ['timpani',N,N,N, 'timpani',N,N,N, 'snare',N,'snare',N, 'snare',N,'snare',N]
                ), 4)
            }
        ]
    },

    // === AETHELGARD: "Engines of War" ===
    // Industrial, C Minor. Driving.
    aethelgard: {
        bpm: 125,
        loopStartBar: 2,
        sections: [
            {
                name: 'Intro', bars: 2,
                bass: seq(
                    [36,N,36,N, 36,N,36,N, 36,N,36,N, 39,38,36,N],
                    [36,N,36,N, 36,N,36,N, 36,N,36,N, 43,41,39,N]
                ),
                drums: seq(
                    ['kick',N,N,N, 'kick',N,N,N, 'kick',N,N,N, 'snare',N,'snare',N],
                    ['kick',N,N,N, 'kick',N,N,N, 'kick',N,N,N, 'snare',N,'snare',N]
                )
            },
            {
                name: 'Main Riff', bars: 8,
                lead: seq(
                    [N,N,N,N, 60,N,N,N, N,N,N,N, 63,N,62,N], // Stabs
                    [N,N,N,N, 60,N,N,N, N,N,N,N, 58,N,55,N],
                    [60,N,60,N, 67,N,N,N, 60,N,60,N, 65,N,N,N],
                    [60,N,60,N, 63,N,N,N, 62,60,58,60, 62,N,N,N],
                    [N,N,N,N, 60,N,N,N, N,N,N,N, 63,N,62,N],
                    [N,N,N,N, 60,N,N,N, N,N,N,N, 58,N,55,N],
                    [60,60,63,63, 65,65,67,67, 72,N,N,N, 70,N,N,N],
                    [67,N,N,N, 65,N,N,N, 63,N,N,N, 62,N,N,N]
                ),
                bass: rep(seq(
                    [36,N,36,N, 36,N,36,N, 36,N,36,N, 39,N,38,N],
                    [36,N,36,N, 36,N,36,N, 36,N,36,N, 34,N,31,N],
                    [36,36,N,36, N,36,N,36, 36,36,N,36, N,36,N,36],
                    [36,36,N,36, N,36,N,36, 38,38,N,38, 43,43,43,N]
                ), 2),
                drums: rep(seq(
                    ['kick',N,'snare',N, 'kick',N,'snare',N, 'kick',N,'snare',N, 'kick','kick','snare',N],
                    ['kick',N,'snare',N, 'kick',N,'snare',N, 'kick',N,'snare',N, 'snare','snare','snare','snare'],
                    ['kick',N,'hat',N, 'kick',N,'hat',N, 'kick',N,'hat',N, 'kick',N,'hat',N],
                    ['kick',N,'hat',N, 'kick',N,'hat',N, 'kick',N,'hat',N, 'kick','snare','kick','snare']
                ), 2)
            },
            {
                name: 'Breakdown', bars: 4,
                harmony: seq(
                    [48,N,51,N, 55,N,51,N, 48,N,51,N, 55,N,51,N], // Cm
                    [46,N,50,N, 53,N,50,N, 46,N,50,N, 53,N,50,N], // Bb
                    [44,N,48,N, 51,N,48,N, 44,N,48,N, 51,N,48,N], // Ab
                    [43,N,46,N, 50,N,46,N, 43,N,46,N, 50,N,46,N]  // G
                ),
                bass: seq(
                    [36,N,N,N, N,N,N,N, N,N,N,N, N,N,N,N],
                    [34,N,N,N, N,N,N,N, N,N,N,N, N,N,N,N],
                    [32,N,N,N, N,N,N,N, N,N,N,N, N,N,N,N],
                    [31,N,N,N, N,N,N,N, N,N,N,N, N,N,N,N]
                )
            }
        ]
    },

    // === CHRONOMACH: "Neon Grid" ===
    // Cyberpunk Synthwave. F Minor.
    chronomach: {
        bpm: 135,
        loopStartBar: 0,
        sections: [
            {
                name: 'Pattern A', bars: 4,
                harmony: seq(
                    [65,68,72,77, 65,68,72,77, 65,68,72,77, 65,68,72,77], // Fm
                    [63,66,70,75, 63,66,70,75, 63,66,70,75, 63,66,70,75], // Eb
                    [61,65,68,73, 61,65,68,73, 61,65,68,73, 61,65,68,73], // Db
                    [60,63,67,72, 60,63,67,72, 60,63,67,72, 60,63,67,72]  // C
                ),
                bass: seq(
                    [41,N,N,N, 41,N,N,N, 41,N,N,N, 41,N,N,N],
                    [39,N,N,N, 39,N,N,N, 39,N,N,N, 39,N,N,N],
                    [37,N,N,N, 37,N,N,N, 37,N,N,N, 37,N,N,N],
                    [36,N,N,N, 36,N,N,N, 36,N,N,N, 36,N,N,N]
                ),
                drums: rep(seq(
                    ['kick',N,'hat',N, 'snare',N,'hat',N, 'kick',N,'hat',N, 'snare',N,'hat',N]
                ), 4)
            },
            {
                name: 'Pattern B (Lead)', bars: 8,
                lead: seq(
                    [77,N,N,N, 72,N,N,N, 68,N,N,N, 65,N,N,N],
                    [75,N,N,N, 70,N,N,N, 66,N,N,N, 63,N,N,N],
                    [73,N,N,N, 68,N,N,N, 65,N,N,N, 61,N,N,N],
                    [72,N,N,N, 67,N,N,N, 63,N,N,N, 60,N,N,N],
                    // High part
                    [77,77,N,77, 80,80,N,80, 72,72,N,72, N,N,N,N],
                    [75,75,N,75, 79,79,N,79, 70,70,N,70, N,N,N,N],
                    [73,N,72,N, 70,N,68,N, 65,N,68,N, 70,N,72,N],
                    [72,N,N,N, N,N,N,N, N,N,N,N, N,N,N,N]
                ),
                harmony: rep(seq(
                    [65,N,N,N, N,N,N,N, 65,N,N,N, N,N,N,N],
                    [63,N,N,N, N,N,N,N, 63,N,N,N, N,N,N,N],
                    [61,N,N,N, N,N,N,N, 61,N,N,N, N,N,N,N],
                    [60,N,N,N, N,N,N,N, 60,N,N,N, N,N,N,N]
                ), 2),
                bass: rep(seq(
                    [41,41,41,41, 41,41,41,41, 41,41,41,41, 41,41,41,41],
                    [39,39,39,39, 39,39,39,39, 39,39,39,39, 39,39,39,39],
                    [37,37,37,37, 37,37,37,37, 37,37,37,37, 37,37,37,37],
                    [36,36,36,36, 36,36,36,36, 36,36,36,36, 36,36,36,36]
                ), 2),
                 drums: rep(seq(
                    ['kick',N,'hat',N, 'snare',N,'hat',N, 'kick',N,'hat',N, 'snare',N,'hat',N]
                ), 8)
            }
        ]
    },

    // === CELESTIAL: "Sacred Silence" ===
    // Slow. C Lydian.
    celestial: {
        bpm: 55,
        loopStartBar: 0,
        sections: [{
            name: 'Hymn',
            bars: 8,
            harmony: seq(
                // C -> D -> Bm -> C
                [60,N,N,N, 64,N,N,N, 67,N,N,N, 72,N,N,N],
                [62,N,N,N, 66,N,N,N, 69,N,N,N, 74,N,N,N],
                [59,N,N,N, 62,N,N,N, 66,N,N,N, 71,N,N,N],
                [60,N,N,N, 64,N,N,N, 67,N,N,N, 72,N,N,N],
                // Am -> Em -> F -> G
                [57,N,N,N, 60,N,N,N, 64,N,N,N, 69,N,N,N],
                [52,N,N,N, 55,N,N,N, 59,N,N,N, 64,N,N,N],
                [53,N,N,N, 57,N,N,N, 60,N,N,N, 65,N,N,N],
                [55,N,N,N, 59,N,N,N, 62,N,N,N, 67,N,N,N]
            ),
            lead: seq(
                [72,N,N,N, N,N,N,N, 76,N,N,N, 79,N,N,N],
                [78,N,N,N, N,N,N,N, 74,N,N,N, N,N,N,N],
                [71,N,N,N, N,N,N,N, 74,N,N,N, N,N,N,N],
                [72,N,N,N, N,N,N,N, 67,N,N,N, N,N,N,N],
                [69,N,N,N, N,N,N,N, 72,N,N,N, 76,N,N,N],
                [71,N,N,N, N,N,N,N, 67,N,N,N, N,N,N,N],
                [65,N,N,N, 67,N,N,N, 69,N,N,N, 71,N,N,N],
                [72,N,N,N, 74,N,N,N, 76,N,N,N, 79,N,N,N]
            ),
            bass: seq(
                [36,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],
                [38,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],
                [35,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],
                [36,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],
                [33,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],
                [28,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],
                [29,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],
                [31,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N]
            )
        }]
    },
    
    // === WEAVERS: "Threads of Fate" ===
    // Whole Tone & Irregular.
    weavers: {
        bpm: 80,
        loopStartBar: 0,
        sections: [{
            name: 'Loop',
            bars: 8,
            lead: seq(
                [64,N,N,N, 66,N,N,N, 68,N,N,N, 70,N,N,N], // Whole tone
                [72,N,N,N, 70,N,N,N, 76,N,N,N, N,N,N,N],
                [64,N,66,N, 68,N,70,N, 72,N,76,N, 80,N,N,N],
                [N,N,N,N, N,N,N,N, 60,N,N,N, 56,N,N,N],
                [64,66,68,70, 72,N,N,N, 64,66,68,70, 72,N,N,N],
                [60,62,64,66, 68,N,N,N, 56,58,60,62, 64,N,N,N],
                [52,N,56,N, 60,N,64,N, 68,N,72,N, 76,N,N,N],
                [80,N,N,N, 76,N,N,N, 72,N,N,N, 68,N,N,N]
            ),
            harmony: seq(
                [N,N,68,N, N,N,72,N, N,N,76,N, N,N,80,N],
                [N,N,68,N, N,N,72,N, N,N,76,N, N,N,80,N],
                [60,N,N,N, 64,N,N,N, 68,N,N,N, 72,N,N,N],
                [52,N,N,N, 56,N,N,N, 60,N,N,N, 64,N,N,N],
                [N,N,N,N, N,N,N,N, N,N,N,N, N,N,N,N],
                [N,N,N,N, N,N,N,N, N,N,N,N, N,N,N,N],
                [60,N,N,N, 60,N,N,N, 60,N,N,N, 60,N,N,N],
                [56,N,N,N, 56,N,N,N, 56,N,N,N, 56,N,N,N]
            )
        }]
    }
}

// Map generic themes to factions or simple loops
THEMES['menu'] = THEMES['celestial']; 
THEMES['battle'] = { ...THEMES['aethelgard'], bpm: 140 }; 
THEMES['victory'] = { ...THEMES['pantheon'], bpm: 90 }; 
THEMES['defeat'] = { ...THEMES['veridian'], bpm: 60 }; 

// --- ENGINE CORE ---

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGain = audioCtx.createGain();
        compressor = audioCtx.createDynamicsCompressor();
        reverbNode = audioCtx.createConvolver();
        
        reverbNode.buffer = createImpulseResponse(2.0, 3.0);
        
        const reverbGain = audioCtx.createGain();
        reverbGain.gain.value = 0.35; 
        
        masterGain.gain.value = isMutedGlobally ? 0 : globalVolume;
        
        // Routing: Inst -> [Master + Reverb] -> Master -> Compressor -> Out
        masterGain.connect(compressor);
        compressor.connect(audioCtx.destination);
        
        reverbNode.connect(reverbGain);
        reverbGain.connect(masterGain);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
};

const playNote = (inst: string, note: number | null | string, time: number, duration: number) => {
    if (!audioCtx || !masterGain || !reverbNode || note === null) return;
    
    // Destinations
    const dry = masterGain; 
    const wet = reverbNode; 

    if (typeof note === 'string') {
        // Drum
        Instruments.drum(audioCtx, dry, note as any, time);
        return;
    }

    if (typeof note === 'number') {
        switch (inst) {
            case 'lead': 
                // Context dependent: Veridian uses Flute, Pantheon uses Brass
                if (currentTrackName === 'veridian') Instruments.flute(audioCtx, wet, note, time, duration);
                else if (currentTrackName === 'pantheon') Instruments.brass(audioCtx, wet, note, time, duration);
                else if (currentTrackName === 'aethelgard') Instruments.brass(audioCtx, dry, note, time, duration * 0.5); // Stabs
                else if (currentTrackName === 'celestial') Instruments.flute(audioCtx, wet, note, time, duration);
                else if (currentTrackName === 'weavers') Instruments.flute(audioCtx, wet, note, time, duration);
                else if (currentTrackName === 'chronomach') Instruments.harp(audioCtx, dry, note, time, duration); // Synth lead
                else Instruments.harp(audioCtx, dry, note, time, duration);
                break;
            case 'harmony':
                if (currentTrackName === 'veridian') Instruments.harp(audioCtx, dry, note, time, duration);
                else if (currentTrackName === 'celestial') Instruments.strings(audioCtx, wet, note, time, duration * 4);
                else if (currentTrackName === 'chronomach') Instruments.harp(audioCtx, dry, note, time, duration * 0.5);
                else if (currentTrackName === 'aethelgard') Instruments.strings(audioCtx, wet, note, time, duration * 2);
                else Instruments.strings(audioCtx, wet, note, time, duration);
                break;
            case 'bass':
                Instruments.bass(audioCtx, dry, note, time, duration);
                break;
        }
    }
};

const scheduler = () => {
    if (!audioCtx || !currentTrackName || !isPlaying) return;

    const theme = THEMES[currentTrackName];
    if (!theme) return;

    const secondsPerBeat = 60.0 / theme.bpm;
    const secondsPer16th = secondsPerBeat * 0.25;
    const lookahead = 0.1;

    while (nextNoteTime < audioCtx.currentTime + lookahead) {
        // 1. Locate current section and bar
        // We flatten the sections into a linear timeline for simplicity in playback
        let totalBars = 0;
        let activeSection = theme.sections[0];
        let sectionStartBar = 0;

        for (const s of theme.sections) {
            if (measureCount < totalBars + s.bars) {
                activeSection = s;
                sectionStartBar = totalBars;
                break;
            }
            totalBars += s.bars;
        }

        // Loop Logic
        if (measureCount >= totalBars) {
            measureCount = theme.loopStartBar;
            // Recalculate active section after loop reset
            totalBars = 0;
            for (const s of theme.sections) {
                 if (measureCount < totalBars + s.bars) {
                    activeSection = s;
                    sectionStartBar = totalBars;
                    break;
                }
                totalBars += s.bars;
            }
        }

        // 2. Calculate indices
        const barInSection = measureCount - sectionStartBar;
        const noteIndex = (barInSection * 16) + current16thNote;

        // 3. Play Notes
        // Added Safety checks for array bounds
        if (activeSection.lead && activeSection.lead[noteIndex] !== undefined) 
            playNote('lead', activeSection.lead[noteIndex], nextNoteTime, secondsPer16th * 2); // Longer sustain
        
        if (activeSection.harmony && activeSection.harmony[noteIndex] !== undefined) 
            playNote('harmony', activeSection.harmony[noteIndex], nextNoteTime, secondsPer16th);
            
        if (activeSection.bass && activeSection.bass[noteIndex] !== undefined) 
            playNote('bass', activeSection.bass[noteIndex], nextNoteTime, secondsPer16th * 3);
            
        if (activeSection.drums && activeSection.drums[noteIndex] !== undefined) 
            playNote('drum', activeSection.drums[noteIndex], nextNoteTime, secondsPer16th);

        // 4. Advance
        nextNoteTime += secondsPer16th;
        current16thNote++;
        if (current16thNote === 16) {
            current16thNote = 0;
            measureCount++;
        }
    }
    timerID = window.setTimeout(scheduler, 25);
};

export const playMusic = (trackName: string) => { 
    initAudio();
    if (!audioCtx) return;

    const target = THEMES[trackName] ? trackName : 'menu';
    if (currentTrackName === target && isPlaying) return;
    
    if (isPlaying) stopMusic();
    
    currentTrackName = target as TrackName;
    isPlaying = true;
    current16thNote = 0;
    measureCount = 0;
    nextNoteTime = audioCtx.currentTime + 0.1;
    scheduler();
};

export const stopMusic = () => {
    isPlaying = false;
    if (timerID !== null) {
        clearTimeout(timerID);
        timerID = null;
    }
    const now = audioCtx?.currentTime || 0;
    activeNodes.forEach(n => {
        try { 
            if (n instanceof OscillatorNode || n instanceof AudioBufferSourceNode) n.stop(now + 0.1);
            if (n instanceof GainNode) n.gain.linearRampToValueAtTime(0, now + 0.1);
        } catch(e){}
    });
    activeNodes = [];
};

export const toggleMute = (): boolean => {
    initAudio();
    isMutedGlobally = !isMutedGlobally;
    if (masterGain && audioCtx) {
        masterGain.gain.setTargetAtTime(isMutedGlobally ? 0 : globalVolume, audioCtx.currentTime, 0.1);
    }
    return isMutedGlobally;
};