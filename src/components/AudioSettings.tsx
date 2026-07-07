import type { AudioRuntimeSnapshot, AudioSettingsState } from "../audio/audioTypes";

interface AudioSettingsProps {
  settings: AudioSettingsState;
  snapshot: AudioRuntimeSnapshot;
  onUnlock: () => void;
  onChange: (next: Partial<AudioSettingsState>) => void;
  onReset: () => void;
}

export function AudioSettings({ settings, snapshot, onUnlock, onChange, onReset }: AudioSettingsProps) {
  const muted = settings.masterVolume <= 0 || (!settings.musicEnabled && !settings.sfxEnabled);
  return (
    <section className="audio-settings">
      <header>
        <b>AUDIO</b>
        <span>{snapshot.unlocked ? "MUSIC READY" : "TAP TO ENABLE"}</span>
      </header>
      <button className="audio-unlock" onClick={onUnlock}>
        {snapshot.unlocked ? "Audio Ready" : "Enable Audio"}
      </button>
      <label>
        <span>Master</span>
        <input type="range" min="0" max="1" step="0.01" value={settings.masterVolume} onChange={(event) => onChange({ masterVolume: Number(event.target.value) })} />
      </label>
      <label>
        <span>Music</span>
        <input type="checkbox" checked={settings.musicEnabled} onChange={(event) => onChange({ musicEnabled: event.target.checked })} />
      </label>
      <label>
        <span>Music Vol</span>
        <input type="range" min="0" max="1" step="0.01" value={settings.musicVolume} onChange={(event) => onChange({ musicVolume: Number(event.target.value) })} />
      </label>
      <label>
        <span>SFX</span>
        <input type="checkbox" checked={settings.sfxEnabled} onChange={(event) => onChange({ sfxEnabled: event.target.checked })} />
      </label>
      <label>
        <span>SFX Vol</span>
        <input type="range" min="0" max="1" step="0.01" value={settings.sfxVolume} onChange={(event) => onChange({ sfxVolume: Number(event.target.value) })} />
      </label>
      <div className="audio-actions">
        <button onClick={() => onChange(muted ? { masterVolume: 0.82, musicEnabled: true, sfxEnabled: true } : { masterVolume: 0, musicEnabled: false, sfxEnabled: false })}>
          {muted ? "Unmute All" : "Mute All"}
        </button>
        <button onClick={onReset}>Reset Audio</button>
      </div>
      {snapshot.placeholder && <em>Audio assets unavailable</em>}
    </section>
  );
}
