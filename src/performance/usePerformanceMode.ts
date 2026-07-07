import { useEffect, useMemo, useState } from "react";
import { getDeviceProfile } from "./deviceProfile";
import { FpsMonitor } from "./FpsMonitor";
import { PERFORMANCE_STORAGE_KEY, type PerformanceMode, type PerformancePreference } from "./performanceConfig";

function readPreference(): PerformancePreference {
  if (typeof window === "undefined") return "auto";
  const stored = localStorage.getItem(PERFORMANCE_STORAGE_KEY);
  return stored === "high" || stored === "medium" || stored === "low" || stored === "auto" ? stored : "auto";
}

export function usePerformanceMode() {
  const [preference, setPreferenceState] = useState<PerformancePreference>(readPreference);
  const [profile, setProfile] = useState(getDeviceProfile);
  const [fps, setFps] = useState<number | null>(null);
  const [runtimeDegrade, setRuntimeDegrade] = useState<PerformanceMode | null>(null);

  useEffect(() => {
    const onResize = () => setProfile(getDeviceProfile());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const monitor = new FpsMonitor((nextFps, degraded) => {
      setFps(nextFps);
      setRuntimeDegrade(degraded);
    });
    monitor.start();
    return () => monitor.stop();
  }, []);

  const effectiveMode = useMemo<PerformanceMode>(() => {
    if (preference !== "auto") return preference;
    if (runtimeDegrade) return runtimeDegrade;
    return profile.recommendedMode;
  }, [preference, profile.recommendedMode, runtimeDegrade]);

  const setPreference = (next: PerformancePreference) => {
    setPreferenceState(next);
    localStorage.setItem(PERFORMANCE_STORAGE_KEY, next);
    setRuntimeDegrade(null);
  };

  return {
    effectiveMode,
    fps,
    preference,
    profile,
    runtimeDegrade,
    setPreference,
  };
}
