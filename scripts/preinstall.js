const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");

const packageRoot = path.join(__dirname, "..");

function getBackupRoot() {
  const hash = crypto.createHash("sha256").update(packageRoot).digest("hex").slice(0, 16);
  return path.join(os.tmpdir(), "unified-red-backup-" + hash);
}

const destRoot = getBackupRoot();

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      copyRecursive(path.join(src, entry.name), path.join(dest, entry.name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function copyIfExists(src, dest) {
  try {
    if (fs.existsSync(src)) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        copyRecursive(src, dest);
      } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
      }
      console.log("Copied:", path.relative(packageRoot, src), "->", dest);
    }
  } catch (err) {
    console.warn("Preinstall copy warning:", err.message);
  }
}

console.log("PREINSTALLING...");
fs.mkdirSync(destRoot, { recursive: true });

copyIfExists(path.join(packageRoot, "api", "config.json"), path.join(destRoot, "api", "config.json"));
copyIfExists(path.join(packageRoot, "static"), path.join(destRoot, "static"));
copyIfExists(path.join(packageRoot, "audit"), path.join(destRoot, "audit"));
copyIfExists(path.join(packageRoot, "unified-red.db"), path.join(destRoot, "unified-red.db"));
copyIfExists(path.join(packageRoot, "unified-red-id"), path.join(destRoot, "unified-red-id"));

console.log("Preinstall backup ->", destRoot);
