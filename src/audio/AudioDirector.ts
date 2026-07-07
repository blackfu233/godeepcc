import type { PullUpPhase } from "../types/game";
import { AUDIO_ASSET_STATUS, AUDIO_STORAGE_KEY, MUSIC_TRACKS, SFX_TRACKS } from "./audioManifest";
import type { AudioClipDefinition, AudioRuntimeSnapshot, AudioSettingsState, MusicLayer, SfxKey } from "./audioTypes";

const DEFAULT_SETTINGS: AudioSettingsState = {
  masterVolume: 0.82,
  musicVolume: 0.62,
  sfxVolume: 0.78,
  musicEnabled: true,
  sfxEnabled: true,
};

interface LoopVoice {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

export class AudioDirector extends EventTarget {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private tensionGain: GainNode | null = null;
  private settings: AudioSettingsState = DEFAULT_SETTINGS;
  private unlocked = false;
  private currentLayer: MusicLayer = 1;
  private musicVoice: LoopVoice | null = null;
  private musicVoiceLayer: MusicLayer | null = null;
  private tensionVoice: LoopVoice | null = null;
  private resultVoice: LoopVoice | null = null;
  private loopVoices = new Map<string, LoopVoice>();
  private oneShotVoices = new Map<string, Set<LoopVoice>>();
  private oneShotStopTokens = new Map<string, number>();
  private buffers = new Map<string, AudioBuffer>();
  private pendingBuffers = new Map<string, Promise<AudioBuffer | null>>();
  private musicToken = 0;
  private pullUpMode = false;
  private currentPullPhase: PullUpPhase | "idle" = "idle";
  private musicLoadingLayer: MusicLayer | null = null;

  constructor() {
    super();
    this.settings = this.loadSettings();
  }

  snapshot(): AudioRuntimeSnapshot {
    return {
      unlocked: this.unlocked,
      currentLayer: this.currentLayer,
      pullUpMode: this.pullUpMode,
      currentPullPhase: this.currentPullPhase,
      placeholder: AUDIO_ASSET_STATUS.mode !== "external-local-assets",
    };
  }

  getSettings() {
    return this.settings;
  }

  setSettings(next: Partial<AudioSettingsState>) {
    this.settings = { ...this.settings, ...next };
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(this.settings));
    this.applySettings();
    this.emitChange();
  }

