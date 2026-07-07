import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SPRITE_DIRS = ["src/assets/animated-effects", "assets/vfx"];
const TARGET_BYTES = 1024 * 1024;

function walk(dir: string, rows: string[]) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, rows);
    else if (name.endsWith(".png") && (name.includes("sheet") || name.includes("sprite"))) {
      rows.push(`${(stat.size / 1024 / 1024).toFixed(2)} MB\t${relative(ROOT, full).replaceAll("\\", "/")}\t${stat.size > TARGET_BYTES ? "needs mobile sheet" : "ok"}`);
    }
  }
}

const rows: string[] = [];
for (const dir of SPRITE_DIRS) {
  try {
    walk(join(ROOT, dir), rows);
  } catch {
    // Optional folder.
  }
}

console.log("Sprite sheet mobile audit");
console.log(rows.sort().reverse().join("\n"));
