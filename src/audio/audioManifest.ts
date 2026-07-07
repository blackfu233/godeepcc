import type { AudioClipDefinition, MusicLayer, SfxKey } from "./audioTypes";

export const AUDIO_STORAGE_KEY = "go-deep-audio-settings";

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const AUDIO_ASSET_STATUS = {
  mode: "external-local-assets",
  label: "Mixkit local audio assets",
  license: "https://mixkit.co/license/",
};

export const MUSIC_LAYER_LABELS: Record<MusicLayer, string> = {
  1: "Sunlit Shelf",
  2: "Deep Current",
  3: "Abyssal Zone",
  4: "Dragon Trench",
};

export const MUSIC_TRACKS: Record<MusicLayer | "pullup" | "resultBigWin", AudioClipDefinition> = {
  1: { key: "bgm_surface_loop", src: publicAsset("audio/music/bgm_surface_loop.mp3"), loop: true, volume: 0.72 },
  2: { key: "bgm_mid_depth_loop", src: publicAsset("audio/music/bgm_mid_depth_loop.mp3"), loop: true, volume: 0.68 },
  3: { key: "bgm_deep_abyss_loop", src: publicAsset("audio/music/bgm_deep_abyss_loop.mp3"), loop: true, volume: 0.66 },
  4: { key: "bgm_max_depth_loop", src: publicAsset("audio/music/bgm_max_depth_loop.mp3"), loop: true, volume: 0.7 },
  pullup: { key: "bgm_pullup_tension_loop", src: publicAsset("audio/music/bgm_pullup_tension_loop.mp3"), loop: true, volume: 0.62 },
  resultBigWin: { key: "bgm_result_bigwin", src: publicAsset("audio/music/bgm_result_bigwin.mp3"), loop: false, volume: 0.8 },
};

