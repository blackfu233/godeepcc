import { spawnSync } from "node:child_process";

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  throw new Error("Usage: tsx scripts/removeChromaKey.ts <input.png> <output.png>");
}

const helper = `${process.env.CODEX_HOME ?? `${process.env.USERPROFILE}\\.codex`}\\skills\\.system\\imagegen\\scripts\\remove_chroma_key.py`;
const result = spawnSync("python", [
  helper,
  "--input",
  input,
  "--out",
  output,
  "--auto-key",
  "border",
  "--soft-matte",
  "--transparent-threshold",
  "12",
  "--opaque-threshold",
  "220",
  "--despill",
], { stdio: "inherit" });

if (result.status !== 0) {
  throw new Error(`Chroma-key removal failed with status ${result.status}`);
}
