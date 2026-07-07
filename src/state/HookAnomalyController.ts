import type { HookAnomalyState } from "../types/hookAnomaly";

export function createInitialHookAnomalyState(): HookAnomalyState {
  return {
    cooldown: 0,
    pity: 0,
    rust: "normal",
    broken: false,
    persistent: {},
    rareSignal: null,
    debug: {
      cooldown: 0,
      pity: 0,
      finalChance: 0,
      roll: null,
      triggered: false,
      lastEventId: null,
      lastPolarity: null,
    },
    history: [],
  };
}

export function clearRunHookAnomalyState(state?: HookAnomalyState | null): HookAnomalyState {
  const next = createInitialHookAnomalyState();
  if (state?.history.length) {
    next.history = state.history.slice(-12);
  }
  return next;
}

export function hasPersistentHookEffect(state: HookAnomalyState, id: keyof HookAnomalyState["persistent"]) {
  return Boolean(state.persistent[id]?.remaining && state.persistent[id]!.remaining > 0);
}
