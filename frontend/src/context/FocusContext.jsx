import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useStudent } from './StudentContext';
import { studentApi } from '../api/formulasApi';

const FocusContext = createContext();

export const SOUNDSCAPES = [
  { id: 'piano', label: 'Study Piano 🎹', desc: 'Flow-state neo-classical acoustic piano arpeggios' },
  { id: 'off', label: 'Pure Silence 🔇', desc: 'Zero audio stimulation' },
  { id: 'brown', label: 'Deep Brown Noise 🌊', desc: '1/f² rumble for deep math focus & ADHD' },
  { id: 'rain', label: 'Gentle Rain 🌧️', desc: 'Soothing pink noise rainfall' },
  { id: 'binaural', label: 'Alpha Wave 10Hz 🧘', desc: 'True binaural beat (200Hz/210Hz stereo)' },
  { id: 'zen432', label: '432Hz Zen Drone 🕉️', desc: 'Harmonic Solfeggio meditative resonance' },
  { id: 'crackle', label: 'Warm Campfire 🔥', desc: 'Cozy hearth & crackling embers' },
];

export const BREAK_SOUNDSCAPES = [
  { id: 'healingPiano', label: 'Meditative Felt Piano 🎹', desc: 'Slow, peaceful reverberant piano chords for deep calm' },
  { id: 'zen432', label: '432Hz Solfeggio 🕉️', desc: 'Harmonic meditative resonance for cellular calm' },
  { id: 'singingBowl', label: 'Tibetan Singing Bowl 🔔', desc: 'Resonant bronze singing bowls with harmonic decay' },
  { id: 'alphaTheta', label: 'Alpha-Theta 8Hz 🧘', desc: 'Restorative brainwave entrainment for stress reset' },
  { id: 'healingRain', label: 'Temple Rain & Chimes 🌧️', desc: 'Soothing rainfall with delicate pentatonic wind bells' },
  { id: 'celestial', label: 'Celestial Ambient Pad ✨', desc: 'Warm ethereal chordal synthesis in D-minor' },
  { id: 'silence', label: 'Still Silence 🔇', desc: 'Pure undisturbed quiet reflection' },
];

