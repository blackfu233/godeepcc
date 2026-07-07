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

const { runSimulation } = await import("../tmp/simulateRuns.bundle.mjs?cache=" + Date.now());
const report = runSimulation(2000);
await writeFile("SIMULATION_REPORT.md", report.markdown, "utf8");

console.log(report.markdown);
