export type HookAnomalyVfxKey =
  | "hookGlowPositive"
  | "hookGlowNegative"
  | "rustLight"
  | "rustHeavy"
  | "rustBreakRisk"
  | "hookBreak"
  | "hookRepair"
  | "rareSignalFake"
  | "rareSignalReal"
  | "goldenTide"
  | "treasureWake"
  | "tidebornTwinFish"
  | "tidebornPearl"
  | "tidebornPuffer"
  | "tidebornJelly"
  | "luckyBait"
  | "abyssBeacon"
  | "gildedHook"
  | "panicCurrent"
  | "abyssPredator"
  | "bannerPositive"
  | "bannerNegative"
  | "iconLuckyBait"
  | "iconAbyssBeacon"
  | "iconGildedHook"
  | "iconJellyfishActive"
  | "iconRareSignal"
  | "iconRustLight"
  | "iconRustHeavy"
  | "iconRustBreakRisk";

export interface HookAnomalyVfxAsset {
  key: HookAnomalyVfxKey;
  src: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  anchorPoint: { x: number; y: number };
}

const asset = (
  key: HookAnomalyVfxKey,
  src: string,
  frameWidth: number,
  frameHeight: number,
  columns: number,
  rows: number,
  frameCount: number,
  fps = 12,
  loop = false,
): HookAnomalyVfxAsset => ({
  key,
  src,
  frameWidth,
  frameHeight,
  columns,
  rows,
  frameCount,
  fps,
  loop,
  anchorPoint: { x: 0.5, y: 0.5 },
});

export const HOOK_ANOMALY_VFX_MANIFEST: Record<HookAnomalyVfxKey, HookAnomalyVfxAsset> = {
  hookGlowPositive: asset("hookGlowPositive", new URL("../../assets/vfx/hook_anomaly/glow/hook_glow_positive/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12, 12, true),
  hookGlowNegative: asset("hookGlowNegative", new URL("../../assets/vfx/hook_anomaly/glow/hook_glow_negative/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12, 12, true),
  rustLight: asset("rustLight", new URL("../../assets/vfx/hook_anomaly/rust/rust_stage_light/sheet.png", import.meta.url).href, 362, 362, 4, 3, 12),
  rustHeavy: asset("rustHeavy", new URL("../../assets/vfx/hook_anomaly/rust/rust_stage_heavy/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  rustBreakRisk: asset("rustBreakRisk", new URL("../../assets/vfx/hook_anomaly/rust/rust_stage_breakrisk/sheet.png", import.meta.url).href, 362, 362, 4, 3, 12, 12, true),
  hookBreak: asset("hookBreak", new URL("../../assets/vfx/hook_anomaly/break_repair/hook_break/sheet.png", import.meta.url).href, 362, 362, 4, 3, 12),
  hookRepair: asset("hookRepair", new URL("../../assets/vfx/hook_anomaly/break_repair/hook_repair/sheet.png", import.meta.url).href, 362, 362, 4, 3, 12),
  rareSignalFake: asset("rareSignalFake", new URL("../../assets/vfx/hook_anomaly/rare_signal/rare_signal_fake/sheet.png", import.meta.url).href, 443, 295, 4, 3, 12),
  rareSignalReal: asset("rareSignalReal", new URL("../../assets/vfx/hook_anomaly/rare_signal/rare_signal_real/sheet.png", import.meta.url).href, 362, 362, 4, 3, 12),
  goldenTide: asset("goldenTide", new URL("../../assets/vfx/hook_anomaly/fish_buff/fish_buff_plus2/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  treasureWake: asset("treasureWake", new URL("../../assets/vfx/hook_anomaly/treasure_wake/treasure_wake_spawn/sheet.png", import.meta.url).href, 443, 295, 4, 3, 12),
  tidebornTwinFish: asset("tidebornTwinFish", new URL("../../assets/vfx/hook_anomaly/tideborn_call/tideborn_twinfish_summon/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  tidebornPearl: asset("tidebornPearl", new URL("../../assets/vfx/hook_anomaly/tideborn_call/tideborn_pearl_summon/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  tidebornPuffer: asset("tidebornPuffer", new URL("../../assets/vfx/hook_anomaly/tideborn_call/tideborn_puffer_summon/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  tidebornJelly: asset("tidebornJelly", new URL("../../assets/vfx/hook_anomaly/tideborn_call/tideborn_jelly_summon/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  luckyBait: asset("luckyBait", new URL("../../assets/vfx/hook_anomaly/lucky_bait/lucky_bait_apply/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  abyssBeacon: asset("abyssBeacon", new URL("../../assets/vfx/hook_anomaly/abyss_beacon/abyss_beacon_apply/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  gildedHook: asset("gildedHook", new URL("../../assets/vfx/hook_anomaly/gilded_hook/gilded_hook_apply/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  panicCurrent: asset("panicCurrent", new URL("../../assets/vfx/hook_anomaly/panic_current/panic_current_sweep/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  abyssPredator: asset("abyssPredator", new URL("../../assets/vfx/hook_anomaly/abyss_predator/abyss_predator_shadow/sheet.png", import.meta.url).href, 384, 341, 4, 3, 12),
  bannerPositive: asset("bannerPositive", new URL("../../assets/vfx/hook_anomaly/banners/banner_positive_base/sheet-keyed.png", import.meta.url).href, 443, 443, 4, 2, 8, 12),
  bannerNegative: asset("bannerNegative", new URL("../../assets/vfx/hook_anomaly/banners/banner_negative_base/sheet-keyed.png", import.meta.url).href, 443, 443, 4, 2, 8, 12),
  iconLuckyBait: asset("iconLuckyBait", new URL("../../assets/vfx/hook_anomaly/ui_icons/icon_lucky_bait/sheet.png", import.meta.url).href, 443, 443, 1, 1, 1, 1, false),
  iconAbyssBeacon: asset("iconAbyssBeacon", new URL("../../assets/vfx/hook_anomaly/ui_icons/icon_abyss_beacon/sheet.png", import.meta.url).href, 443, 443, 1, 1, 1, 1, false),
  iconGildedHook: asset("iconGildedHook", new URL("../../assets/vfx/hook_anomaly/ui_icons/icon_gilded_hook/sheet.png", import.meta.url).href, 443, 443, 1, 1, 1, 1, false),
  iconJellyfishActive: asset("iconJellyfishActive", new URL("../../assets/vfx/hook_anomaly/ui_icons/icon_jellyfish_active/sheet.png", import.meta.url).href, 443, 443, 1, 1, 1, 1, false),
  iconRareSignal: asset("iconRareSignal", new URL("../../assets/vfx/hook_anomaly/ui_icons/icon_rare_signal/sheet.png", import.meta.url).href, 443, 443, 1, 1, 1, 1, false),
  iconRustLight: asset("iconRustLight", new URL("../../assets/vfx/hook_anomaly/ui_icons/icon_rust_state_light/sheet.png", import.meta.url).href, 443, 443, 1, 1, 1, 1, false),
  iconRustHeavy: asset("iconRustHeavy", new URL("../../assets/vfx/hook_anomaly/ui_icons/icon_rust_state_heavy/sheet.png", import.meta.url).href, 443, 443, 1, 1, 1, 1, false),
  iconRustBreakRisk: asset("iconRustBreakRisk", new URL("../../assets/vfx/hook_anomaly/ui_icons/icon_rust_state_breakrisk/sheet.png", import.meta.url).href, 443, 443, 1, 1, 1, 1, false),
};