export function FocusProvider({ children }) {
  const { awardXp, updateProfile, profile } = useStudent();

  // Load initial persisted session if valid
  const getPersistedSession = () => {
    try {
      const saved = localStorage.getItem('btm_focus_session');
      if (!saved) return null;
      const data = JSON.parse(saved);
      if (data && data.isFocusActive) {
        if (data.isPaused) {
          return data;
        }
        const now = Date.now();
        if (data.endTime && data.endTime > now) {
          const remaining = Math.max(1, Math.round((data.endTime - now) / 1000));
          return { ...data, secondsRemaining: remaining };
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  const initialSession = getPersistedSession();

  const [isFocusActive, setIsFocusActive] = useState(initialSession ? initialSession.isFocusActive : false);
  const [isPaused, setIsPaused] = useState(initialSession ? initialSession.isPaused : false);
  const [focusDuration, setFocusDuration] = useState(initialSession ? initialSession.focusDuration : 25 * 60); // in seconds
  const [secondsRemaining, setSecondsRemaining] = useState(initialSession ? initialSession.secondsRemaining : 25 * 60);
  const [focusGoal, setFocusGoal] = useState(initialSession ? initialSession.focusGoal : 'Deep Mathematical Derivations');
  const [ambientSound, setAmbientSound] = useState(initialSession ? initialSession.ambientSound : 'rain');
  const [ambientVolume, setAmbientVolume] = useState(0.14);
  const [tabSwitches, setTabSwitches] = useState(initialSession ? (initialSession.tabSwitches || 0) : 0);
  const [isPreviewingAudio, setIsPreviewingAudio] = useState(false);
  const [isHudMinimized, setIsHudMinimized] = useState(false);

  // Micro-Tasks / Checklist State
  const [sessionTasks, setSessionTasks] = useState(initialSession?.sessionTasks || [
    { id: '1', text: 'Understand core theorem intuition', completed: false },
    { id: '2', text: 'Step through derivation proof', completed: false },
    { id: '3', text: 'Solve 3 practice questions', completed: false },
  ]);

  // Pomodoro Cycle & Phase State
  const [sessionPhase, setSessionPhase] = useState(initialSession?.sessionPhase || 'work'); // 'work' | 'break'
  const [currentCycle, setCurrentCycle] = useState(initialSession?.currentCycle || 1);
  const [totalCycles, setTotalCycles] = useState(initialSession?.totalCycles || 4);

  // Zen Sanctum View
  const [isZenSanctumOpen, setIsZenSanctumOpen] = useState(false);
  const [isBreathingGuideActive, setIsBreathingGuideActive] = useState(true);

  // Mindful Break Studio State
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 mins default
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState(5 * 60);
  const [isBreakTimerRunning, setIsBreakTimerRunning] = useState(true);
  const [breakSoundscape, setBreakSoundscape] = useState('healingPiano');
  const [breakBreathingTechnique, setBreakBreathingTechnique] = useState('box'); // 'box' | 'relax478'
  const [breakVisualMode, setBreakVisualMode] = useState('mandala'); // 'mandala' | 'kineticMath' | 'stars'
  const [isBreakCompleted, setIsBreakCompleted] = useState(false);
  const activeIntervalsRef = useRef([]);

  // Modals
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isEmergencyExitOpen, setIsEmergencyExitOpen] = useState(false);
  const [completedSessionData, setCompletedSessionData] = useState(null);

  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const activeNodesRef = useRef([]);
  const previewTimerRef = useRef(null);

  // Sync active session state to localStorage
  useEffect(() => {
    try {
      if (isFocusActive) {
        const payload = {
          isFocusActive: true,
          isPaused,
          focusDuration,
          secondsRemaining,
          focusGoal,
          ambientSound,
          tabSwitches,
          sessionTasks,
          sessionPhase,
          currentCycle,
          totalCycles,
          endTime: isPaused ? null : Date.now() + secondsRemaining * 1000,
        };
        localStorage.setItem('btm_focus_session', JSON.stringify(payload));
      } else {
        localStorage.removeItem('btm_focus_session');
      }
    } catch {
      // ignore storage errors
    }
  }, [
    isFocusActive,
    isPaused,
    secondsRemaining,
    focusDuration,
    focusGoal,
    ambientSound,
    tabSwitches,
    sessionTasks,
    sessionPhase,
    currentCycle,
    totalCycles,
  ]);

  // 1. Leave Site Deterrence: beforeunload listener & Tab switch tracker
  useEffect(() => {
    if (!isFocusActive) {
      setTabSwitches(0);
      return;
    }

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Focus Session in Progress! Leaving now will forfeit your study time and XP reward.';
      return e.returnValue;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFocusActive]);

  // Stop all active audio nodes cleanly
  const stopAmbientAudio = useCallback(() => {
    try {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
      setIsPreviewingAudio(false);

      if (activeIntervalsRef.current) {
        activeIntervalsRef.current.forEach((id) => clearInterval(id));
        activeIntervalsRef.current = [];
      }

      if (activeNodesRef.current) {
        activeNodesRef.current.forEach((node) => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch {
            // ignore
          }
        });
        activeNodesRef.current = [];
      }

      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    } catch {
      // ignore
    }
  }, []);

  // 2. Synthesized Ambient Audio Engine (Web Audio API)
  const startAmbientAudio = useCallback((type, customVol = ambientVolume) => {
    stopAmbientAudio();
    if (!type || type === 'off' || type === 'silence') return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(customVol, ctx.currentTime);
      masterGain.connect(ctx.destination);
      activeNodesRef.current.push(masterGain);

      // Helper to synthesize authentic acoustic & felt piano notes
      const playPianoVoice = (destination, freq, time, duration = 3.5, velocity = 0.75, isFelt = false) => {
        if (!ctx || ctx.state === 'closed') return;
        try {
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }

          const startTime = Math.max(time, ctx.currentTime) + 0.005;
          const harmonics = isFelt ? [1, 2, 3] : [1, 2, 3, 4];
          const weights = isFelt ? [1.0, 0.42, 0.16] : [1.0, 0.58, 0.28, 0.12];

          harmonics.forEach((h, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            // Use triangle for fundamental on acoustic piano for warm body resonance, sine for upper harmonics
            osc.type = (h === 1 && !isFelt) ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq * h, startTime);

            if (idx > 0) {
              osc.detune.setValueAtTime(idx % 2 === 0 ? 3.5 : -3.5, startTime);
            }

            const peak = velocity * weights[idx] * (isFelt ? 0.38 : 0.52);
            const decayConst = (duration / (h * 0.7 + 0.4)) * 0.42;

            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(peak, startTime + 0.015);
            gain.gain.setTargetAtTime(0.0001, startTime + 0.015, decayConst);

            osc.connect(gain);
            gain.connect(destination);
            osc.start(startTime);
            osc.stop(startTime + Math.min(duration, 7.0));
          });

          // Acoustic hammer strike transient (percussive wooden strike sound)
          const hammer = ctx.createOscillator();
          const hammerGain = ctx.createGain();
          const hammerFilter = ctx.createBiquadFilter();
          hammer.type = 'triangle';
          hammer.frequency.setValueAtTime(freq * 0.5, startTime);
          hammerFilter.type = 'bandpass';
          hammerFilter.frequency.setValueAtTime(isFelt ? 320 : 640, startTime);
          hammerFilter.Q.setValueAtTime(1.5, startTime);

          hammerGain.gain.setValueAtTime(0.0001, startTime);
          hammerGain.gain.linearRampToValueAtTime(velocity * 0.15, startTime + 0.004);
          hammerGain.gain.setTargetAtTime(0.0001, startTime + 0.004, 0.016);

          hammer.connect(hammerFilter).connect(hammerGain).connect(destination);
          hammer.start(startTime);
          hammer.stop(startTime + 0.06);
        } catch {
          // Safeguard against audio scheduling hiccups
        }
      };

      // SOUNDSCAPE 1: DEEP BROWN NOISE (1/f² integration - velvety study rumble)
      if (type === 'brown') {
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(580, ctx.currentTime);

        source.connect(filter);
        filter.connect(masterGain);
        source.start(0);
        activeNodesRef.current.push(source, filter);
      }

      // SOUNDSCAPE 2: GENTLE RAIN (Pink noise with wave modulation)
      else if (type === 'rain') {
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.075;
          b6 = white * 0.115926;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(880, ctx.currentTime);

        source.connect(filter);
        filter.connect(masterGain);
        source.start(0);
        activeNodesRef.current.push(source, filter);
      }

      // SOUNDSCAPE 3: 10HZ ALPHA BINAURAL BEATS
      else if (type === 'binaural') {
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        oscL.type = 'sine';
        oscR.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);
        oscR.frequency.setValueAtTime(210, ctx.currentTime);

        if (ctx.createStereoPanner) {
          const panL = ctx.createStereoPanner();
          const panR = ctx.createStereoPanner();
          panL.pan.setValueAtTime(-1, ctx.currentTime);
          panR.pan.setValueAtTime(1, ctx.currentTime);

          const gainL = ctx.createGain();
          const gainR = ctx.createGain();
          gainL.gain.setValueAtTime(0.5, ctx.currentTime);
          gainR.gain.setValueAtTime(0.5, ctx.currentTime);

          oscL.connect(gainL).connect(panL).connect(masterGain);
          oscR.connect(gainR).connect(panR).connect(masterGain);
          activeNodesRef.current.push(panL, panR, gainL, gainR);
        } else {
          oscL.connect(masterGain);
          oscR.connect(masterGain);
        }

        oscL.start(0);
        oscR.start(0);
        activeNodesRef.current.push(oscL, oscR);
      }

      // SOUNDSCAPE 4: 432Hz ZEN SOLFEGGIO DRONE
      else if (type === 'zen432') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const oscSub = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        oscSub.type = 'sine';
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        osc2.frequency.setValueAtTime(648, ctx.currentTime);
        oscSub.frequency.setValueAtTime(216, ctx.currentTime);

        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        const gainSub = ctx.createGain();
        gain1.gain.setValueAtTime(0.35, ctx.currentTime);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gainSub.gain.setValueAtTime(0.25, ctx.currentTime);

        // Slow tremolo/chorus LFO
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(gain1.gain);

        osc1.connect(gain1).connect(masterGain);
        osc2.connect(gain2).connect(masterGain);
        oscSub.connect(gainSub).connect(masterGain);

        lfo.start(0);
        osc1.start(0);
        osc2.start(0);
        oscSub.start(0);
        activeNodesRef.current.push(osc1, osc2, oscSub, lfo, gain1, gain2, gainSub, lfoGain);
      }

      // SOUNDSCAPE 5: WARM CAMPFIRE & CRACKLE
      else if (type === 'crackle') {
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + 0.02 * white) / 1.02;
          let sample = lastOut * 1.8;
          if (Math.random() < 0.0006) {
            sample += (Math.random() * 2 - 1) * 0.9;
          }
          data[i] = sample;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);

        source.connect(filter);
        filter.connect(masterGain);
        source.start(0);
        activeNodesRef.current.push(source, filter);
      }

      // HEALING BREAK SOUNDSCAPE: TIBETAN SINGING BOWL RESONANCE
      else if (type === 'singingBowl') {
        // Continuous soft singing rim drone
        const rimOsc = ctx.createOscillator();
        const rimGain = ctx.createGain();
        rimOsc.type = 'sine';
        rimOsc.frequency.setValueAtTime(432, ctx.currentTime);
        rimGain.gain.setValueAtTime(0.12, ctx.currentTime);

        const rimLfo = ctx.createOscillator();
        const rimLfoGain = ctx.createGain();
        rimLfo.type = 'sine';
        rimLfo.frequency.setValueAtTime(0.2, ctx.currentTime);
        rimLfoGain.gain.setValueAtTime(0.04, ctx.currentTime);
        rimLfo.connect(rimLfoGain).connect(rimGain.gain);

        rimOsc.connect(rimGain).connect(masterGain);
        rimLfo.start(0);
        rimOsc.start(0);
        activeNodesRef.current.push(rimOsc, rimGain, rimLfo, rimLfoGain);

        // Acoustic bowl strike function
        const strikeBowl = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const strikeTime = audioCtxRef.current.currentTime;
          const bowlFreqs = [216, 594, 972, 1404];
          bowlFreqs.forEach((freq, idx) => {
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, strikeTime);

            const amp = (0.22 / (idx + 1));
            gain.gain.setValueAtTime(0, strikeTime);
            gain.gain.linearRampToValueAtTime(amp, strikeTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 8.5);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(strikeTime);
            osc.stop(strikeTime + 8.5);
            activeNodesRef.current.push(osc, gain);
          });
        };

        // Initial strike and recurring calm intervals
        strikeBowl();
        const bowlInterval = setInterval(strikeBowl, 11000);
        activeIntervalsRef.current.push(bowlInterval);
      }

      // HEALING BREAK SOUNDSCAPE: ALPHA-THETA 8HZ BINAURAL
      else if (type === 'alphaTheta') {
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const subOsc = ctx.createOscillator();

        oscL.type = 'sine';
        oscR.type = 'sine';
        subOsc.type = 'sine';

        // 196 Hz Left, 204 Hz Right -> 8 Hz Difference (Theta/Alpha border)
        oscL.frequency.setValueAtTime(196, ctx.currentTime);
        oscR.frequency.setValueAtTime(204, ctx.currentTime);
        subOsc.frequency.setValueAtTime(98, ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.25, ctx.currentTime);
        subOsc.connect(subGain).connect(masterGain);

        if (ctx.createStereoPanner) {
          const panL = ctx.createStereoPanner();
          const panR = ctx.createStereoPanner();
          panL.pan.setValueAtTime(-1, ctx.currentTime);
          panR.pan.setValueAtTime(1, ctx.currentTime);

          const gainL = ctx.createGain();
          const gainR = ctx.createGain();
          gainL.gain.setValueAtTime(0.4, ctx.currentTime);
          gainR.gain.setValueAtTime(0.4, ctx.currentTime);

          oscL.connect(gainL).connect(panL).connect(masterGain);
          oscR.connect(gainR).connect(panR).connect(masterGain);
          activeNodesRef.current.push(panL, panR, gainL, gainR);
        } else {
          oscL.connect(masterGain);
          oscR.connect(masterGain);
        }

        oscL.start(0);
        oscR.start(0);
        subOsc.start(0);
        activeNodesRef.current.push(oscL, oscR, subOsc, subGain);
      }

      // HEALING BREAK SOUNDSCAPE: TEMPLE RAIN & CHIMES
      else if (type === 'healingRain') {
        // Pink noise rain bed
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
          b6 = white * 0.115926;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, ctx.currentTime);

        source.connect(filter).connect(masterGain);
        source.start(0);
        activeNodesRef.current.push(source, filter);

        // Pentatonic Chimes (E5, G5, A5, B5, D6)
        const chimeNotes = [659.25, 783.99, 880.00, 987.77, 1174.66];
        const triggerChime = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const chimeTime = audioCtxRef.current.currentTime;
          const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, chimeTime);

          gain.gain.setValueAtTime(0, chimeTime);
          gain.gain.linearRampToValueAtTime(0.08, chimeTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 3.8);

          osc.connect(gain).connect(masterGain);
          osc.start(chimeTime);
          osc.stop(chimeTime + 3.8);
          activeNodesRef.current.push(osc, gain);
        };

        const chimeInterval = setInterval(triggerChime, 3400);
        activeIntervalsRef.current.push(chimeInterval);
      }

      // HEALING BREAK SOUNDSCAPE: CELESTIAL AMBIENT PAD
      else if (type === 'celestial') {
        const chordFreqs = [146.83, 220.00, 349.23, 523.25, 659.25]; // D3, A3, F4, C5, E5
        const padFilter = ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.setValueAtTime(600, ctx.currentTime);

        const filterLfo = ctx.createOscillator();
        const filterLfoGain = ctx.createGain();
        filterLfo.type = 'sine';
        filterLfo.frequency.setValueAtTime(0.08, ctx.currentTime);
        filterLfoGain.gain.setValueAtTime(250, ctx.currentTime);
        filterLfo.connect(filterLfoGain).connect(padFilter.frequency);
        filterLfo.start(0);

        chordFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.12 / (idx + 1), ctx.currentTime);
          osc.connect(gain).connect(padFilter);
          osc.start(0);
          activeNodesRef.current.push(osc, gain);
        });

        padFilter.connect(masterGain);
        activeNodesRef.current.push(padFilter, filterLfo, filterLfoGain);
      }

      // SOUNDSCAPE: NEO-CLASSICAL STUDY PIANO (Focus Mode)
      else if (type === 'piano') {
        const pianoFilter = ctx.createBiquadFilter();
        pianoFilter.type = 'lowpass';
        pianoFilter.frequency.setValueAtTime(2800, ctx.currentTime);
        pianoFilter.connect(masterGain);
        activeNodesRef.current.push(pianoFilter);

        // Chords: Am, Fmaj7, C, G (Max Richter & Ludovico Einaudi inspired progression)
        const progression = [
          { bass: 110.00, notes: [220.00, 261.63, 329.63, 440.00, 523.25] }, // Am (A2, A3, C4, E4, A4, C5)
          { bass: 87.31,  notes: [174.61, 261.63, 329.63, 440.00, 523.25] }, // Fmaj7 (F2, F3, C4, E4, A4, C5)
          { bass: 130.81, notes: [261.63, 329.63, 392.00, 523.25, 659.25] }, // C (C3, C4, E4, G4, C5, E5)
          { bass: 98.00,  notes: [196.00, 246.94, 293.66, 392.00, 493.88] }, // G (G2, G3, B3, D4, G4, B4)
        ];

        let chordIdx = 0;
        let noteStep = 0;

        const triggerPianoStep = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {});
          }
          const now = audioCtxRef.current.currentTime;
          const currentChord = progression[chordIdx];

          // Rich bass note on downbeat (step 0)
          if (noteStep === 0) {
            playPianoVoice(pianoFilter, currentChord.bass, now, 5.0, 0.90, false);
          }

          // Arpeggiated melody note
          const melNote = currentChord.notes[noteStep % currentChord.notes.length];
          playPianoVoice(pianoFilter, melNote, now, 3.8, 0.72, false);

          noteStep++;
          if (noteStep >= 4) {
            noteStep = 0;
            chordIdx = (chordIdx + 1) % progression.length;
          }
        };

        triggerPianoStep();
        const pianoInterval = setInterval(triggerPianoStep, 480); // Flowing 62 BPM tempo
        activeIntervalsRef.current.push(pianoInterval);
      }

      // SOUNDSCAPE: MEDITATIVE HEALING FELT PIANO (Break Mode)
      else if (type === 'healingPiano') {
        const feltFilter = ctx.createBiquadFilter();
        feltFilter.type = 'lowpass';
        feltFilter.frequency.setValueAtTime(1100, ctx.currentTime); // Soft felt warmth
        feltFilter.connect(masterGain);
        activeNodesRef.current.push(feltFilter);

        // Spacious, meditative piano chords (Dmaj9, Gmaj7, Bm7, Asus4)
        const chords = [
          [73.42, 185.00, 220.00, 277.18, 329.63], // Dmaj9 (D2, F#3, A3, C#4, E4)
          [98.00, 196.00, 246.94, 293.66, 369.99], // Gmaj7 (G2, G3, B3, D4, F#4)
          [61.74, 146.83, 220.00, 293.66, 369.99], // Bm7 (B1, D3, A3, D4, F#4)
          [110.00, 164.81, 220.00, 293.66, 329.63], // Asus4 (A2, E3, A3, D4, E4)
        ];

        let chordIdx = 0;

        const triggerFeltChord = () => {
          if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {});
          }
          const chord = chords[chordIdx];
          const baseTime = audioCtxRef.current.currentTime;

          // Arpeggiate chord gently across 250ms
          chord.forEach((freq, idx) => {
            const noteTime = baseTime + idx * 0.06;
            const vel = idx === 0 ? 0.85 : 0.65 - idx * 0.05;
            playPianoVoice(feltFilter, freq, noteTime, 6.5, vel, true);
          });

          chordIdx = (chordIdx + 1) % chords.length;
        };

        triggerFeltChord();
        const feltInterval = setInterval(triggerFeltChord, 4800); // 4.8 seconds between tranquil chords
        activeIntervalsRef.current.push(feltInterval);
      }
    } catch (err) {
      console.warn('Web Audio Ambient sound could not start:', err);
    }
  }, [ambientVolume, stopAmbientAudio]);

  // Play completion chime (528Hz Solfeggio frequency + harmonics)
  const playCompletionChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const frequencies = [528, 792, 1056];
      const now = ctx.currentTime;

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.2);
      });
    } catch {
      // ignore
    }
  }, []);

  // Play task completion micro-chime (784Hz + 1046Hz)
  const playTaskChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, now);
      osc.frequency.setValueAtTime(1046.5, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // ignore
    }
  }, []);

  // Play acoustic Tibetan singing bowl resonance chime (fundamental 216Hz + harmonics)
  const playBowlChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const bowlFreqs = [216, 594, 972, 1404];

      bowlFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const amp = 0.2 / (idx + 1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(amp, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 5.5);
      });
    } catch {
      // ignore
    }
  }, []);

  // Finish session normally (timer reached 0)
  const finishFocusSession = useCallback(() => {
    stopAmbientAudio();
    playCompletionChime();

    const minutesFocused = Math.round(focusDuration / 60);
    const completedTasksCount = sessionTasks.filter((t) => t.completed).length;
    const isLaser = tabSwitches === 0;

    let xpReward = Math.max(50, minutesFocused * 4);
    if (completedTasksCount > 0) xpReward += completedTasksCount * 15;
    if (isLaser) xpReward += 30;

    awardXp(xpReward, `Completed ${minutesFocused}m Focus Block! ${isLaser ? '⚡ (100% Laser Focus)' : '🧘'}`);

    const updatedMinutes = (profile.total_focus_minutes || 0) + minutesFocused;
    const updatedSessions = (profile.completed_focus_sessions || 0) + 1;
    const updatedBadges = [...(profile.unlocked_badges || [])];

    if (updatedSessions >= 3 && !updatedBadges.includes('focus_master')) {
      updatedBadges.push('focus_master');
    }
    if (isLaser && !updatedBadges.includes('laser_focus')) {
      updatedBadges.push('laser_focus');
    }

    updateProfile({
      total_focus_minutes: updatedMinutes,
      completed_focus_sessions: updatedSessions,
      unlocked_badges: updatedBadges,
    });

    studentApi.completeFocusSession(minutesFocused, xpReward).catch(() => {});

    setCompletedSessionData({
      minutes: minutesFocused,
      xp: xpReward,
      goal: focusGoal,
      totalSessions: updatedSessions,
      completedTasksCount,
      totalTasksCount: sessionTasks.length,
      tabSwitches,
      currentCycle,
      totalCycles,
      isLaser,
    });

    setIsCompleteOpen(true);
    setIsZenSanctumOpen(false);
  }, [
    awardXp,
    currentCycle,
    focusDuration,
    focusGoal,
    playCompletionChime,
    profile,
    sessionTasks,
    stopAmbientAudio,
    tabSwitches,
    totalCycles,
    updateProfile,
  ]);

  // Finish Mindful Break session
  const finishBreakSession = useCallback(() => {
    setIsBreakTimerRunning(false);
    setIsBreakCompleted(true);
    playBowlChime();
    awardXp(25, 'Completed Mindful Break & Meditation 🧘 (+25 XP)');
  }, [awardXp, playBowlChime]);

  // 3. Focus Countdown Timer Loop
  useEffect(() => {
    if (isFocusActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishFocusSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isFocusActive, isPaused, finishFocusSession]);

  // 4. Mindful Break Countdown Timer Loop
  useEffect(() => {
    let breakInterval = null;
    if (isBreakModalOpen && isBreakTimerRunning && !isBreakCompleted) {
      breakInterval = setInterval(() => {
        setBreakSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(breakInterval);
            finishBreakSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (breakInterval) clearInterval(breakInterval);
    };
  }, [isBreakModalOpen, isBreakTimerRunning, isBreakCompleted, finishBreakSession]);

  // Break Studio Actions
  const openBreakStudio = useCallback(
    ({ durationMinutes = 5, sound = 'healingPiano' } = {}) => {
      if (isFocusActive && !isPaused) {
        setIsPaused(true);
      }
      const secs = Math.max(60, durationMinutes * 60);
      setBreakDuration(secs);
      setBreakSecondsRemaining(secs);
      setBreakSoundscape(sound);
      setIsBreakTimerRunning(true);
      setIsBreakCompleted(false);
      setIsBreakModalOpen(true);
      setIsCompleteOpen(false);

      if (sound !== 'silence' && sound !== 'off') {
        startAmbientAudio(sound);
      } else {
        stopAmbientAudio();
      }
    },
    [isFocusActive, isPaused, startAmbientAudio, stopAmbientAudio]
  );

  const closeBreakStudio = useCallback(() => {
    setIsBreakModalOpen(false);
    setIsBreakTimerRunning(false);
    stopAmbientAudio();
  }, [stopAmbientAudio]);

  const toggleBreakTimer = () => {
    setIsBreakTimerRunning((prev) => {
      const next = !prev;
      if (!next) {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend().catch(() => {});
        }
      } else {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }
      }
      return next;
    });
  };

  const setBreakDurationMinutes = (mins) => {
    const secs = Math.max(60, mins * 60);
    setBreakDuration(secs);
    setBreakSecondsRemaining(secs);
    setIsBreakCompleted(false);
    setIsBreakTimerRunning(true);
  };

  const changeBreakSoundscape = (soundId) => {
    setBreakSoundscape(soundId);
    if (soundId === 'silence' || soundId === 'off') {
      stopAmbientAudio();
    } else {
      startAmbientAudio(soundId);
    }
  };

  // Start Focus Session (supports both object options and legacy positional arguments)
  const startFocusSession = (optionsOrDuration = 25, goalArg, soundArg, fullscreenArg) => {
    let durationMinutes = 25;
    let goal = 'Deep Mathematical Focus';
    let sound = 'piano';
    let tasks = [];
    let cycles = 4;
    let openZenSanctum = false;

    if (typeof optionsOrDuration === 'object' && optionsOrDuration !== null) {
      durationMinutes = optionsOrDuration.durationMinutes ?? 25;
      goal = optionsOrDuration.goal ?? 'Deep Mathematical Focus';
      sound = optionsOrDuration.sound ?? 'piano';
      tasks = optionsOrDuration.tasks ?? [];
      cycles = optionsOrDuration.cycles ?? 4;
      openZenSanctum = optionsOrDuration.openZenSanctum ?? false;
    } else {
      durationMinutes = typeof optionsOrDuration === 'number' ? optionsOrDuration : 25;
      if (goalArg) goal = goalArg;
      if (soundArg) sound = soundArg;
      if (fullscreenArg) openZenSanctum = fullscreenArg;
    }

    const totalSecs = Math.max(60, durationMinutes * 60);
    setFocusDuration(totalSecs);
    setSecondsRemaining(totalSecs);
    setFocusGoal(goal || 'Deep Mathematical Focus');
    setAmbientSound(sound);
    setTotalCycles(cycles || 4);
    setCurrentCycle(1);
    setSessionPhase('work');
    setIsPaused(false);
    setIsFocusActive(true);
    setIsSetupOpen(false);
    setTabSwitches(0);

    if (tasks && tasks.length > 0) {
      setSessionTasks(tasks);
    }

    if (sound !== 'off') {
      startAmbientAudio(sound);
    }

    if (openZenSanctum) {
      setIsZenSanctumOpen(true);
    }
  };

  // Pause / Resume
  const pauseFocusSession = () => {
    setIsPaused(true);
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      audioCtxRef.current.suspend().catch(() => {});
    }
  };

  const resumeFocusSession = () => {
    setIsPaused(false);
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  };

  // Global Keyboard Shortcuts (Space: Pause/Resume, Z: Zen Sanctum, M: Mute/Unmute, Esc: Close Zen)
  useEffect(() => {
    if (!isFocusActive) return;

    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPaused) {
          resumeFocusSession();
        } else {
          pauseFocusSession();
        }
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        setIsZenSanctumOpen((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setAmbientSound((prev) => {
          const next = prev === 'off' ? 'brown' : 'off';
          if (next === 'off') stopAmbientAudio();
          else startAmbientAudio(next);
          return next;
        });
      } else if (e.key === 'Escape') {
        if (isZenSanctumOpen) {
          setIsZenSanctumOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusActive, isPaused, isZenSanctumOpen, startAmbientAudio, stopAmbientAudio]);

  const updateAmbientVolume = (vol) => {
    setAmbientVolume(vol);
    if (activeNodesRef.current.length > 0 && audioCtxRef.current) {
      try {
        const master = activeNodesRef.current[0];
        if (master && master.gain) {
          master.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
        }
      } catch {}
    }
  };

  // Quick 6-second preview in modal
  const togglePreviewAudio = (type) => {
    if (isPreviewingAudio) {
      stopAmbientAudio();
    } else {
      startAmbientAudio(type, 0.18);
      setIsPreviewingAudio(true);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => {
        stopAmbientAudio();
      }, 6000);
    }
  };

  // Toggle ambient sound on the fly
  const toggleAmbientSound = (type) => {
    setAmbientSound(type);
    if (type === 'off') {
      stopAmbientAudio();
    } else {
      startAmbientAudio(type);
    }
  };

  // Micro-Tasks Actions
  const toggleTask = (id) => {
    setSessionTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            playTaskChime();
            awardXp(15, `Milestone completed: "${t.text.slice(0, 24)}..." 🎯`);
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const addTask = (text) => {
    if (!text || !text.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
    };
    setSessionTasks((prev) => [...prev, newTask]);
  };

  const removeTask = (id) => {
    setSessionTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Start 5-min breather session
  const startBreatherSession = (customBreakMins = 5) => {
    setIsCompleteOpen(false);
    setSessionPhase('break');
    const breakSecs = customBreakMins * 60;
    setFocusDuration(breakSecs);
    setSecondsRemaining(breakSecs);
    setFocusGoal(`Cycle ${currentCycle} Breather: Stretch & Relax ☕`);
    setIsPaused(false);
    setIsFocusActive(true);
    stopAmbientAudio();
  };

  // Advance to next Pomodoro work block
  const startNextCycle = () => {
    setIsCompleteOpen(false);
    const nextCycleNum = currentCycle + 1;
    setCurrentCycle(nextCycleNum);
    setSessionPhase('work');
    setSecondsRemaining(focusDuration);
    setIsPaused(false);
    setIsFocusActive(true);
    setTabSwitches(0);
    if (ambientSound !== 'off') {
      startAmbientAudio(ambientSound);
    }
  };

  // Cancel / Early Exit
  const cancelFocusSession = () => {
    stopAmbientAudio();
    setIsFocusActive(false);
    setIsPaused(false);
    setIsEmergencyExitOpen(false);
    setIsZenSanctumOpen(false);
    clearInterval(timerRef.current);

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__btm_triggerFocusComplete = (sampleData) => {
        setCompletedSessionData(sampleData || {
          minutes: 5,
          xp: 50,
          goal: 'Calculus & Derivations',
          totalSessions: 57,
          completedTasksCount: 2,
          totalTasksCount: 2,
          tabSwitches: 0,
          currentCycle: 1,
          totalCycles: 1,
          isLaser: true,
        });
        setIsCompleteOpen(true);
      };

      const handleHash = () => {
        if (window.location.hash.includes('focus-complete')) {
          window.__btm_triggerFocusComplete();
        }
      };
      handleHash();
      window.addEventListener('hashchange', handleHash);
      return () => window.removeEventListener('hashchange', handleHash);
    }
  }, []);

  return (
    <FocusContext.Provider
      value={{
        isFocusActive,
        isPaused,
        focusDuration,
        secondsRemaining,
        focusGoal,
        ambientSound,
        ambientVolume,
        updateAmbientVolume,
        tabSwitches,
        isPreviewingAudio,
        togglePreviewAudio,
        isHudMinimized,
        setIsHudMinimized,
        sessionTasks,
        toggleTask,
        addTask,
        removeTask,
        sessionPhase,
        currentCycle,
        totalCycles,
        isZenSanctumOpen,
        setIsZenSanctumOpen,
        isBreathingGuideActive,
        setIsBreathingGuideActive,
        isSetupOpen,
        setIsSetupOpen,
        isCompleteOpen,
        setIsCompleteOpen,
        isEmergencyExitOpen,
        setIsEmergencyExitOpen,
        completedSessionData,
        startFocusSession,
        startBreatherSession,
        startNextCycle,
        pauseFocusSession,
        resumeFocusSession,
        cancelFocusSession,
        finishFocusSession,
        toggleAmbientSound,

        // Mindful Break Studio
        isBreakModalOpen,
        setIsBreakModalOpen,
        breakDuration,
        breakSecondsRemaining,
        isBreakTimerRunning,
        breakSoundscape,
        breakBreathingTechnique,
        setBreakBreathingTechnique,
        breakVisualMode,
        setBreakVisualMode,
        isBreakCompleted,
        openBreakStudio,
        closeBreakStudio,
        toggleBreakTimer,
        setBreakDurationMinutes,
        changeBreakSoundscape,
        finishBreakSession,
        playBowlChime,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export const useFocus = () => useContext(FocusContext);
