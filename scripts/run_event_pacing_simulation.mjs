import { mkdir, writeFile } from "node:fs/promises";
import { build } from "esbuild";

await mkdir("tmp", { recursive: true });

await build({
  entryPoints: ["src/utils/simulateRuns.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "tmp/simulateRuns.bundle.mjs",
});

const { runEventPacingSimulation } = await import("../tmp/simulateRuns.bundle.mjs?cache=" + Date.now());
const markdown = runEventPacingSimulation(20000);
await writeFile("EVENT_PACING_SIMULATION.md", markdown, "utf8");

console.log(markdown);
