import type { EventType, PullUpPhase } from "../types/game";

export type AudioBusName = "master" | "music" | "sfx";

export interface AudioSettingsState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export type MusicLayer = 1 | 2 | 3 | 4;

export type SfxKey =
  | "ui_bet_change"
  | "ui_go_deep_press"
  | "wallet_wager_deduct"
  | "chain_descend"
  | "zone_reveal"
  | "rare_fish_reveal"
  | "milestone_sting"
  | `event_${EventType}_trigger`
  | "event_twin_spin"
  | "event_twin_charge"
  | "event_twin_scan"
  | "event_twin_duplicate"
  | "event_pearl_open"
  | "event_pearl_coin_burst"
  | "event_pearl_multiplier_upgrade"
  | "event_puffer_inflate"
  | "event_puffer_tension"
  | "event_puffer_burst"
  | "event_puffer_stun"
  | "event_jelly_attach"
  | "event_jelly_strike"
  | "event_jelly_chain_hit"
  | "event_jelly_expire"
  | "pullup_button_press"
  | "pullup_camera_drop"
  | "pullup_chain_tension"
  | "pullup_vortex_build_loop"
  | "pullup_route_sweep_loop"
  | "pullup_low_catch"
  | "pullup_low_miss"
  | "pullup_high_struggle_loop"
  | "pullup_reel_idle"
  | "pullup_reel_spin"
  | "pullup_reel_stop"
  | "pullup_high_catch"
  | "pullup_high_escape"
  | "pullup_surface_splash"
  | "result_small_win"
  | "result_big_win"
  | "result_mega_win"
  | "result_super_win"
  | "result_ultra_win"
  | "result_ultimate_win"
  | "route_checkpoint_sting"
  | "route_cards_reveal"
  | "route_confirm"
  | "route_school_hover"
  | "route_golden_hover"
  | "route_storm_hover"
  | "route_school_ambient_loop"
  | "route_golden_ambient_loop"
  | "route_storm_ambient_loop";

export interface AudioClipDefinition {
  key: string;
  src: string;
  volume?: number;
  loop?: boolean;
  maxDuration?: number;
}

export interface AudioRuntimeSnapshot {
  unlocked: boolean;
  currentLayer: MusicLayer;
  pullUpMode: boolean;
  currentPullPhase: PullUpPhase | "idle";
  placeholder: boolean;
}