  resetSettings() {
    this.settings = DEFAULT_SETTINGS;
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(this.settings));
    this.applySettings();
    this.emitChange();
  }

  async unlock() {
    this.ensureContext();
    if (!this.context) return;
    if (this.context.state !== "running") {
      await this.context.resume();
    }
    this.unlocked = true;
    void this.preloadCommonAssets();
    if (this.musicVoiceLayer !== this.currentLayer && this.musicLoadingLayer !== this.currentLayer) {
      void this.ensureMusicLayer(this.currentLayer);
    }
    this.emitChange();
  }

  private ensureContext() {
    if (this.context || typeof window === "undefined") return;
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    this.context = new AudioContextCtor();
    this.masterGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.tensionGain = this.context.createGain();
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.tensionGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
    this.applySettings();
  }

  setMusicLayer(layer: MusicLayer) {
    const sameLayer = this.currentLayer === layer;
    this.currentLayer = layer;
    if (!this.context || !this.unlocked) {
      this.emitChange();
      return;
    }
    if (sameLayer && (this.musicVoiceLayer === layer || this.musicLoadingLayer === layer)) {
      this.emitChange();
      return;
    }
    void this.ensureMusicLayer(layer);
    this.emitChange();
  }

  setPullUpMode(active: boolean, phase: PullUpPhase | "idle" = "idle") {
    this.pullUpMode = active;
    this.currentPullPhase = phase;
    if (!this.context || !this.unlocked || !this.musicGain || !this.tensionGain) {
      this.emitChange();
      return;
    }

    const now = this.context.currentTime;
    const musicTarget = active ? 0.42 : 1;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setTargetAtTime(this.settings.musicEnabled ? this.settings.musicVolume * musicTarget : 0.0001, now, 0.32);
    this.tensionGain.gain.cancelScheduledValues(now);
    this.tensionGain.gain.setTargetAtTime(active && this.settings.musicEnabled ? this.settings.musicVolume * 0.72 : 0.0001, now, 0.3);

    if (active) {
      void this.startTensionLoop();
    } else {
      this.stopVoice(this.tensionVoice, 0.5);
      this.tensionVoice = null;
      this.stopLoop("pullup-vortex", 0.3);
      this.stopLoop("pullup-route", 0.3);
      this.stopLoop("pullup-high-struggle", 0.2);
    }
    this.emitChange();
  }

  playSfx(key: SfxKey) {
    const definition = SFX_TRACKS[key];
    if (!definition || !this.context || !this.unlocked || !this.sfxGain || !this.settings.sfxEnabled) return;
    const rate = key === "pullup_low_catch" ? 0.94 + Math.random() * 0.12 : 1;
    const gainJitter = key === "pullup_low_catch" ? 0.82 + Math.random() * 0.28 : 1;
    void this.playOneShot(definition, this.sfxGain, definition.volume ?? 1, rate, gainJitter);
  }

  stopSfx(key: SfxKey, fadeSeconds = 0.08) {
    this.oneShotStopTokens.set(key, (this.oneShotStopTokens.get(key) ?? 0) + 1);
    const voices = this.oneShotVoices.get(key);
    if (!voices) return;
    for (const voice of voices) {
      this.stopVoice(voice, fadeSeconds);
    }
    voices.clear();
    this.oneShotVoices.delete(key);
  }

  playLoop(key: SfxKey, loopId: string = key) {
    const definition = SFX_TRACKS[key];
    if (!definition || !this.context || !this.unlocked || !this.sfxGain || !this.settings.sfxEnabled) return;
    if (this.loopVoices.has(loopId)) return;
    void this.startLoop(definition, this.sfxGain, definition.volume ?? 0.5, loopId, 0.22);
  }

  stopLoop(loopId: string, fadeSeconds = 0.18) {
    const voice = this.loopVoices.get(loopId);
    if (!voice) return;
    this.stopVoice(voice, fadeSeconds);
    this.loopVoices.delete(loopId);
  }

  setLoopGain(loopId: string, volume: number, fadeSeconds = 0.18) {
    const voice = this.loopVoices.get(loopId);
    if (!voice || !this.context) return;
    const now = this.context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(Math.max(0.0001, volume), now, Math.max(0.03, fadeSeconds / 3));
  }

  stopAllLoops() {
    for (const loopId of this.loopVoices.keys()) {
      this.stopLoop(loopId);
    }
    this.stopVoice(this.tensionVoice, 0.35);
    this.tensionVoice = null;
  }

  playResult(label: string) {
    this.stopAllLoops();
    const normalized = label.toLowerCase();
    if (normalized.includes("ultimate")) this.playSfx("result_ultimate_win");
    else if (normalized.includes("ultra")) this.playSfx("result_ultra_win");
    else if (normalized.includes("super")) this.playSfx("result_super_win");
    else if (normalized.includes("mega")) this.playSfx("result_mega_win");
    else if (normalized.includes("big")) this.playSfx("result_big_win");
    else this.playSfx("result_small_win");

    if (normalized.includes("big") || normalized.includes("mega") || normalized.includes("super") || normalized.includes("ultra") || normalized.includes("ultimate")) {
      void this.playResultMusic();
    }
  }

  private async ensureMusicLayer(layer: MusicLayer) {
    if (!this.context || !this.musicGain || !this.settings.musicEnabled) return;
    if (this.musicVoiceLayer === layer || this.musicLoadingLayer === layer) return;
    const token = ++this.musicToken;
    this.musicLoadingLayer = layer;
    const next = await this.createLoopVoice(MUSIC_TRACKS[layer], this.musicGain, MUSIC_TRACKS[layer].volume ?? 0.7, 1.8);
    if (this.musicLoadingLayer === layer) {
      this.musicLoadingLayer = null;
    }
    if (!next || token !== this.musicToken) {
      if (next) this.stopVoice(next, 0.01);
      return;
    }
    const previous = this.musicVoice;
    this.musicVoice = next;
    this.musicVoiceLayer = layer;
    this.stopVoice(previous, 1.8);
  }

  private async startTensionLoop() {
    if (!this.context || !this.tensionGain || this.tensionVoice || !this.settings.musicEnabled) return;
    this.tensionVoice = await this.createLoopVoice(MUSIC_TRACKS.pullup, this.tensionGain, MUSIC_TRACKS.pullup.volume ?? 0.6, 0.65);
  }

  private async playResultMusic() {
    if (!this.context || !this.musicGain || !this.settings.musicEnabled) return;
    this.stopVoice(this.resultVoice, 0.2);
    this.resultVoice = await this.createLoopVoice(MUSIC_TRACKS.resultBigWin, this.musicGain, MUSIC_TRACKS.resultBigWin.volume ?? 0.75, 0.35, false);
  }

  private async startLoop(definition: AudioClipDefinition, destination: GainNode, volume: number, loopId: string, fadeSeconds: number) {
    const voice = await this.createLoopVoice(definition, destination, volume, fadeSeconds, true);
    if (!voice || this.loopVoices.has(loopId)) {
      if (voice) this.stopVoice(voice, 0.01);
      return;
    }
    this.loopVoices.set(loopId, voice);
  }

  private async createLoopVoice(definition: AudioClipDefinition, destination: GainNode, volume: number, fadeSeconds: number, loop = true) {
    if (!this.context) return null;
    const buffer = await this.loadBuffer(definition.src);
    if (!buffer || !this.context) return null;
    const now = this.context.currentTime;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.loop = loop;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.setTargetAtTime(volume, now, Math.max(0.03, fadeSeconds / 3));
    source.connect(gain);
    gain.connect(destination);
    source.start(now);
    return { source, gain };
  }

  private async playOneShot(definition: AudioClipDefinition, destination: GainNode, volume: number, playbackRate = 1, gainJitter = 1) {
    if (!this.context) return;
    const stopToken = this.oneShotStopTokens.get(definition.key) ?? 0;
    const buffer = await this.loadBuffer(definition.src);
    if (!buffer || !this.context) return;
    if ((this.oneShotStopTokens.get(definition.key) ?? 0) !== stopToken) return;
    const now = this.context.currentTime;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, now);
    gain.gain.setValueAtTime(volume * gainJitter, now);
    source.connect(gain);
    gain.connect(destination);
    const voice = { source, gain };
    const voiceSet = this.oneShotVoices.get(definition.key) ?? new Set<LoopVoice>();
    voiceSet.add(voice);
    this.oneShotVoices.set(definition.key, voiceSet);
    source.onended = () => {
      voiceSet.delete(voice);
      if (voiceSet.size === 0) this.oneShotVoices.delete(definition.key);
    };
    source.start(now);
    source.stop(now + Math.min(buffer.duration / playbackRate, definition.maxDuration ?? 4.2));
  }

  private stopVoice(voice: LoopVoice | null, fadeSeconds: number) {
    if (!voice || !this.context) return;
    const now = this.context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0.0001, now, Math.max(0.03, fadeSeconds / 3));
    window.setTimeout(() => {
      try {
        voice.source.stop();
      } catch {
        // Already stopped.
      }
      voice.source.disconnect();
      voice.gain.disconnect();
    }, Math.max(20, fadeSeconds * 1000 + 80));
  }

  private async loadBuffer(src: string) {
    if (!this.context) return null;
    const cached = this.buffers.get(src);
    if (cached) return cached;
    const pending = this.pendingBuffers.get(src);
    if (pending) return pending;
    const request = fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Audio asset failed: ${src}`);
        return response.arrayBuffer();
      })
      .then((buffer) => this.context?.decodeAudioData(buffer.slice(0)) ?? null)
      .then((decoded) => {
        if (decoded) this.buffers.set(src, decoded);
        this.pendingBuffers.delete(src);
        return decoded;
      })
      .catch((error) => {
        if (import.meta.env.DEV) console.warn(error);
        this.pendingBuffers.delete(src);
        return null;
      });
    this.pendingBuffers.set(src, request);
    return request;
  }

  private preloadCommonAssets() {
    const paths = [
      MUSIC_TRACKS[1].src,
      SFX_TRACKS.ui_bet_change.src,
      SFX_TRACKS.ui_go_deep_press.src,
      SFX_TRACKS.chain_descend.src,
      SFX_TRACKS.zone_reveal.src,
    ];
    paths.forEach((path) => void this.loadBuffer(path));
  }

  private applySettings() {
    if (!this.masterGain || !this.musicGain || !this.sfxGain || !this.tensionGain) return;
    const now = this.context?.currentTime ?? 0;
    this.masterGain.gain.setTargetAtTime(this.settings.masterVolume, now, 0.06);
    this.musicGain.gain.setTargetAtTime(this.settings.musicEnabled ? this.settings.musicVolume : 0.0001, now, 0.16);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfxEnabled ? this.settings.sfxVolume : 0.0001, now, 0.06);
    this.tensionGain.gain.setTargetAtTime(this.pullUpMode && this.settings.musicEnabled ? this.settings.musicVolume * 0.72 : 0.0001, now, 0.12);
  }

  private loadSettings(): AudioSettingsState {
    try {
      const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (!stored) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  private emitChange() {
    this.dispatchEvent(new Event("change"));
  }
}

let director: AudioDirector | null = null;

export function getAudioDirector() {
  if (!director) director = new AudioDirector();
  return director;
}
