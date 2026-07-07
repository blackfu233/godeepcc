import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const IGNORE = new Set(["node_modules", ".git", "release"]);
const TARGETS = ["src/assets", "assets", "public/audio", "dist/assets", "dist/audio"];

interface FileEntry {
  path: string;
  bytes: number;
  ext: string;
}

function walk(dir: string, out: FileEntry[]) {
  for (const name of readdirSync(dir)) {
    if (IGNORE.has(name)) continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else {
      const dot = name.lastIndexOf(".");
      out.push({
        path: relative(ROOT, full).replaceAll("\\", "/"),
        bytes: stat.size,
        ext: dot >= 0 ? name.slice(dot).toLowerCase() : "",
      });
    }
  }
}

const files: FileEntry[] = [];
for (const target of TARGETS) {
  try {
    walk(join(ROOT, target), files);
  } catch {
    // Optional folder.
  }
}

const top = [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 40);
const byExt = new Map<string, { count: number; bytes: number }>();
for (const file of files) {
  const bucket = byExt.get(file.ext) ?? { count: 0, bytes: 0 };
  bucket.count += 1;
  bucket.bytes += file.bytes;
  byExt.set(file.ext, bucket);
}

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);
const report = [
  "# Asset Audit",
  "",
  `Total files scanned: ${files.length}`,
  `Total size: ${mb(files.reduce((sum, file) => sum + file.bytes, 0))} MB`,
  "",
  "## By Extension",
  "",
  "| Ext | Count | MB |",
  "|---|---:|---:|",
  ...[...byExt.entries()].sort((a, b) => b[1].bytes - a[1].bytes).map(([ext, data]) => `| ${ext || "(none)"} | ${data.count} | ${mb(data.bytes)} |`),
  "",
  "## Largest Files",
  "",
  "| MB | File |",
  "|---:|---|",
  ...top.map((file) => `| ${mb(file.bytes)} | ${file.path} |`),
  "",
].join("\n");

writeFileSync(join(ROOT, "ASSET_AUDIT_GENERATED.md"), report);
console.log(report);