export const SFX_TRACKS: Record<SfxKey, AudioClipDefinition> = {
  ui_bet_change: { key: "ui_bet_change", src: publicAsset("audio/sfx/ui_bet_change.mp3"), volume: 0.5 },
  ui_go_deep_press: { key: "ui_go_deep_press", src: publicAsset("audio/sfx/ui_go_deep_press.mp3"), volume: 0.6 },
  wallet_wager_deduct: { key: "wallet_wager_deduct", src: publicAsset("audio/sfx/wallet_wager_deduct.mp3"), volume: 0.56 },
  chain_descend: { key: "chain_descend", src: publicAsset("audio/sfx/chain_descend.mp3"), volume: 0.56, maxDuration: 0.5 },
  zone_reveal: { key: "zone_reveal", src: publicAsset("audio/sfx/zone_reveal.mp3"), volume: 0.52 },
  rare_fish_reveal: { key: "rare_fish_reveal", src: publicAsset("audio/sfx/rare_fish_reveal.mp3"), volume: 0.5 },
  milestone_sting: { key: "milestone_sting", src: publicAsset("audio/sfx/milestone_sting.mp3"), volume: 0.46 },
  event_twin_trigger: { key: "event_twin_trigger", src: publicAsset("audio/sfx/event_twin_trigger.mp3"), volume: 0.58 },
  event_pearl_trigger: { key: "event_pearl_trigger", src: publicAsset("audio/sfx/event_pearl_trigger.mp3"), volume: 0.58 },
  event_puffer_trigger: { key: "event_puffer_trigger", src: publicAsset("audio/sfx/event_puffer_trigger.mp3"), volume: 0.6 },
  event_thunder_trigger: { key: "event_thunder_trigger", src: publicAsset("audio/sfx/event_thunder_trigger.mp3"), volume: 0.6 },
  event_twin_spin: { key: "event_twin_spin", src: publicAsset("audio/sfx/event_twin_spin.mp3"), volume: 0.54 },
  event_twin_charge: { key: "event_twin_charge", src: publicAsset("audio/sfx/event_twin_charge.mp3"), volume: 0.52 },
  event_twin_scan: { key: "event_twin_scan", src: publicAsset("audio/sfx/event_twin_scan.mp3"), volume: 0.52 },
  event_twin_duplicate: { key: "event_twin_duplicate", src: publicAsset("audio/sfx/event_twin_duplicate.mp3"), volume: 0.58 },
  event_pearl_open: { key: "event_pearl_open", src: publicAsset("audio/sfx/event_pearl_open.mp3"), volume: 0.56 },
  event_pearl_coin_burst: { key: "event_pearl_coin_burst", src: publicAsset("audio/sfx/event_pearl_coin_burst.mp3"), volume: 0.62 },
  event_pearl_multiplier_upgrade: { key: "event_pearl_multiplier_upgrade", src: publicAsset("audio/sfx/event_pearl_multiplier_upgrade.mp3"), volume: 0.56 },
  event_puffer_inflate: { key: "event_puffer_inflate", src: publicAsset("audio/sfx/event_puffer_inflate.mp3"), volume: 0.58 },
  event_puffer_tension: { key: "event_puffer_tension", src: publicAsset("audio/sfx/event_puffer_tension.mp3"), volume: 0.5 },
  event_puffer_burst: { key: "event_puffer_burst", src: publicAsset("audio/sfx/event_puffer_burst.mp3"), volume: 0.5 },
  event_puffer_stun: { key: "event_puffer_stun", src: publicAsset("audio/sfx/event_puffer_stun.mp3"), volume: 0.56 },
  event_jelly_attach: { key: "event_jelly_attach", src: publicAsset("audio/sfx/event_jelly_attach.mp3"), volume: 0.5 },
  event_jelly_strike: { key: "event_jelly_strike", src: publicAsset("audio/sfx/event_jelly_strike.mp3"), volume: 0.62 },
  event_jelly_chain_hit: { key: "event_jelly_chain_hit", src: publicAsset("audio/sfx/event_jelly_chain_hit.mp3"), volume: 0.56 },
  event_jelly_expire: { key: "event_jelly_expire", src: publicAsset("audio/sfx/event_jelly_expire.mp3"), volume: 0.44 },
  pullup_button_press: { key: "pullup_button_press", src: publicAsset("audio/sfx/pullup_button_press.mp3"), volume: 0.58 },
  pullup_camera_drop: { key: "pullup_camera_drop", src: publicAsset("audio/sfx/pullup_camera_drop.mp3"), volume: 0.58 },
  pullup_chain_tension: { key: "pullup_chain_tension", src: publicAsset("audio/sfx/pullup_chain_tension.mp3"), volume: 0.54 },
  pullup_vortex_build_loop: { key: "pullup_vortex_build_loop", src: publicAsset("audio/sfx/pullup_vortex_build_loop.mp3"), loop: true, volume: 0.48 },
  pullup_route_sweep_loop: { key: "pullup_route_sweep_loop", src: publicAsset("audio/sfx/pullup_route_sweep_loop.mp3"), loop: true, volume: 0.44 },
  pullup_low_catch: { key: "pullup_low_catch", src: publicAsset("audio/sfx/pullup_low_catch.mp3"), volume: 0.42 },
  pullup_low_miss: { key: "pullup_low_miss", src: publicAsset("audio/sfx/pullup_low_miss.mp3"), volume: 0.4 },
  pullup_high_struggle_loop: { key: "pullup_high_struggle_loop", src: publicAsset("audio/sfx/pullup_high_struggle_loop.mp3"), loop: true, volume: 0.42 },
  pullup_reel_idle: { key: "pullup_reel_idle", src: publicAsset("audio/sfx/pullup_reel_spin.mp3"), volume: 0.26 },
  pullup_reel_spin: { key: "pullup_reel_spin", src: publicAsset("audio/sfx/pullup_reel_spin.mp3"), volume: 0.5, maxDuration: 1.65 },
  pullup_reel_stop: { key: "pullup_reel_stop", src: publicAsset("audio/sfx/pullup_reel_stop.mp3"), volume: 0.56 },
  pullup_high_catch: { key: "pullup_high_catch", src: publicAsset("audio/sfx/pullup_high_catch.mp3"), volume: 0.66 },
  pullup_high_escape: { key: "pullup_high_escape", src: publicAsset("audio/sfx/pullup_high_escape.mp3"), volume: 0.58 },
  pullup_surface_splash: { key: "pullup_surface_splash", src: publicAsset("audio/sfx/pullup_surface_splash.mp3"), volume: 0.62 },
  result_small_win: { key: "result_small_win", src: publicAsset("audio/sfx/result_small_win.mp3"), volume: 0.42 },
  result_big_win: { key: "result_big_win", src: publicAsset("audio/sfx/result_big_win.mp3"), volume: 0.5 },
  result_mega_win: { key: "result_mega_win", src: publicAsset("audio/sfx/result_mega_win.mp3"), volume: 0.56 },
  result_super_win: { key: "result_super_win", src: publicAsset("audio/sfx/result_mega_win.mp3"), volume: 0.6 },
  result_ultra_win: { key: "result_ultra_win", src: publicAsset("audio/sfx/result_mega_win.mp3"), volume: 0.64 },
  result_ultimate_win: { key: "result_ultimate_win", src: publicAsset("audio/sfx/result_mega_win.mp3"), volume: 0.68 },
  route_checkpoint_sting: { key: "route_checkpoint_sting", src: publicAsset("audio/sfx/milestone_sting.mp3"), volume: 0.42 },
  route_cards_reveal: { key: "route_cards_reveal", src: publicAsset("audio/sfx/zone_reveal.mp3"), volume: 0.34 },
  route_confirm: { key: "route_confirm", src: publicAsset("audio/sfx/event_pearl_multiplier_upgrade.mp3"), volume: 0.42 },
  route_school_hover: { key: "route_school_hover", src: publicAsset("audio/sfx/event_twin_scan.mp3"), volume: 0.22, maxDuration: 0.45 },
  route_golden_hover: { key: "route_golden_hover", src: publicAsset("audio/sfx/event_pearl_multiplier_upgrade.mp3"), volume: 0.24, maxDuration: 0.45 },
  route_storm_hover: { key: "route_storm_hover", src: publicAsset("audio/sfx/event_jelly_chain_hit.mp3"), volume: 0.18, maxDuration: 0.45 },
  route_school_ambient_loop: { key: "route_school_ambient_loop", src: publicAsset("audio/sfx/pullup_route_sweep_loop.mp3"), loop: true, volume: 0.12 },
  route_golden_ambient_loop: { key: "route_golden_ambient_loop", src: publicAsset("audio/sfx/pullup_vortex_build_loop.mp3"), loop: true, volume: 0.1 },
  route_storm_ambient_loop: { key: "route_storm_ambient_loop", src: publicAsset("audio/sfx/pullup_high_struggle_loop.mp3"), loop: true, volume: 0.08 },
};

export function musicLayerForDepth(depth: number): MusicLayer {
  if (depth >= 7500) return 4;
  if (depth >= 5000) return 3;
  if (depth >= 2500) return 2;
  return 1;
}

export function milestoneLabel(depth: number) {
  if (depth >= 10000) return "10,000m - MAX DEPTH";
  if (depth >= 7500) return "7,500m - DRAGON TRENCH";
  if (depth >= 5000) return "5,000m - ABYSSAL ZONE";
  if (depth >= 2500) return "2,500m - DEEPER WATERS";
  return null;
}
