const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");

const packageRoot = path.join(__dirname, "..");

function getBackupRoot() {
  const hash = crypto.createHash("sha256").update(packageRoot).digest("hex").slice(0, 16);
  return path.join(os.tmpdir(), "unified-red-backup-" + hash);
}

const backupRoot = getBackupRoot();

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

function copyBackIfExists(src, dest) {
  try {
    if (fs.existsSync(src)) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        copyRecursive(src, dest);
      } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
      }
      console.log("Restored:", path.relative(backupRoot, src), "->", path.relative(packageRoot, dest));
    }
  } catch (err) {
    console.warn("Postinstall restore warning:", err.message);
  }
}

console.log("POSTINSTALLING...");

copyBackIfExists(path.join(backupRoot, "api", "config.json"), path.join(packageRoot, "api", "config.json"));
copyBackIfExists(path.join(backupRoot, "static"), path.join(packageRoot, "static"));
copyBackIfExists(path.join(backupRoot, "audit"), path.join(packageRoot, "audit"));
copyBackIfExists(path.join(backupRoot, "unified-red.db"), path.join(packageRoot, "unified-red.db"));
copyBackIfExists(path.join(backupRoot, "unified-red-id"), path.join(packageRoot, "unified-red-id"));

console.log("Postinstall restore from ->", backupRoot);
