const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");
const envSrc = path.join(ROOT, "env.js");
const envDest = path.join(FRONTEND, "env.js");

if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log("Copied env.js into frontend build context.");
} else {
  console.log("No env.js found — using in-app default Firebase config.");
}
