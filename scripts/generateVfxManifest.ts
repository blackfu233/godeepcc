import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] ?? "assets/vfx/hook_anomaly";
const output = process.argv[3] ?? "assets/vfx/hook_anomaly/manifest.index.json";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const manifests = walk(root)
  .filter((file) => file.endsWith("manifest.json"))
  .map((file) => relative(root, file).replace(/\\/g, "/"))
  .sort();

writeFileSync(output, JSON.stringify({ root, manifests, count: manifests.length }, null, 2));
console.log(`Indexed ${manifests.length} VFX manifests.`);
